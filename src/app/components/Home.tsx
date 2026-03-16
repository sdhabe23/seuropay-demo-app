import React, { useMemo, useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router";
import { Eye, EyeOff, ArrowDownLeft, ArrowUpRight, RefreshCw, Link as LinkIcon } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { useBankData, parseTinkAmount } from "../context/BankContext";

export function Home(): React.ReactNode {
  const navigate = useNavigate();
  const { darkMode } = useTheme();
  const { linked, accounts, transactions, loading, refresh, lastPaymentEvent, clearPaymentEvent, selectedAccountId } = useBankData();

  const [balanceVisible, setBalanceVisible] = useState(() => {
    const saved = localStorage.getItem('balanceVisible');
    return saved !== null ? JSON.parse(saved) : true;
  });

  // Save balance visibility to localStorage
  useEffect(() => {
    localStorage.setItem('balanceVisible', JSON.stringify(balanceVisible));
  }, [balanceVisible]);

  // Show incoming payment toast notification
  useEffect(() => {
    if (lastPaymentEvent) {
      const t = setTimeout(() => clearPaymentEvent(), 5000);
      return () => clearTimeout(t);
    }
  }, [lastPaymentEvent, clearPaymentEvent]);

  // Real bank balance: selected account, or sum of all accounts
  const totalBalance = useMemo(() => {
    if (linked && accounts.length > 0) {
      const accsToSum = selectedAccountId
        ? accounts.filter((a) => a.id === selectedAccountId)
        : accounts;
      return accsToSum.reduce((sum, acc) => {
        // Try v2 balances first, then v1 currencyDenominatedBalance
        const b =
          parseTinkAmount(acc.balances?.booked) ||
          parseTinkAmount(acc.balances?.available) ||
          parseTinkAmount(acc.currencyDenominatedBalance) ||
          parseTinkAmount(acc.balance);
        return sum + b;
      }, 0);
    }
    // Local demo balance from QR payment events
    const base = parseFloat(sessionStorage.getItem('localBalance') || '12513.26');
    const delta = transactions.reduce((sum, t) => sum + t.amount, 0);
    return base + delta;
  }, [linked, accounts, selectedAccountId, transactions]);

  const recentActivity = useMemo(() => {
    if (transactions.length > 0) {
      return transactions.slice(0, 5).map((t) => ({
        id: t.id,
        name: t.counterparty || t.description,
        date: t.date ? new Date(t.date).toLocaleString() : 'Recently',
        amount: t.amount,
        type: t.amount < 0 ? 'expense' : 'income',
      }));
    }
    // Placeholder data
    return [
      { id: '1', name: 'Merchant Store QR', date: 'Feb 28, 10:55 PM', amount: -25.50, type: 'expense' },
      { id: '2', name: 'Coffee Shop', date: 'Feb 28, 10:53 PM', amount: -12.00, type: 'expense' },
      { id: '3', name: 'Taxi ride', date: 'Feb 28, 10:45 PM', amount: -8.75, type: 'expense' },
      { id: '4', name: 'Restaurant', date: 'Feb 28, 10:30 PM', amount: -33.20, type: 'expense' },
    ];
  }, [transactions]);

  return (
    <div className={darkMode ? "bg-[#10192B] h-full w-full rounded-3xl flex flex-col shadow-xl" : "bg-gradient-to-br from-blue-50 to-indigo-100 h-full w-full rounded-3xl flex flex-col shadow-xl"}>
      <div className="flex-1 overflow-y-auto p-6">
        {/* Logo + refresh */}
        <div className="flex items-center justify-between mb-8">
          <div className={darkMode ? "text-[#3AC7B1] text-2xl font-bold" : "text-blue-600 text-2xl font-bold"}>SeuroPay</div>
          <button
            onClick={refresh}
            disabled={loading}
            className={darkMode ? "p-2 hover:bg-[#1A233A] rounded-lg transition-colors" : "p-2 hover:bg-blue-100 rounded-lg transition-colors"}
          >
            <RefreshCw width="18" height="18" className={`${loading ? "animate-spin" : ""} ${darkMode ? "text-[#3AC7B1]" : "text-blue-600"}`} />
          </button>
        </div>

        {/* Incoming payment toast */}
        {lastPaymentEvent && (
          <div
            className={darkMode
              ? "bg-green-900/40 border border-green-500/40 rounded-2xl p-4 mb-4 flex items-center gap-3"
              : "bg-green-50 border border-green-300 rounded-2xl p-4 mb-4 flex items-center gap-3"}
          >
            <ArrowDownLeft className="w-5 h-5 text-green-500 flex-shrink-0" />
            <div className="flex-1">
              <p className={darkMode ? "text-green-300 font-semibold text-sm" : "text-green-800 font-semibold text-sm"}>
                {lastPaymentEvent.type === 'PAYMENT_RECEIVED' ? 'Money Received!' : 'Payment Sent!'}
              </p>
              <p className={darkMode ? "text-green-400 text-xs" : "text-green-700 text-xs"}>
                {lastPaymentEvent.type === 'PAYMENT_RECEIVED'
                  ? `€${lastPaymentEvent.amount.toFixed(2)} from ${lastPaymentEvent.counterpartyName}`
                  : `€${lastPaymentEvent.amount.toFixed(2)} to ${lastPaymentEvent.counterpartyName}`}
              </p>
            </div>
            <button onClick={clearPaymentEvent} className="text-green-500 hover:text-green-400 text-xs">✕</button>
          </div>
        )}

        {/* Bank status strip — only show "connect" prompt when NOT linked */}
        {!linked && (
          <div
            className={`rounded-2xl p-4 mb-4 flex items-center gap-3 cursor-pointer transition-colors ${
              darkMode
                ? "bg-[#1A233A] border border-[#3AC7B1]/30 hover:border-[#3AC7B1]/60"
                : "bg-blue-50 border border-blue-300 hover:bg-blue-100"
            }`}
            onClick={() => navigate("/link-bank")}
          >
            <LinkIcon className={`w-5 h-5 flex-shrink-0 ${darkMode ? "text-[#3AC7B1]" : "text-blue-600"}`} />
            <div>
              <p className={`text-sm font-semibold ${darkMode ? "text-white" : "text-blue-900"}`}>Connect your bank</p>
              <p className={`text-xs ${darkMode ? "text-[#A3B1CC]" : "text-blue-700"}`}>Link once to see real balance & transactions</p>
            </div>
          </div>
        )}

        {/* Balance */}
        <div className="flex items-center justify-between mb-2">
          <div className={darkMode ? "text-[#A3B1CC] text-lg" : "text-gray-600 text-lg"}>
            {linked
              ? selectedAccountId
                ? accounts.find((a) => a.id === selectedAccountId)?.name ?? "Account Balance"
                : "Total Bank Balance"
              : "Available Balance"}
          </div>
          <button
            onClick={() => setBalanceVisible(!balanceVisible)}
            className={darkMode ? "p-2 hover:bg-[#1A233A] rounded-lg transition-colors" : "p-2 hover:bg-blue-100 rounded-lg transition-colors"}
          >
            {balanceVisible ? (
              <Eye width="20" height="20" color={darkMode ? "#3AC7B1" : "#1e40af"} />
            ) : (
              <EyeOff width="20" height="20" color={darkMode ? "#3AC7B1" : "#1e40af"} />
            )}
          </button>
        </div>
        <div className={darkMode ? "text-white text-4xl font-bold mb-6" : "text-gray-900 text-4xl font-bold mb-6"}>
          {balanceVisible ? `€${totalBalance.toLocaleString('en-EU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '••••••'}
        </div>

        {/* Pay / Receive buttons */}
        <div className="flex gap-4 mb-8">
          <button onClick={() => navigate("/payment-method")} className="bg-gradient-to-r from-[#3AC7B1] to-[#6C7A9C] rounded-2xl flex-1 flex items-center justify-between px-6 py-4 cursor-pointer hover:shadow-lg transition-all">
            <div className="flex items-center">
              <div>
                <div className="text-white font-semibold text-lg">Pay</div>
                <div className="text-white text-sm opacity-90">Tap to pay or Scan QR</div>
              </div>
            </div>
            <div>
              <svg width="24" height="24" fill="none"><path d="M7 17L17 7M17 7H7M17 7V17" stroke="white" strokeWidth="2" strokeLinecap="round"/></svg>
            </div>
          </button>
          <button onClick={() => navigate("/receive-amount")} className="bg-gradient-to-r from-[#3AC7B1] to-[#2A9E8A] rounded-2xl flex-1 flex items-center justify-between px-6 py-4 cursor-pointer hover:shadow-lg transition-all">
            <div className="flex items-center">
              <div>
                <div className="text-white font-semibold text-lg">Receive</div>
                <div className="text-white text-sm opacity-90">Get paid instantly</div>
              </div>
            </div>
            <div className="ml-4">
              <svg width="24" height="24" fill="none"><path d="M17 7L7 17M7 17H17M7 17V7" stroke="white" strokeWidth="2" strokeLinecap="round"/></svg>
            </div>
          </button>
        </div>

        {/* Recent Activity */}
        <div className="flex justify-between items-center mb-4">
          <div className={darkMode ? "text-white text-xl font-semibold" : "text-gray-900 text-xl font-semibold"}>Recent Activity</div>
          <button onClick={() => navigate("/history")} className={darkMode ? "text-[#3AC7B1] text-base font-medium cursor-pointer hover:underline" : "text-blue-600 text-base font-medium cursor-pointer hover:underline"}>See All</button>
        </div>
        <div className="space-y-4 pb-4">
          {recentActivity.map((item) => (
            <div key={item.id} className={darkMode ? "bg-[#1A233A] rounded-2xl flex items-center justify-between px-6 py-4" : "bg-white rounded-2xl flex items-center justify-between px-6 py-4"}>
              <div className="flex items-center">
                <div className={`rounded-full p-2 mr-4 ${item.type === 'income' ? darkMode ? 'bg-green-900/40' : 'bg-green-100' : darkMode ? 'bg-[#2C3A6A]' : 'bg-blue-100'}`}>
                  {item.type === 'income'
                    ? <ArrowDownLeft width="20" height="20" className={darkMode ? "text-green-400" : "text-green-600"} />
                    : <ArrowUpRight width="20" height="20" className={darkMode ? "text-[#A3B1CC]" : "text-blue-700"} />
                  }
                </div>
                <div>
                  <div className={darkMode ? "text-white font-medium" : "text-gray-900 font-medium"}>{item.name}</div>
                  <div className={darkMode ? "text-[#A3B1CC] text-xs" : "text-gray-500 text-xs"}>{item.date}</div>
                </div>
              </div>
              <div className={`text-lg font-bold ${item.type === 'income' ? darkMode ? 'text-green-400' : 'text-green-600' : darkMode ? 'text-[#A3B1CC]' : 'text-gray-600'}`}>
                {item.amount >= 0 ? '+' : ''}€{Math.abs(item.amount).toFixed(2)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Bar — fixed at bottom, never scrolls */}
      <div className={darkMode ? "flex justify-between items-center bg-[#181F32] rounded-3xl px-4 py-2 m-6 flex-shrink-0" : "flex justify-between items-center bg-white rounded-3xl px-4 py-2 m-6 border border-gray-200 flex-shrink-0"}>
        <button onClick={() => navigate("/")} className="flex flex-col items-center hover:opacity-80 transition-opacity">
          <svg width="28" height="28" fill="none" viewBox="0 0 24 24"><path d="M3 12l9-9 9 9M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" stroke="#3AC7B1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          <span className="text-[#3AC7B1] text-xs mt-1">Home</span>
        </button>
        <button onClick={() => navigate("/scan")} className="flex flex-col items-center hover:opacity-80 transition-opacity">
          <svg width="28" height="28" fill="none" viewBox="0 0 24 24"><rect x="3" y="3" width="8" height="8" rx="1" stroke={darkMode ? "#A3B1CC" : "#6b7280"} strokeWidth="2"/><rect x="13" y="3" width="8" height="8" rx="1" stroke={darkMode ? "#A3B1CC" : "#6b7280"} strokeWidth="2"/><rect x="3" y="13" width="8" height="8" rx="1" stroke={darkMode ? "#A3B1CC" : "#6b7280"} strokeWidth="2"/><rect x="13" y="13" width="8" height="8" rx="1" stroke={darkMode ? "#A3B1CC" : "#6b7280"} strokeWidth="2"/><circle cx="7" cy="7" r="1" fill={darkMode ? "#A3B1CC" : "#6b7280"}/><circle cx="17" cy="7" r="1" fill={darkMode ? "#A3B1CC" : "#6b7280"}/><circle cx="7" cy="17" r="1" fill={darkMode ? "#A3B1CC" : "#6b7280"}/><circle cx="17" cy="17" r="1" fill={darkMode ? "#A3B1CC" : "#6b7280"}/></svg>
          <span className={darkMode ? "text-[#A3B1CC] text-xs mt-1" : "text-gray-600 text-xs mt-1"}>Scan</span>
        </button>
        <button onClick={() => navigate("/history")} className="flex flex-col items-center hover:opacity-80 transition-opacity">
          <svg width="28" height="28" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" stroke={darkMode ? "#A3B1CC" : "#6b7280"} strokeWidth="2"/><path d="M12 6v6l4 2" stroke={darkMode ? "#A3B1CC" : "#6b7280"} strokeWidth="2" strokeLinecap="round"/></svg>
          <span className={darkMode ? "text-[#A3B1CC] text-xs mt-1" : "text-gray-600 text-xs mt-1"}>History</span>
        </button>
        <button onClick={() => navigate("/profile")} className="flex flex-col items-center hover:opacity-80 transition-opacity">
          <svg width="28" height="28" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="8" r="4" stroke={darkMode ? "#A3B1CC" : "#6b7280"} strokeWidth="2"/><path d="M6 20c0-3.314 2.686-6 6-6s6 2.686 6 6" stroke={darkMode ? "#A3B1CC" : "#6b7280"} strokeWidth="2" strokeLinecap="round"/></svg>
          <span className={darkMode ? "text-[#A3B1CC] text-xs mt-1" : "text-gray-600 text-xs mt-1"}>Profile</span>
        </button>
      </div>
    </div>
  );
}

