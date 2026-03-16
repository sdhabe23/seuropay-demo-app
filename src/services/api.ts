/**
 * SeuroPay Backend API client
 *
 * All fetch calls go through this module so the base URL is centralised.
 * The backend URL defaults to the same origin in production (reverse-proxied)
 * and to localhost:4000 in dev.
 */

// In dev the Vite proxy forwards /api/* → localhost:4000
// In production the nginx/Caddy proxy does the same.
const BASE =
  import.meta.env.VITE_API_BASE ||
  (import.meta.env.DEV ? 'http://localhost:4000' : '');

const opts: RequestInit = { credentials: 'include' };

// ─── Helpers ─────────────────────────────────────────────────────────────────

function sessionParam(): string {
  const sid = localStorage.getItem('seuropay_session_id');
  return sid ? `?session=${encodeURIComponent(sid)}` : '';
}

async function api<T = unknown>(
  path: string,
  init: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...opts,
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init.headers ?? {}),
    },
  });
  if (!res.ok) {
    let msg = `${res.status} ${res.statusText}`;
    try { const e = await res.json(); msg = e.error || msg; } catch {}
    throw new Error(msg);
  }
  return res.json();
}

// ─── Session ─────────────────────────────────────────────────────────────────

export async function initSession(displayName?: string): Promise<{
  sessionId: string;
  displayName: string;
  linked: boolean;
}> {
  // Pass the stored sessionId so the backend can restore the same user record
  // across server restarts (instead of generating a new session).
  const storedSessionId = localStorage.getItem('seuropay_session_id') ?? undefined;
  const data = await api<{ sessionId: string; displayName: string; linked: boolean }>(
    '/api/users/session',
    { method: 'POST', body: JSON.stringify({ displayName, sessionId: storedSessionId }) }
  );
  localStorage.setItem('seuropay_session_id', data.sessionId);
  return data;
}

export async function getMe() {
  return api(`/api/users/me${sessionParam()}`);
}

// ─── Tink AIS — Bank Connection ───────────────────────────────────────────────

/**
 * Get the Tink Link connect-accounts URL for linking a bank.
 * The caller should redirect (window.location.href) to the returned tinkUrl.
 */
export async function getTinkLinkUrl(market = 'EE', locale = 'en_US'): Promise<{
  tinkUrl: string;
  market: string;
}> {
  const sid = localStorage.getItem('seuropay_session_id');
  const qs = new URLSearchParams({ market, locale });
  if (sid) qs.set('session', sid);
  return api(`/api/tink/link?${qs}`);
}

/**
 * Fetch linked bank accounts.
 */
export async function getAccounts(): Promise<{
  linked: boolean;
  accounts: BankAccount[];
}> {
  return api(`/api/tink/accounts${sessionParam()}`);
}

/**
 * Fetch bank transactions for the linked account.
 *
 * @param pageSize   Max items to fetch (default 100; Tink hard-caps at 1000 per page)
 * @param accountId  Filter to a specific account (undefined = all accounts)
 * @param status     'BOOKED' | 'PENDING' | 'ALL'  (default 'BOOKED')
 * @param dateFrom   Lower bound yyyy-mm-dd (default: server applies last-90-days)
 * @param dateTo     Upper bound yyyy-mm-dd (default: today)
 * @param bust       true = skip the server-side 5-min cache
 */
export async function getTransactions(
  pageSize = 100,
  accountId?: string,
  status: 'BOOKED' | 'PENDING' | 'ALL' = 'BOOKED',
  dateFrom?: string,
  dateTo?: string,
  bust = false,
): Promise<{
  linked: boolean;
  transactions: BankTransaction[];
  fromCache?: boolean;
  isDemo?: boolean;
}> {
  const sid = localStorage.getItem('seuropay_session_id');
  const qs = new URLSearchParams({ pageSize: String(pageSize), status });
  if (sid)        qs.set('session',   sid);
  if (accountId)  qs.set('accountId', accountId);
  if (dateFrom)   qs.set('dateFrom',  dateFrom);
  if (dateTo)     qs.set('dateTo',    dateTo);
  if (bust)       qs.set('bust',      '1');
  return api(`/api/tink/transactions?${qs}`);
}

/**
 * Disconnect the linked bank account.
 */
export async function disconnectBank(): Promise<{ ok: boolean }> {
  return api(`/api/tink/disconnect${sessionParam()}`, { method: 'POST' });
}

