/**
 * Tink API Service — Combined AIS + PIS
 *
 * Scopes available: user:create, authorization:grant,
 *                   accounts:read, transactions:read (AIS)
 *                   payment:read, payment:write (PIS)
 *
 * AIS flow (bank connection):
 *  1. getClientToken() — full-scope app token
 *  2. createOrGetTinkUser(externalUserId, market) — create/get Tink user
 *  3. getAuthorizationCode(tinkUserId) — delegate grant
 *  4. buildTinkLinkUrl({ authorizationCode, market }) → connect-accounts URL
 *  5. User connects bank; Tink redirects with ?code=<auth_code>
 *  6. exchangeCodeForToken(code) → { access_token, refresh_token }
 *  7. fetchAccounts(accessToken) → accounts array
 *  8. fetchTransactions(accessToken) → transactions array
 *
 * PIS flow (payment initiation):
 *  1. getPaymentToken() — payment-scoped app token
 *  2. createPaymentRequest({ amount, currency, market, … }) → { id }
 *  3. buildPaymentUrl({ paymentRequestId, market }) → Tink Link pay URL
 *  4. User approves; Tink redirects with ?payment_request_id=<id>
 *  5. getPaymentStatus(paymentRequestId) → transfer status
 */

import fetch from 'node-fetch';

const BASE = process.env.TINK_API_BASE || 'https://api.tink.com';
const CLIENT_ID = process.env.TINK_CLIENT_ID;
const CLIENT_SECRET = process.env.TINK_CLIENT_SECRET;
const REDIRECT_URI = process.env.TINK_REDIRECT_URI;
// PIS redirect goes directly to the frontend — Tink appends ?payment_request_id=X
// The frontend /#/payment-result route reads the query param from window.location.search.
const PIS_REDIRECT_URI = process.env.TINK_PIS_REDIRECT_URI || REDIRECT_URI;

// Tink Link's own client ID — must be used as actor_client_id in delegation
const TINK_LINK_CLIENT_ID = 'df05e4b379934cd09963197cc855bfe9';

// Full scope used for AIS user creation + delegation
const FULL_SCOPE =
  'user:create authorization:grant accounts:read transactions:read providers:read credentials:read credentials:write credentials:refresh payment:read payment:write';

// ─── App-level client token (full AIS + PIS scopes) ──────────────────────────
let _clientToken = null;
let _clientTokenExpiry = 0;

export async function getClientToken() {
  if (_clientToken && Date.now() < _clientTokenExpiry) return _clientToken;

  const body = new URLSearchParams({
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    grant_type: 'client_credentials',
    scope: FULL_SCOPE,
  });

  const res = await fetch(`${BASE}/api/v1/oauth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Tink client token error ${res.status}: ${err}`);
  }

  const data = await res.json();
  _clientToken = data.access_token;
  _clientTokenExpiry = Date.now() + (data.expires_in - 60) * 1000;
  return _clientToken;
}

// ─── Payment-scoped app token (PIS only) ─────────────────────────────────────
let _paymentToken = null;
let _paymentTokenExpiry = 0;

export async function getPaymentToken() {
  if (_paymentToken && Date.now() < _paymentTokenExpiry) return _paymentToken;

  const body = new URLSearchParams({
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    grant_type: 'client_credentials',
    scope: 'payment:read payment:write',
  });

  const res = await fetch(`${BASE}/api/v1/oauth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Tink payment token error ${res.status}: ${err}`);
  }

  const data = await res.json();
  _paymentToken = data.access_token;
  _paymentTokenExpiry = Date.now() + (data.expires_in - 60) * 1000;
  return _paymentToken;
}

// ─── Create or retrieve a Tink platform user ──────────────────────────────────

/**
 * Create a new Tink user (or reuse existing tinkUserId if already known).
 *
 * @param {string} externalUserId - Our own stable identifier for this user
 * @param {string} market
 * @param {string} locale
 * @param {string|null} existingTinkUserId - Pass this if we already created the user before (avoids 409 search)
 * @returns {Promise<string>} Tink platform user_id
 */
