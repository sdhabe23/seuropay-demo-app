/**
 * Tink routes — combined AIS (bank connection) + PIS (payment initiation)
 *
 * AIS routes:
 *   GET  /api/tink/link           → build connect-accounts URL
 *   GET  /api/tink/callback       → handle both AIS code AND payment_request_id
 *   GET  /api/tink/accounts       → fetch linked accounts (with token refresh)
 *   GET  /api/tink/transactions   → fetch linked transactions
 *   POST /api/tink/disconnect     → unlink bank account
 *   GET  /api/tink/status         → session info (linked state, payments)
 *
 * PIS routes:
 *   POST /api/tink/pay            → create payment request → Tink pay URL
 *   GET  /api/tink/payment-status → poll payment transfer status
 */

import { Router } from 'express';
import {
  getClientToken,
  createOrGetTinkUser,
  getAuthorizationCode,
  buildTinkLinkUrl,
  exchangeCodeForToken,
  grantUserToken,
  refreshUserToken,
  fetchAccounts,
  fetchTransactions,
  createPaymentRequest,
  buildPaymentUrl,
  getPaymentStatus,
} from '../tinkService.js';
import { users, saveStore } from '../store.js';

const router = Router();

// ─── Demo transaction generator ──────────────────────────────────────────────
// Generates realistic-looking transactions for sandbox accounts that don't
// return transaction data from the Tink API.

const DEMO_MERCHANTS = [
  { name: 'Rimi Supermarket', type: 'DEBIT', category: 'Groceries', minAmt: 8, maxAmt: 95 },
  { name: 'Bolt Ride', type: 'DEBIT', category: 'Transport', minAmt: 3, maxAmt: 22 },
  { name: 'Tallinn Kohvik', type: 'DEBIT', category: 'Food & Drink', minAmt: 4, maxAmt: 28 },
  { name: 'Selver', type: 'DEBIT', category: 'Groceries', minAmt: 12, maxAmt: 80 },
  { name: 'Elektrilevi', type: 'DEBIT', category: 'Utilities', minAmt: 45, maxAmt: 120 },
  { name: 'Telia Estonia', type: 'DEBIT', category: 'Telecoms', minAmt: 18, maxAmt: 45 },
  { name: 'Salary', type: 'CREDIT', category: 'Income', minAmt: 1800, maxAmt: 3200 },
  { name: 'Netflix', type: 'DEBIT', category: 'Entertainment', minAmt: 14, maxAmt: 18 },
  { name: 'Apollo Kino', type: 'DEBIT', category: 'Entertainment', minAmt: 10, maxAmt: 30 },
  { name: 'Wise Transfer', type: 'CREDIT', category: 'Transfer', minAmt: 50, maxAmt: 500 },
  { name: 'Maxima', type: 'DEBIT', category: 'Groceries', minAmt: 6, maxAmt: 55 },
  { name: 'Wolt', type: 'DEBIT', category: 'Food & Drink', minAmt: 12, maxAmt: 35 },
  { name: 'Citybee', type: 'DEBIT', category: 'Transport', minAmt: 5, maxAmt: 18 },
  { name: 'Prisma', type: 'DEBIT', category: 'Groceries', minAmt: 20, maxAmt: 110 },
  { name: 'ATM Withdrawal', type: 'DEBIT', category: 'Cash', minAmt: 20, maxAmt: 200 },
  { name: 'Amazon', type: 'DEBIT', category: 'Shopping', minAmt: 15, maxAmt: 150 },
  { name: 'Spotify', type: 'DEBIT', category: 'Entertainment', minAmt: 10, maxAmt: 10 },
  { name: 'SeuroPay P2P', type: 'CREDIT', category: 'Transfer', minAmt: 10, maxAmt: 200 },
];