/**
 * Get current Tink status: linked flag, accounts, payments.
 */
export async function getTinkStatus(): Promise<{
  sessionId: string;
  linked: boolean;
  accounts: BankAccount[];
  payments: TinkPayment[];
}> {
  return api(`/api/tink/status${sessionParam()}`);
}

// ─── Tink PIS — Payment Initiation ───────────────────────────────────────────

/**
 * Create a Tink payment request and get the Tink Link pay URL.
 * The caller should redirect (or open) the returned tinkUrl.
 */
export async function createTinkPayment(options: {
  amount: number;
  currency?: string;
  market?: string;
  recipientName?: string;
  message?: string;
  iban?: string;
  locale?: string;
}): Promise<{ paymentRequestId: string; tinkUrl: string }> {
  return api('/api/tink/pay', {
    method: 'POST',
    body: JSON.stringify(options),
  });
}

/** Get the transfer status for a Tink payment request */
export async function getTinkPaymentStatus(paymentRequestId: string): Promise<{
  paymentRequestId: string;
  status: string;
  transfers: TinkTransfer[];
}> {
  return api(`/api/tink/payment-status?id=${encodeURIComponent(paymentRequestId)}`);
}

/**
 * Simulate an instant bank transfer in-app — no Tink Link redirect.
 * Deducts from source account, credits destination, records a SETTLED transaction.
 */
export async function simulateTransfer(options: {
  amount: number;
  sourceAccountId?: string;
  message?: string;
}): Promise<{
  success: boolean;
  transactionId: string;
  amount: number;
  currency: string;
  fromAccount: string;
  toAccount: string;
  toIban: string;
  message: string;
  newSourceBalance: number;
  settledAt: string;
}> {
  return api(`/api/tink/transfer${sessionParam()}`, {
    method: 'POST',
    body: JSON.stringify(options),
  });
}

// ─── QR Payments ─────────────────────────────────────────────────────────────

export async function createQRSession(amount?: number, description?: string): Promise<QRSession> {
  return api(`/api/payments/qr/create${sessionParam()}`, {
    method: 'POST',
    body: JSON.stringify({ amount, description }),
  });
}

export async function getQRSession(token: string): Promise<QRSessionInfo> {
  return api(`/api/payments/qr/${encodeURIComponent(token)}`);
}

export async function payQR(
  token: string,
  amount?: number,
): Promise<{ ok: boolean; amount: number; payeeDisplayName: string; description: string }> {
  return api(`/api/payments/qr/${encodeURIComponent(token)}/pay${sessionParam()}`, {
    method: 'POST',
    body: amount !== undefined ? JSON.stringify({ amount }) : undefined,
  });
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface BankAccount {
  id: string;
  name: string;
  type: string;
  balances?: {
    booked?: { amount: { value: { unscaledValue: string; scale: string }; currencyCode: string } };
    available?: { amount: { value: { unscaledValue: string; scale: string }; currencyCode: string } };
  };
  identifiers?: {
    iban?: { iban: string; bban?: string };
    financialInstitution?: { accountNumber: string; referenceNumbers?: { iban?: string } };
  };
  financialInstitutionId?: string;
  currencyCode?: string;
  ownership?: string;
  customerSegment?: string;
  dates?: { lastRefreshed?: string };
}

export interface BankTransaction {
  id: string;
  accountId: string;
  amount: { value: { unscaledValue: string; scale: string }; currencyCode: string };
  descriptions?: { display?: string; original?: string };
  dates?: { booked?: string; value?: string };
  status: string;
  categories?: { pfm?: { id?: string; name?: string } };
  merchantInformation?: { merchantName?: string };
  types?: { type?: string; financialInstitutionTypeCode?: string };
  identifiers?: { providerTransactionId?: string };
}

export interface QRSession {
  qrToken: string;
  qrDataUrl: string;
  amount: number;
  description: string;
  payUrl: string;
  expiresAt: number;
}

export interface QRSessionInfo {
  qrToken: string;
  payeeDisplayName: string;
  amount: number | null;
  description: string;
  status: 'pending' | 'paid' | 'expired';
  expiresAt: number;
}

export interface TinkTransfer {
  id: string;
  amount: number;
  currency: string;
  status: string;
  statusMessage?: string;
  market: string;
  providerName?: string;
  recipientName?: string;
}

export interface TinkPayment {
  id: string;
  amount: number;
  currency: string;
  market: string;
  message: string;
  status: string;
  createdAt: number;
}