export async function createOrGetTinkUser(externalUserId, market = 'EE', locale = 'en_US', existingTinkUserId = null) {
  // If we already have the Tink user_id stored in our session, reuse it directly
  if (existingTinkUserId) {
    console.log('[createOrGetTinkUser] reusing existing tinkUserId:', existingTinkUserId);
    return existingTinkUserId;
  }

  const token = await getClientToken();

  const res = await fetch(`${BASE}/api/v1/user/create`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ external_user_id: externalUserId, market, locale }),
  });

  const text = await res.text();

  if (res.ok) {
    const data = JSON.parse(text);
    console.log('[createOrGetTinkUser] created new tinkUserId:', data.user_id);
    return data.user_id;
  }

  // 409 = user already exists in Tink but we lost track of the user_id.
  // This should only happen if the in-memory store was reset (server restart).
  // We cannot search by external_user_id — instead, create a fresh user with a new external ID.
  if (res.status === 409) {
    console.warn('[createOrGetTinkUser] 409 conflict — creating fresh Tink user with new externalId');
    const freshId = `${externalUserId}-${Date.now()}`;
    const retryRes = await fetch(`${BASE}/api/v1/user/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ external_user_id: freshId, market, locale }),
    });
    const retryText = await retryRes.text();
    if (!retryRes.ok) {
      throw new Error(`Tink user create (retry) error ${retryRes.status}: ${retryText}`);
    }
    const retryData = JSON.parse(retryText);
    console.log('[createOrGetTinkUser] fresh tinkUserId:', retryData.user_id);
    return retryData.user_id;
  }

  console.error('[createOrGetTinkUser] failed', res.status, text);
  throw new Error(`Tink user create error ${res.status}: ${text}`);
}

// ─── Delegate authorization grant ────────────────────────────────────────────

/**
 * Exchange an app client token for a user-scoped authorization code.
 * This code is then passed to Tink Link as the authorization_code parameter.
 */
export async function getAuthorizationCode(tinkUserId) {
  const token = await getClientToken();

  const body = new URLSearchParams({
    user_id: tinkUserId,
    id_hint: 'SeuroPay User',
    // These scopes are delegated TO Tink Link so it can operate on behalf of the user
    scope: 'credentials:read,credentials:refresh,credentials:write,providers:read,user:read,authorization:read,accounts:read,transactions:read',
    actor_client_id: TINK_LINK_CLIENT_ID, // Tink Link's own client ID — NOT our app's ID
    response_type: 'code',
  });

  const res = await fetch(`${BASE}/api/v1/oauth/authorization-grant/delegate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Bearer ${token}`,
    },
    body,
  });

  const text = await res.text();
  if (!res.ok) {
    console.error('[getAuthorizationCode] failed', res.status, text);
    throw new Error(`Tink auth-grant error ${res.status}: ${text}`);
  }

  const data = JSON.parse(text);
  return data.code; // short-lived authorization code
}

// ─── Build Tink Link URL (AIS connect-accounts) ───────────────────────────────

/**
 * Builds the Tink Link connect-accounts URL.
 * Open this URL in the browser; user selects bank and logs in.
 */
export function buildTinkLinkUrl({ authorizationCode, market = 'EE', locale = 'en_US', test = true, state = null }) {
  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    scope: 'user:read,credentials:read',
    market,
    locale,
    authorization_code: authorizationCode,
    test: test ? 'true' : 'false',
  });
  if (state) params.set('state', state);
  return `https://link.tink.com/1.0/credentials/add?${params}`;
}

// ─── Token exchange (AIS user token) ─────────────────────────────────────────

/**
 * Exchange the Tink Link callback code for an access + refresh token pair.
 */
export async function exchangeCodeForToken(code) {
  const body = new URLSearchParams({
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    grant_type: 'authorization_code',
    code,
    // scope must match (subset of) the delegated scope from getAuthorizationCode()
    scope: 'credentials:read,credentials:refresh,credentials:write,providers:read,user:read,authorization:read,accounts:read,transactions:read',
  });

  const res = await fetch(`${BASE}/api/v1/oauth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });

  const text = await res.text();
  if (!res.ok) {
    console.error('[exchangeCodeForToken] failed', res.status, text);
    throw new Error(`Tink token exchange error ${res.status}: ${text}`);
  }

  return JSON.parse(text); // { access_token, refresh_token, expires_in, scope, token_type }
}

/**
 * Grant a user-scoped token directly (no Tink Link actor needed).
 * Used after credentials/add callback which returns credentials_id but no code.
 * Step 1: POST /oauth/authorization-grant  → { code }
 * Step 2: POST /oauth/token (authorization_code) → { access_token }
 */
export async function grantUserToken(tinkUserId) {
  const clientToken = await getClientToken();

  // Step 1: Direct grant (not delegated — our client is the actor)
  const grantRes = await fetch(`${BASE}/api/v1/oauth/authorization-grant`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Bearer ${clientToken}`,
    },
    body: new URLSearchParams({
      user_id: tinkUserId,
      scope: 'accounts:read,transactions:read,credentials:read,user:read',
    }),
  });

  const grantText = await grantRes.text();
  if (!grantRes.ok) {
    console.error('[grantUserToken] grant failed', grantRes.status, grantText);
    throw new Error(`Tink authorization-grant error ${grantRes.status}: ${grantText}`);
  }

  const { code } = JSON.parse(grantText);

  // Step 2: Exchange code for access token
  const tokenRes = await fetch(`${BASE}/api/v1/oauth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      grant_type: 'authorization_code',
      code,
      scope: 'accounts:read,transactions:read,credentials:read,user:read',
    }),
  });

  const tokenText = await tokenRes.text();
  if (!tokenRes.ok) {
    console.error('[grantUserToken] token exchange failed', tokenRes.status, tokenText);
    throw new Error(`Tink token exchange error ${tokenRes.status}: ${tokenText}`);
  }

  return JSON.parse(tokenText); // { access_token, refresh_token, expires_in }
}

/**
 * Refresh a user access token using the refresh token.
 */
export async function refreshUserToken(refreshToken) {
  const body = new URLSearchParams({
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
  });

  const res = await fetch(`${BASE}/api/v1/oauth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });

  const text = await res.text();
  if (!res.ok) {
    console.error('[refreshUserToken] failed', res.status, text);
    throw new Error(`Tink token refresh error ${res.status}: ${text}`);
  }

  return JSON.parse(text);
}

