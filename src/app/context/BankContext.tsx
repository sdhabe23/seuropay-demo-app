/**
 * BankContext — global app state for SeuroPay demo.
 *
 * Manages:
 *   - Session identity
 *   - AIS: linked bank accounts + real transactions from Tink
 *   - PIS: Tink payment history (local tracking)
 *   - QR payment events via WebSocket
 */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';
import {
  initSession,
  getTinkStatus,
  getAccounts,
  getTransactions,
  disconnectBank,
  BankAccount,
  BankTransaction,
  TinkPayment,
} from '../../services/api';
import { useBackendWS, WSMessage } from '../../services/useBackendWS';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface LocalTransaction {
  id: string;
  amount: number;      // positive = received, negative = sent
  currency: string;
  date: string;
  description: string;
  type: 'CREDIT' | 'DEBIT' | 'BANK_PAYMENT' | 'BANK_TX';
  status: string;
  counterparty?: string;
}

export interface PaymentEvent {
  type: 'PAYMENT_RECEIVED' | 'PAYMENT_SENT';
  qrToken: string;
  amount: number;
  currency: string;
  description: string;
  counterpartyName: string;
  paidAt: number;
}

interface BankContextValue {
  sessionId: string | null;
  // AIS
  linked: boolean;
  accounts: BankAccount[];
  bankTransactions: BankTransaction[];
  // Selected account for balance + history
  selectedAccountId: string | null;
  setSelectedAccountId: (id: string | null) => void;
  // Mixed local transactions (QR + PIS)
  transactions: LocalTransaction[];
  // PIS
  tinkPayments: TinkPayment[];
  addTinkPayment: (p: TinkPayment) => void;
  // State
  loading: boolean;
  error: string | null;
  lastPaymentEvent: PaymentEvent | null;
  clearPaymentEvent: () => void;
  /** True when the currently shown transactions come from the server-side cache */
  txFromCache: boolean;
  /** True when demo (generated) transactions are displayed — no real bank data */
  txIsDemo: boolean;
  // Actions
  /** Re-fetches accounts + transactions; busts the server-side 5-min tx cache */
  refresh: () => Promise<void>;
  disconnectTinkBank: () => Promise<void>;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Parse a Tink account balance — handles both v1 and v2 API response shapes.
 *
 * v2: { amount: { value: { unscaledValue, scale }, currencyCode } }
 * v1: { currencyDenominatedBalance: { unscaledValue, scale } }  OR  { balance: <integer cents> }
 */
export function parseTinkAmount(
  amountObj: any
): number {
  if (!amountObj) return 0;
  // v2 shape: { amount: { value: { unscaledValue, scale } } }
  if (amountObj?.amount?.value) {
    const { unscaledValue, scale } = amountObj.amount.value;
    return Number(unscaledValue) / Math.pow(10, Number(scale));
  }
  // v1 shape: { currencyDenominatedBalance: { unscaledValue, scale } }
  if (amountObj?.currencyDenominatedBalance) {
    const { unscaledValue, scale } = amountObj.currencyDenominatedBalance;
    return Number(unscaledValue) / Math.pow(10, Number(scale));
  }
  // Raw number (v1 balance field in pence/cents divided by 100, already whole units in Tink)
  if (typeof amountObj === 'number') return amountObj;
  return 0;
}

/**
 * Convert a raw Tink transaction into a LocalTransaction for display.
 * Handles both v2 shape ({ amount: { value: {unscaledValue, scale}, currencyCode } })
 * and v1 shape ({ amount: { unscaledValue, scale, currencyCode } } or plain number).
 */
export function normalizeTinkTransaction(tx: BankTransaction): LocalTransaction {
  let amount = 0;
  const rawAmount = (tx as any).amount;
  if (rawAmount?.value?.unscaledValue !== undefined) {
    // v2: { value: { unscaledValue, scale }, currencyCode }
    const { unscaledValue, scale } = rawAmount.value;
    amount = Number(unscaledValue) * Math.pow(10, -Math.abs(Number(scale)));
  } else if (rawAmount?.unscaledValue !== undefined) {
    // v1 flat: { unscaledValue, scale, currencyCode }
    amount = Number(rawAmount.unscaledValue) * Math.pow(10, -Math.abs(Number(rawAmount.scale)));
  } else if (typeof rawAmount === 'number') {
    amount = rawAmount;
  }

  const currency =
    rawAmount?.currencyCode ||
    (tx as any).currencyCode ||
    'EUR';

  const description =
    (tx as any).descriptions?.display ||
    (tx as any).descriptions?.original ||
    (tx as any).description ||
    (tx as any).merchantInformation?.merchantName ||
    'Bank transaction';

  const date =
    (tx as any).dates?.booked ||
    (tx as any).dates?.value ||
    (tx as any).date ||
    new Date().toISOString();

  const counterparty =
    (tx as any).merchantInformation?.merchantName ||
    (tx as any).counterpartyName ||
    undefined;

  return {
    id: tx.id,
    amount,
    currency,
    date,
    description,
    type: amount >= 0 ? 'CREDIT' : 'DEBIT',
    status: tx.status || 'BOOKED',
    counterparty,
  };
}

// ─── Context ──────────────────────────────────────────────────────────────────

const BankContext = createContext<BankContextValue>({
  sessionId: null,
  linked: false,
  accounts: [],
  bankTransactions: [],
  selectedAccountId: null,
  setSelectedAccountId: () => {},
  transactions: [],
  tinkPayments: [],
  loading: false,
  error: null,
  lastPaymentEvent: null,
  addTinkPayment: () => {},
  refresh: async () => {},
  disconnectTinkBank: async () => {},
  clearPaymentEvent: () => {},
  txFromCache: false,
  txIsDemo: false,
});

export function useBankData() {
  return useContext(BankContext);
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function BankProvider({ children }: { children: React.ReactNode }) {
  const [sessionId, setSessionId] = useState<string | null>(
    () => localStorage.getItem('seuropay_session_id')
  );
  const [linked, setLinked] = useState(false);
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [bankTransactions, setBankTransactions] = useState<BankTransaction[]>([]);
  const [selectedAccountId, setSelectedAccountIdState] = useState<string | null>(
    () => localStorage.getItem('seuropay_selected_account') || null
  );
  // Local transactions from QR payments and PIS (WS events)
  const [localTransactions, setLocalTransactions] = useState<LocalTransaction[]>([]);
  const [tinkPayments, setTinkPayments] = useState<TinkPayment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastPaymentEvent, setLastPaymentEvent] = useState<PaymentEvent | null>(null);
  const [txFromCache, setTxFromCache] = useState(false);
  const [txIsDemo, setTxIsDemo] = useState(false);

  // ─── Load AIS bank data ──────────────────────────────────────────────────
  const loadBankData = useCallback(async (accountIdFilter?: string, bustCache = false) => {
    setLoading(true);
    setError(null);
    try {
      // Fetch accounts FIRST so the backend caches linkedAccounts before transactions
      // (the transactions endpoint generates demo data seeded from cached accounts)
      const accData = await getAccounts();
      setLinked(accData.linked);
      if (accData.linked) {
        setAccounts(accData.accounts);
      } else {
        setAccounts([]);
      }

      if (accData.linked) {
        // Use BOOKED status (settled transactions only) — covers 90 days by default.
        // Pass bust=true when the caller explicitly wants fresh data (manual refresh).
        const txData = await getTransactions(100, accountIdFilter, 'BOOKED', undefined, undefined, bustCache);
        setBankTransactions(txData.transactions);
        setTxFromCache(!!txData.fromCache);
        setTxIsDemo(!!txData.isDemo);
      } else {
        setBankTransactions([]);
        setTxFromCache(false);
        setTxIsDemo(false);
      }
    } catch (e: any) {
      console.error('[BankContext] loadBankData failed:', e);
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // ─── Bootstrap session ──────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    async function boot() {
      setLoading(true);
      try {
        const stored = localStorage.getItem('seuropay_display_name');
        const data = await initSession(stored || undefined);
        if (cancelled) return;
        setSessionId(data.sessionId);

        // Check if the backend still has a valid linked token for this session
        const status = await getTinkStatus().catch(() => null);
        if (cancelled) return;
        if (status?.linked) {
          // Backend has a live token — load accounts + transactions
          // Pass stored selectedAccountId so transactions are pre-filtered
          const storedAccId = localStorage.getItem('seuropay_selected_account') || undefined;
          await loadBankData(storedAccId);
        } else {
          setLinked(false);
          setAccounts([]);
          setBankTransactions([]);
        }
      } catch (e) {
        console.error('[BankContext] boot failed:', e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    boot();
    return () => { cancelled = true; };
  }, [loadBankData]);

  // ─── Check for Tink AIS callback on mount ────────────────────────────────
  useEffect(() => {
    const hash = window.location.hash;
    if (hash.includes('tink_success=1')) {
      loadBankData();
    }
  }, [loadBankData]);

  const setSelectedAccountId = useCallback((id: string | null) => {
    setSelectedAccountIdState(id);
    if (id) localStorage.setItem('seuropay_selected_account', id);
    else localStorage.removeItem('seuropay_selected_account');
    // Reload transactions filtered to the newly selected account.
    // Use cached data when available (bust=false) — account switch is frequent.
    loadBankData(id ?? undefined, false);
  }, [loadBankData]);

  // refresh() busts the server-side transaction cache so the user always gets
  // the very latest data when they explicitly pull-to-refresh.
  const refresh = useCallback(async () => {
    await loadBankData(selectedAccountId ?? undefined, true);
  }, [loadBankData, selectedAccountId]);

  const disconnectTinkBank = useCallback(async () => {
    await disconnectBank();
    setLinked(false);
    setAccounts([]);
    setBankTransactions([]);
    setSelectedAccountId(null);
  }, [setSelectedAccountId]);

  // ─── PIS local tracking ──────────────────────────────────────────────────
  const addTinkPayment = useCallback((p: TinkPayment) => {
    setTinkPayments((prev) => [p, ...prev]);
    setLocalTransactions((prev) => [{
      id: p.id,
      amount: -p.amount,
      currency: p.currency,
      date: new Date(p.createdAt).toISOString(),
      description: p.message || 'Bank payment',
      type: 'BANK_PAYMENT',
      status: p.status,
      counterparty: 'SeuroPay',
    }, ...prev]);
  }, []);

  // ─── WebSocket real-time events ─────────────────────────────────────────────
  const handleWS = useCallback((msg: WSMessage) => {
    if (msg.type === 'PAYMENT_RECEIVED') {
      setLastPaymentEvent({
        type: 'PAYMENT_RECEIVED',
        qrToken: msg.qrToken,
        amount: msg.amount,
        currency: msg.currency,
        description: msg.description,
        counterpartyName: msg.payerDisplayName,
        paidAt: msg.paidAt,
      });
      setLocalTransactions((prev) => [
        {
          id: msg.qrToken,
          amount: msg.amount,
          currency: msg.currency ?? 'EUR',
          date: new Date(msg.paidAt).toISOString(),
          description: msg.description || `Payment from ${msg.payerDisplayName}`,
          type: 'CREDIT',
          status: 'BOOKED',
          counterparty: msg.payerDisplayName,
        },
        ...prev,
      ]);
    } else if (msg.type === 'PAYMENT_SENT') {
      setLastPaymentEvent({
        type: 'PAYMENT_SENT',
        qrToken: msg.qrToken,
        amount: msg.amount,
        currency: msg.currency,
        description: msg.description,
        counterpartyName: msg.payeeDisplayName,
        paidAt: msg.paidAt,
      });
      setLocalTransactions((prev) => [
        {
          id: msg.qrToken,
          amount: -msg.amount,
          currency: msg.currency ?? 'EUR',
          date: new Date(msg.paidAt).toISOString(),
          description: msg.description || `Payment to ${msg.payeeDisplayName}`,
          type: 'DEBIT',
          status: 'BOOKED',
          counterparty: msg.payeeDisplayName,
        },
        ...prev,
      ]);
    }
  }, []);

  useBackendWS(handleWS);

  const clearPaymentEvent = useCallback(() => setLastPaymentEvent(null), []);

  // Merged transactions: local QR/PIS events first, then AIS bank transactions
  // Filtering by account is done server-side via the accountId query param
  const transactions: LocalTransaction[] = [
    ...localTransactions,
    ...bankTransactions.map(normalizeTinkTransaction),
  ];

  return (
    <BankContext.Provider
      value={{
        sessionId,
        linked,
        accounts,
        bankTransactions,
        selectedAccountId,
        setSelectedAccountId,
        transactions,
        tinkPayments,
        loading,
        error,
        lastPaymentEvent,
        addTinkPayment,
        refresh,
        disconnectTinkBank,
        clearPaymentEvent,
        txFromCache,
        txIsDemo,
      }}
    >
      {children}
    </BankContext.Provider>
  );
}