function rng(seed) {
  // Simple deterministic pseudo-random from seed
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

function generateDemoTransactions(accounts) {
  if (!accounts || accounts.length === 0) return [];
  const txs = [];
  const now = Date.now();

  accounts.forEach((acc, accIdx) => {
    // Seed based on account id so same account always gets same transactions
    const rand = rng(acc.id ? acc.id.split('').reduce((a, c) => a + c.charCodeAt(0), accIdx) : accIdx + 1);
    const txCount = acc.type === 'SAVINGS' ? 5 : 20;

    for (let i = 0; i < txCount; i++) {
      const merchant = DEMO_MERCHANTS[Math.floor(rand() * DEMO_MERCHANTS.length)];
      const daysAgo = Math.floor(rand() * 90); // last 90 days
      const date = new Date(now - daysAgo * 86400000 - rand() * 86400000);
      const rawAmt = merchant.minAmt + rand() * (merchant.maxAmt - merchant.minAmt);
      const amt = Math.round(rawAmt * 100); // in cents as unscaledValue, scale=-2
      const sign = merchant.type === 'CREDIT' ? 1 : -1;

      txs.push({
        id: `demo-${acc.id}-${i}`,
        accountId: acc.id,
        amount: {
          unscaledValue: String(sign * amt),
          scale: '-2',
          currencyCode: acc.currencyDenominatedBalance?.currencyCode || acc.currencyCode || 'EUR',
        },
        descriptions: {
          display: merchant.name,
          original: merchant.name.toUpperCase(),
        },
        dates: {
          booked: date.toISOString(),
          value: date.toISOString(),
        },
        status: 'BOOKED',
        merchantInformation: {
          merchantName: merchant.type === 'CREDIT' ? null : merchant.name,
        },
        categories: { pfm: { name: merchant.category } },
      });
    }
  });

  // Sort newest first
  txs.sort((a, b) => new Date(b.dates.booked) - new Date(a.dates.booked));
  return txs;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function ensureUser(session) {
  if (!users.has(session.id)) {
    users.set(session.id, {
      sessionId: session.id,
      displayName: 'SeuroPay User',
      externalUserId: `seuropay-${session.id}`,
      tinkUserId: null,
      accessToken: null,
      refreshToken: null,
      tokenExpiry: 0,
      linkedAccounts: [],
      payments: [],
      createdAt: Date.now(),
    });
  }
  return users.get(session.id);
}

/**
 * Get a valid user-scoped access token, refreshing if expired.
 * If token is null but tinkUserId exists, tries to re-grant via authorization-grant.
 * Returns null if the user has no token (not linked).
 */
async function getUserToken(user) {
  if (!user.accessToken) {
    // Auto-recover: if we have a tinkUserId, we can get a fresh token
    if (user.tinkUserId) {
      try {
        console.log('[getUserToken] accessToken null, auto-recovering via grantUserToken for', user.tinkUserId);
        const tokens = await grantUserToken(user.tinkUserId);
        user.accessToken = tokens.access_token;
        user.refreshToken = tokens.refresh_token || null;
        user.tokenExpiry = Date.now() + ((tokens.expires_in || 3600) - 60) * 1000;
        // Also refresh cached accounts if empty
        if (!user.linkedAccounts || user.linkedAccounts.length === 0) {
          try {
            user.linkedAccounts = await fetchAccounts(user.accessToken);
            console.log('[getUserToken] auto-cached', user.linkedAccounts.length, 'accounts');
          } catch (e) { console.warn('[getUserToken] account fetch failed:', e.message); }
        }
        saveStore();
        console.log('[getUserToken] auto-recovery OK');
        return user.accessToken;
      } catch (err) {
        console.error('[getUserToken] auto-recovery failed:', err.message);
        return null;
      }
    }
    return null;
  }
  if (Date.now() < user.tokenExpiry - 30_000) return user.accessToken;
  if (!user.refreshToken) {
    // Try re-grant before giving up
    if (user.tinkUserId) {
      try {
        const tokens = await grantUserToken(user.tinkUserId);
        user.accessToken = tokens.access_token;
        user.refreshToken = tokens.refresh_token || null;
        user.tokenExpiry = Date.now() + ((tokens.expires_in || 3600) - 60) * 1000;
        saveStore();
        return user.accessToken;
      } catch (err) {
        console.error('[getUserToken] re-grant failed:', err.message);
      }
    }
    return null;
  }

  try {
    const tokens = await refreshUserToken(user.refreshToken);
    user.accessToken = tokens.access_token;
    user.refreshToken = tokens.refresh_token || user.refreshToken;
    user.tokenExpiry = Date.now() + (tokens.expires_in - 60) * 1000;
    saveStore();
    return user.accessToken;
  } catch (err) {
    console.error('[getUserToken] refresh failed:', err.message);
    user.accessToken = null;
    user.refreshToken = null;
    user.tokenExpiry = 0;
    return null;
  }
}

// ─── GET /api/tink/link ───────────────────────────────────────────────────────
// Initiates the AIS bank-connection flow.
// Creates (or reuses) a Tink user, gets a delegation code, returns the
// connect-accounts Tink Link URL for the frontend to redirect to.
//
// Query: ?market=EE&locale=en_US&session=<sessionId>
router.get('/link', async (req, res) => {
  const market = req.query.market || 'EE';
  const locale = req.query.locale || 'en_US';

  // Support ?session= param (same pattern as all other routes)
  const sessionId = req.query.session || req.session.id;
  let user = users.get(sessionId);
  if (!user) {
    // Create user record keyed by the provided session id
    user = {
      sessionId,
      displayName: 'SeuroPay User',
      externalUserId: `seuropay-${sessionId}`,
      tinkUserId: null,
      accessToken: null,
      refreshToken: null,
      tokenExpiry: 0,
      linkedAccounts: [],
      payments: [],
      createdAt: Date.now(),
    };
    users.set(sessionId, user);
  }

  try {

    // Step 1: Create or reuse Tink user (pass existing tinkUserId to avoid 409 search)
    const tinkUserId = await createOrGetTinkUser(user.externalUserId, market, locale, user.tinkUserId || null);
    user.tinkUserId = tinkUserId;
    console.log('[tink/link] tinkUserId:', tinkUserId);
    saveStore();

    // Step 2: Delegate authorization code
    const authorizationCode = await getAuthorizationCode(tinkUserId);
    console.log('[tink/link] authorizationCode:', authorizationCode?.substring(0, 20) + '…');

    // Step 3: Build Tink Link connect-accounts URL
    const tinkUrl = buildTinkLinkUrl({
      authorizationCode,
      market,
      locale,
      test: true,
      state: sessionId,
    });

    res.json({ tinkUrl, market });
  } catch (err) {
    console.error('[tink/link]', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ─── GET /api/tink/callback ───────────────────────────────────────────────────
// Tink redirects here after both AIS bank-connection AND PIS payment flows.
// Disambiguate by presence of ?code (AIS) vs ?payment_request_id (PIS).
router.get('/callback', async (req, res) => {
  const { code, payment_request_id, error, message: errMessage, state } = req.query;
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

  // ── Error from Tink ──────────────────────────────────────────────────────
  if (error) {
    console.error('[tink/callback] error from Tink:', error, errMessage);
    const dest = payment_request_id
      ? `${frontendUrl}/#/payment-result?error=${encodeURIComponent(errMessage || error)}`
      : `${frontendUrl}/#/link-bank?tink_error=${encodeURIComponent(errMessage || error)}`;
    return res.redirect(dest);
  }

  // ── AIS callback — exchange code for user token ──────────────────────────
  if (code) {
    try {
      console.log('[tink/callback] AIS start — state:', state, '| session.id:', req.session.id);
      console.log('[tink/callback] users in store:', [...users.keys()]);

      const tokens = await exchangeCodeForToken(code);
      console.log('[tink/callback] token exchange OK — access_token length:', tokens.access_token?.length);

      // Resolve session: state param contains sessionId set in buildTinkLinkUrl
      let sessionId = req.session.id;
      if (state && users.has(state)) {
        sessionId = state;
        console.log('[tink/callback] resolved session from state param:', sessionId);
      } else if (state) {
        sessionId = state;
        console.log('[tink/callback] state not in users map, using state as sessionId:', sessionId);
      } else {
        console.log('[tink/callback] no state param, using session.id:', sessionId);
      }

      let user = users.get(sessionId);
      if (!user) {
        console.log('[tink/callback] no user found for sessionId, creating new record');
        // Fallback: create user entry
        user = {
          sessionId,
          displayName: 'SeuroPay User',
          externalUserId: `seuropay-${sessionId}`,
          tinkUserId: null,
          accessToken: null,
          refreshToken: null,
          tokenExpiry: 0,
          linkedAccounts: [],
          payments: [],
          createdAt: Date.now(),
        };
        users.set(sessionId, user);
      }

      user.accessToken = tokens.access_token;
      user.refreshToken = tokens.refresh_token || null;
      user.tokenExpiry = Date.now() + ((tokens.expires_in || 3600) - 60) * 1000;

      // Immediately fetch accounts and cache them
      try {
        const accounts = await fetchAccounts(user.accessToken);
        user.linkedAccounts = accounts;
        console.log(`[tink/callback] linked ${accounts.length} accounts for session ${sessionId}`);
      } catch (accErr) {
        console.warn('[tink/callback] could not fetch accounts:', accErr.message);
      }
      saveStore();
      console.log('[tink/callback] saveStore done — redirecting to frontend');

      return res.redirect(`${frontendUrl}/#/link-bank?tink_success=1`);
    } catch (err) {
      console.error('[tink/callback AIS]', err.message);
      return res.redirect(`${frontendUrl}/#/link-bank?tink_error=${encodeURIComponent(err.message)}`);
    }
  }

  // ── PIS callback — payment_request_id ────────────────────────────────────
  if (payment_request_id) {
    try {
      const statusData = await getPaymentStatus(payment_request_id);
      const transfers = statusData.paymentRequestCreatedTransfers || [];
      const status = transfers[0]?.status || 'PENDING';

      // Update cached payment record
      let sessionId = req.session.id;
      if (state && users.has(state)) sessionId = state;
      const user = users.get(sessionId);
      if (user) {
        const p = (user.payments || []).find((p) => p.id === payment_request_id);
        if (p) p.status = status;
      }

      return res.redirect(
        `${frontendUrl}/#/payment-result?payment_request_id=${payment_request_id}&status=${encodeURIComponent(status)}`
      );
    } catch (err) {
      console.error('[tink/callback PIS]', err.message);
      return res.redirect(
        `${frontendUrl}/#/payment-result?payment_request_id=${payment_request_id}&status=PENDING`
      );
    }
  }

  // ── credentials/add callback — credentials_id returned, no code ─────────
  // Tink's credentials/add flow does NOT return a ?code — it just returns
  // credentials_id confirming the bank was connected. We use the stored
  // tinkUserId to get a fresh user token via direct authorization-grant.
  const credentialsId = req.query.credentials_id;
  if (credentialsId || state) {
    try {
      const sessionId = (state && users.has(state)) ? state : req.session.id;
      const user = users.get(sessionId);

      if (!user) {
        console.error('[tink/callback] no user found for session:', sessionId);
        return res.redirect(`${frontendUrl}/#/link-bank?tink_error=${encodeURIComponent('Session not found')}`);
      }

      if (!user.tinkUserId) {
        console.error('[tink/callback] user has no tinkUserId');
        return res.redirect(`${frontendUrl}/#/link-bank?tink_error=${encodeURIComponent('No Tink user found')}`);
      }

      console.log('[tink/callback] credentials_id flow — tinkUserId:', user.tinkUserId);
      const tokens = await grantUserToken(user.tinkUserId);
      console.log('[tink/callback] grantUserToken OK — token length:', tokens.access_token?.length);

      user.accessToken = tokens.access_token;
      user.refreshToken = tokens.refresh_token || null;
      user.tokenExpiry = Date.now() + ((tokens.expires_in || 3600) - 60) * 1000;

      try {
        const accounts = await fetchAccounts(user.accessToken);
        user.linkedAccounts = accounts;
        console.log(`[tink/callback] fetched ${accounts.length} accounts for session ${sessionId}`);
      } catch (accErr) {
        console.warn('[tink/callback] could not fetch accounts:', accErr.message);
      }

      saveStore();
      return res.redirect(`${frontendUrl}/#/link-bank?tink_success=1`);
    } catch (err) {
      console.error('[tink/callback credentials_id]', err.message);
      return res.redirect(`${frontendUrl}/#/link-bank?tink_error=${encodeURIComponent(err.message)}`);
    }
  }

  // Truly unknown callback
  console.warn('[tink/callback] unknown params:', JSON.stringify(req.query));
  return res.redirect(`${frontendUrl}/#/link-bank?tink_error=${encodeURIComponent('Unknown callback from Tink')}`);
});

// ─── GET /api/tink/accounts ───────────────────────────────────────────────────
// Returns cached accounts or fetches fresh ones if needed.
// Query: ?session=<sessionId>
router.get('/accounts', async (req, res) => {
  const sessionId = req.query.session || req.session.id;
  const user = users.get(sessionId);

  if (!user) return res.json({ linked: false, accounts: [] });

  const token = await getUserToken(user);
  if (!token) return res.json({ linked: false, accounts: [] });

  try {
    // Refresh from API
    const accounts = await fetchAccounts(token);
    user.linkedAccounts = accounts;
    res.json({ linked: true, accounts });
  } catch (err) {
    console.error('[tink/accounts]', err.message);
    // Return cached if available
    if (user.linkedAccounts?.length > 0) {
      return res.json({ linked: true, accounts: user.linkedAccounts });
    }
    res.status(500).json({ error: err.message });
  }
});

// ─── GET /api/tink/transactions ───────────────────────────────────────────────
// Fetches transactions for the linked user with full optimisation:
//   • accountId  — server-side account filtering (passed straight to Tink)
//   • status     — BOOKED | PENDING | ALL  (default: BOOKED)
//   • dateFrom   — yyyy-mm-dd lower bound  (default: last 90 days)
//   • dateTo     — yyyy-mm-dd upper bound  (default: today)
//   • bust       — set to 1 to bypass the 5-min transaction cache
//
// Incremental-sync cache:
//   Tink transactions are expensive to fetch (paginated, per-account).
//   We cache the result in user.txCache[cacheKey] for CACHE_TTL_MS.
//   The cache is keyed by (accountId|ALL)+(status)+(dateFrom)+(dateTo) so
//   different filter combinations are stored independently.
//
// If Tink returns no data (sandbox limitation), deterministic demo transactions
// are generated and returned instead — they are NOT cached so fresh data from
// a real bank always takes priority.
//
// Query: ?session=<sid>&pageSize=100&accountId=<id>&status=BOOKED&dateFrom=yyyy-mm-dd&dateTo=yyyy-mm-dd&bust=0
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

router.get('/transactions', async (req, res) => {
  const sessionId = req.query.session || req.session.id;
  const pageSize  = parseInt(req.query.pageSize || '100', 10);
  const accountId = req.query.accountId || null;
  const status    = req.query.status    || 'BOOKED';   // BOOKED | PENDING | ALL
  const dateFrom  = req.query.dateFrom  || null;        // yyyy-mm-dd
  const dateTo    = req.query.dateTo    || null;        // yyyy-mm-dd
  const bustCache = req.query.bust === '1';

  const user = users.get(sessionId);
  if (!user) return res.json({ linked: false, transactions: [] });

  const token = await getUserToken(user);
  if (!token) return res.json({ linked: false, transactions: [] });

  // ── Cache key ────────────────────────────────────────────────────────────
  const cacheKey = [accountId || 'ALL', status, dateFrom || 'default', dateTo || 'today'].join('|');
  user.txCache = user.txCache || {};

  const cached = user.txCache[cacheKey];
  if (!bustCache && cached && (Date.now() - cached.fetchedAt) < CACHE_TTL_MS && cached.transactions.length > 0) {
    console.log(`[tink/transactions] cache HIT for key="${cacheKey}" (${cached.transactions.length} txs, age=${Math.round((Date.now() - cached.fetchedAt) / 1000)}s)`);
    return res.json({ linked: true, transactions: cached.transactions, fromCache: true });
  }

  // ── Fetch from Tink ──────────────────────────────────────────────────────
  let transactions = [];
  try {
    transactions = await fetchTransactions(token, { pageSize, accountId, status, dateFrom, dateTo });
  } catch (err) {
    console.error('[tink/transactions]', err.message);
  }

  if (transactions.length > 0) {
    // Store in cache and persist
    user.txCache[cacheKey] = { transactions, fetchedAt: Date.now() };
    saveStore();
    return res.json({ linked: true, transactions });
  }

  // ── Sandbox fallback — generate deterministic demo transactions ───────────
  const accounts = accountId
    ? (user.linkedAccounts || []).filter(a => a.id === accountId)
    : (user.linkedAccounts || []);
  const demoTx = generateDemoTransactions(accounts);

  // Prepend any real simulated transfers (from /api/tink/transfer) so they
  // appear at the top of the history list.
  const simulated = (user.simulatedTransactions || []).filter(t =>
    !accountId || t.accountId === accountId
  );
  const allTx = [...simulated, ...demoTx];

  console.log(`[tink/transactions] ${simulated.length} simulated + ${demoTx.length} demo = ${allTx.length} total`);
  res.json({ linked: true, transactions: allTx, isDemo: true });
});

// ─── POST /api/tink/disconnect ────────────────────────────────────────────────
// Unlinks the bank account — clears tokens and cached data.
router.post('/disconnect', (req, res) => {
  const sessionId = req.query.session || req.session.id;
  const user = users.get(sessionId);

  if (user) {
    user.accessToken = null;
    user.refreshToken = null;
    user.tokenExpiry = 0;
    user.linkedAccounts = [];
    user.tinkUserId = null;
    saveStore();
  }

  res.json({ ok: true });
});

// ─── GET /api/tink/status ─────────────────────────────────────────────────────
// Returns session state: linked flag, accounts count, payments.
router.get('/status', async (req, res) => {
  const sessionId = req.query.session || req.session.id;
  const user = users.get(sessionId);

  if (!user) {
    return res.json({
      sessionId: sessionId || req.session.id,
      linked: false,
      accounts: [],
      payments: [],
    });
  }

  // Check if token is still valid (or refreshable)
  const token = await getUserToken(user).catch(() => null);

  res.json({
    sessionId,
    linked: !!token,
    accounts: user.linkedAccounts || [],
    payments: user.payments || [],
  });
});

// ─── POST /api/tink/pay ───────────────────────────────────────────────────────
// Creates a Tink payment request and returns the Tink Link pay URL.
// Body: { amount, currency?, market?, recipientName?, message?, iban? }
router.post('/pay', async (req, res) => {
  try {
    const {
      amount,
      currency = 'EUR',
      market = 'EE',
      recipientName = 'SeuroPay',
      message = 'SeuroPay payment',
      iban,
    } = req.body;

    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      return res.status(400).json({ error: 'amount is required and must be a positive number' });
    }

    const paymentRequest = await createPaymentRequest({
      amount: Number(amount),
      currency,
      market,
      recipientName,
      message,
      iban,
    });

    const user = ensureUser(req.session);
    user.payments = user.payments || [];
    user.payments.push({
      id: paymentRequest.id,
      amount: Number(amount),
      currency,
      market,
      message,
      status: 'PENDING',
      createdAt: Date.now(),
    });

    const tinkUrl = buildPaymentUrl({
      paymentRequestId: paymentRequest.id,
      market,
      locale: req.body.locale || 'en_US',
      sessionId: req.session.id,
    });

    res.json({ paymentRequestId: paymentRequest.id, tinkUrl });
  } catch (err) {
    console.error('[tink/pay]', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ─── POST /api/tink/transfer ─────────────────────────────────────────────────
// Simulated instant bank transfer — no Tink Link redirect required.
// Deducts from the source account balance, credits destination, records a
// SETTLED transaction in the user's local store. Fires a WS notification.
//
// Body: { amount, sourceAccountId?, message? }
// The destination is always hardcoded to Checking Account 2 (EE468233973006396045).
router.post('/transfer', async (req, res) => {
  const sessionId = req.query.session || req.session.id;
  const user = users.get(sessionId);
  if (!user) return res.status(401).json({ error: 'Session not found — please reload' });

  const { amount, sourceAccountId, message = 'SeuroPay bank transfer' } = req.body;
  const num = Number(amount);
  if (!num || num <= 0) return res.status(400).json({ error: 'amount must be a positive number' });

  const DEST_IBAN = 'EE468233973006396045';
  const DEST_NAME = 'SeuroPay Checking Account 2';

  // Find source account
  const accounts = user.linkedAccounts || [];
  const src = sourceAccountId
    ? accounts.find(a => a.id === sourceAccountId || a.accountNumber === sourceAccountId)
    : accounts.find(a => a.accountNumber !== DEST_IBAN); // first non-dest

  if (!src) return res.status(400).json({ error: 'Source account not found' });

  const srcBalance = typeof src.balance === 'number' ? src.balance : parseFloat(src.balance ?? '0');
  if (srcBalance < num) {
    return res.status(400).json({ error: `Insufficient funds (balance: €${srcBalance.toFixed(2)})` });
  }

  // Debit source
  src.balance = Math.round((srcBalance - num) * 100) / 100;

  // Credit destination (if we hold it locally)
  const dest = accounts.find(a => a.accountNumber === DEST_IBAN);
  if (dest) {
    const destBalance = typeof dest.balance === 'number' ? dest.balance : parseFloat(dest.balance ?? '0');
    dest.balance = Math.round((destBalance + num) * 100) / 100;
  }

  // Build a settled transaction record
  const txId = `tx-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const now = new Date().toISOString();
  const tx = {
    id: txId,
    accountId: src.id,
    amount: -num,
    currencyCode: 'EUR',
    description: `${DEST_NAME} — ${message}`,
    dates: { booked: now, value: now },
    status: 'BOOKED',
    type: 'TRANSFER',
    merchantInformation: { merchantName: DEST_NAME },
    categories: { pfm: { name: 'Transfer' } },
  };

  user.simulatedTransactions = user.simulatedTransactions || [];
  user.simulatedTransactions.unshift(tx);

  // Also record as a payment
  user.payments = user.payments || [];
  user.payments.unshift({
    id: txId,
    amount: num,
    currency: 'EUR',
    toIban: DEST_IBAN,
    toName: DEST_NAME,
    fromAccount: src.name || src.accountNumber,
    message,
    status: 'SETTLED',
    createdAt: Date.now(),
  });

  saveStore();
  console.log(`[tink/transfer] €${num} from ${src.accountNumber} → ${DEST_IBAN} (session: ${sessionId})`);

  res.json({
    success: true,
    transactionId: txId,
    amount: num,
    currency: 'EUR',
    fromAccount: src.name || src.accountNumber,
    toAccount: DEST_NAME,
    toIban: DEST_IBAN,
    message,
    newSourceBalance: src.balance,
    settledAt: now,
  });
});

// ─── GET /api/tink/payment-status ────────────────────────────────────────────
// Query: ?id=<payment_request_id>
router.get('/payment-status', async (req, res) => {
  const { id } = req.query;
  if (!id) return res.status(400).json({ error: 'id query param required' });

  try {
    const data = await getPaymentStatus(id);
    const transfers = data.paymentRequestCreatedTransfers || [];
    const status = transfers[0]?.status || 'PENDING';
    res.json({ paymentRequestId: id, status, transfers });
  } catch (err) {
    console.error('[tink/payment-status]', err.message);
    res.status(500).json({ error: err.message });
  }
});

export default router;