// ─── AIS data fetching ────────────────────────────────────────────────────────

/**
 * Fetch all bank accounts for the authenticated user.
 */
export async function fetchAccounts(accessToken) {
  const res = await fetch(`${BASE}/api/v1/accounts/list`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  const text = await res.text();
  if (!res.ok) {
    console.error('[fetchAccounts] failed', res.status, text);
    throw new Error(`Tink accounts error ${res.status}: ${text}`);
  }

  const data = JSON.parse(text);
  return data.accounts || [];
}

/**
 * Fetch transactions for the authenticated user using the Tink v1 API.
 *
 * Optimisations applied (per Tink integration guidelines):
 *  - accountId filtering: request only one account's transactions at a time
 *  - status filtering: BOOKED | PENDING (default BOOKED — settled transactions only)
 *  - date-range filtering: bookedDateGte / bookedDateLte to cap data volume
 *  - automatic pagination: follows nextPageToken until all pages are consumed
 *  - pageSize cap: never requests more than 1 000 items per page (Tink max)
 *
 * Returns an empty array when the sandbox has no transaction data.
 *
 * @param {string} accessToken
 * @param {object} opts
 * @param {number}       [opts.pageSize=100]       – items per page (max 1000)
 * @param {string|null}  [opts.accountId]          – filter by account id
 * @param {string}       [opts.status='BOOKED']    – BOOKED | PENDING | ALL
 * @param {string|null}  [opts.dateFrom]           – ISO date yyyy-mm-dd (inclusive)
 * @param {string|null}  [opts.dateTo]             – ISO date yyyy-mm-dd (inclusive)
 */
export async function fetchTransactions(accessToken, {
  pageSize = 100,
  accountId = null,
  status = 'BOOKED',
  dateFrom = null,
  dateTo = null,
} = {}) {
  const allTxs = [];
  let pageToken = null;
  const maxPageSize = Math.min(pageSize, 1000);

  // Default date range: last 90 days (avoids pulling years of history)
  const defaultFrom = new Date(Date.now() - 90 * 86_400_000)
    .toISOString()
    .split('T')[0];

  do {
    const params = new URLSearchParams({ pageSize: String(maxPageSize) });
    if (accountId)                    params.set('accountId',      accountId);
    if (status && status !== 'ALL')   params.set('status',         status);

    // Date filtering (use explicit range if provided, else default to last 90 days)
    const from = dateFrom ?? defaultFrom;
    const to   = dateTo   ?? null;
    if (from) params.set('bookedDateGte', from);
    if (to)   params.set('bookedDateLte', to);

    // Pagination token for subsequent pages
    if (pageToken) params.set('pageToken', pageToken);

    const res = await fetch(`${BASE}/api/v1/transactions?${params}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!res.ok) {
      const errText = await res.text();
      console.warn('[fetchTransactions] failed', res.status, errText);
      break;
    }

    const data = await res.json();

    // v1 returns either a plain array or { transactions: [], nextPageToken: '' }
    const page = Array.isArray(data)
      ? data
      : (data.transactions || data.results || []);

    allTxs.push(...page);

    // Advance pagination — Tink returns nextPageToken in the body when there are more pages
    pageToken = Array.isArray(data) ? null : (data.nextPageToken || null);

    console.log(
      `[fetchTransactions] page → ${page.length} txs` +
      (pageToken ? ` (nextPageToken present, fetching more…)` : ' (done)')
    );

    // Safety guard: stop if a page comes back empty to avoid infinite loops
    if (page.length === 0) break;

  } while (pageToken);

  console.log(
    `[fetchTransactions] total fetched: ${allTxs.length} transactions` +
    (accountId ? ` for account ${accountId}` : '') +
    (status && status !== 'ALL' ? ` [${status}]` : '')
  );

  return allTxs;
}

/**
 * Create a Tink payment request.
 *
 * @param {object} opts
 * @param {number}  opts.amount        - Amount in major currency units (e.g. 12.50)
 * @param {string}  opts.currency      - ISO 4217, e.g. 'EUR'
 * @param {string}  opts.market        - ISO 3166-1 alpha-2, e.g. 'EE'
 * @param {string}  opts.recipientName - Display name for the payee
 * @param {string}  opts.message       - Remittance / reference message
 * @param {string}  [opts.iban]        - Beneficiary IBAN (uses demo IBAN if omitted)
 * @param {string}  [opts.accountType] - Account type string (default 'iban')
 * @returns {Promise<{ id: string }>}
 */
export async function createPaymentRequest({
  amount,
  currency = 'EUR',
  market = 'EE',
  recipientName = 'SeuroPay',
  message = 'SeuroPay P2P payment',
  iban = null,
  accountType = 'iban',
} = {}) {
  const token = await getPaymentToken();

  // Use a plausible demo IBAN if none provided
  const accountNumber = iban || 'EE471000001020145685';

  const body = {
    destinations: [
      {
        accountNumber,
        type: accountType,
      },
    ],
    amount: Number(amount),      // Tink expects a number (e.g. 10.50)
    currency,
    market,
    recipientName,
    sourceMessage: message,
    remittanceInformation: {
      type: 'UNSTRUCTURED',
      value: message,
    },
  };

  const res = await fetch(`${BASE}/api/v1/payments/requests`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  const text = await res.text();

  if (!res.ok) {
    console.error('[createPaymentRequest] failed', res.status, text);
    throw new Error(`Tink payment request error ${res.status}: ${text}`);
  }

  return JSON.parse(text); // { id, amount, currency, market, ... }
}

/**
 * Build the Tink Link pay URL for payment initiation.
 * This uses the /1.0/pay/ product which matches our app's scopes.
 */
export function buildPaymentUrl({ paymentRequestId, market = 'EE', locale = 'en_US', sessionId = null }) {
  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    redirect_uri: PIS_REDIRECT_URI,
    market,
    locale,
    payment_request_id: paymentRequestId,
    test: 'true',               // enable demo/sandbox banks in Tink Link
  });
  if (sessionId) params.set('state', sessionId);
  return `https://link.tink.com/1.0/pay/?${params}`;
}

/**
 * Get the transfer status for a payment request.
 * Called after Tink redirects back with payment_request_id.
 */
export async function getPaymentStatus(paymentRequestId) {
  const token = await getPaymentToken();

  const res = await fetch(
    `${BASE}/api/v1/payments/requests/${paymentRequestId}/transfers`,
    { headers: { Authorization: `Bearer ${token}` } }
  );

  const text = await res.text();
  if (!res.ok) {
    console.error('[getPaymentStatus] failed', res.status, text);
    throw new Error(`Tink payment status error ${res.status}: ${text}`);
  }
  return JSON.parse(text); // { paymentRequestCreatedTransfers: [...] }
}
