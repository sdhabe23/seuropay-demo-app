import { ArrowLeft, Wallet, CreditCard, ChevronRight, CheckCircle, Pencil, Check } from "lucide-react";
import { useNavigate } from "react-router";
import React, { useState } from "react";
import { useTheme } from "../context/ThemeContext";
import { useBankData, parseTinkAmount } from "../context/BankContext";

export function Profile(): React.ReactNode {
  const navigate = useNavigate();
  const { darkMode, setDarkMode } = useTheme();
  const { linked, accounts } = useBankData();

  // Editable display name — persisted in localStorage
  const [displayName, setDisplayName] = useState<string>(
    () => localStorage.getItem('seuropay_display_name') || 'SeuroPay User'
  );
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(displayName);

  function saveDisplayName() {
    const trimmed = editValue.trim() || 'SeuroPay User';
    setDisplayName(trimmed);
    localStorage.setItem('seuropay_display_name', trimmed);
    setEditing(false);
  }

  // Derive initials (up to 2 chars) and a pseudo-email from the name
  const initials = displayName
    .split(' ')
    .map((w) => w[0]?.toUpperCase() ?? '')
    .slice(0, 2)
    .join('');
  const emailSlug = displayName.toLowerCase().replace(/\s+/g, '.').replace(/[^a-z.]/g, '');
  const email = `${emailSlug}@seuropay.com`;

  const primaryAccount = accounts.length > 0 ? accounts[0] : null;
  const primaryBalance = primaryAccount
    ? parseTinkAmount(primaryAccount.balances?.booked) ||
      parseTinkAmount(primaryAccount.balances?.available) ||
      parseTinkAmount(primaryAccount.currencyDenominatedBalance) ||
      parseTinkAmount(primaryAccount.balance)
    : null;
  const primaryIban =
    primaryAccount?.iban ||
    primaryAccount?.identifiers?.iban?.iban ||
    primaryAccount?.accountNumber ||
    null;

  return (
    <div className={darkMode ? "h-full bg-[#10192B] flex flex-col overflow-hidden" : "h-full bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col overflow-hidden"}>
      {/* Header */}
      <div className={darkMode ? "bg-[#181F32] text-white px-6 pt-12 py-6 shadow-lg flex-shrink-0" : "bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-6 pt-12 py-6 shadow-lg flex-shrink-0"}>
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/")}
            className="p-2 hover:bg-white/20 rounded-xl transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl">Profile</h1>
        </div>
      </div>

      <div className="flex-1 p-6 overflow-y-auto">
        {/* User Info */}
        <div className={darkMode ? "bg-[#181F32] rounded-2xl shadow-md p-6 mb-6" : "bg-white rounded-2xl shadow-md p-6 mb-6"}>
          <div className="flex items-center gap-4">
            <div className={darkMode ? "w-16 h-16 rounded-full bg-gradient-to-br from-[#3AC7B1] to-[#6C7A9C] flex items-center justify-center text-white text-2xl font-semibold flex-shrink-0" : "w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-2xl font-semibold flex-shrink-0"}>
              {initials || '?'}
            </div>
            <div className="flex-1 min-w-0">
              {editing ? (
                <div className="flex items-center gap-2">
                  <input
                    autoFocus
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') saveDisplayName(); if (e.key === 'Escape') setEditing(false); }}
                    className={`flex-1 text-lg font-semibold rounded-lg px-2 py-1 outline-none border ${darkMode ? "bg-[#10192B] text-white border-[#3AC7B1]" : "bg-gray-50 text-gray-800 border-blue-400"}`}
                  />
                  <button onClick={saveDisplayName} className={darkMode ? "p-1.5 rounded-lg bg-[#3AC7B1]/20 text-[#3AC7B1]" : "p-1.5 rounded-lg bg-blue-100 text-blue-600"}>
                    <Check className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <p className={darkMode ? "text-xl text-white font-semibold" : "text-xl text-gray-800 font-semibold"}>{displayName}</p>
                  <button onClick={() => { setEditValue(displayName); setEditing(true); }} className={darkMode ? "p-1 rounded-lg text-[#A3B1CC] hover:text-[#3AC7B1] hover:bg-[#3AC7B1]/10 transition-colors" : "p-1 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"}>
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
              <p className={darkMode ? "text-sm text-[#A3B1CC] truncate" : "text-sm text-gray-500 truncate"}>{email}</p>
            </div>
          </div>
        </div>

        {/* Theme Toggle */}
        <div className={darkMode ? "bg-[#181F32] rounded-2xl shadow-md p-6 mb-6 flex items-center justify-between" : "bg-white rounded-2xl shadow-md p-6 mb-6 flex items-center justify-between"}>
          <span className={darkMode ? "text-white text-lg" : "text-gray-800 text-lg"}>Dark Mode</span>
          <label className="flex items-center cursor-pointer">
            <div className="relative">
              <input type="checkbox" checked={darkMode} onChange={() => setDarkMode(!darkMode)} className="sr-only" />
              <div className={darkMode ? "block bg-[#3AC7B1] w-14 h-8 rounded-full" : "block bg-gray-300 w-14 h-8 rounded-full"}></div>
              <div className={darkMode ? "dot absolute left-7 top-1 bg-white w-6 h-6 rounded-full transition" : "dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition"}></div>
            </div>
          </label>
        </div>

        {/* Payment Methods */}
        <div className={darkMode ? "bg-[#181F32] rounded-2xl shadow-md overflow-hidden mb-6" : "bg-white rounded-2xl shadow-md overflow-hidden mb-6"}>
          <div className="p-4 border-b border-gray-200">
            <p className={darkMode ? "text-sm text-[#A3B1CC] uppercase tracking-wide" : "text-sm text-gray-600 uppercase tracking-wide"}>Payment Methods</p>
          </div>

          {/* Use Wallet Mode */}
          <button
            onClick={() => navigate("/wallet-mode")}
            className={darkMode ? "w-full p-4 hover:bg-[#10192B] transition-colors flex items-center justify-between border-b border-[#181F32]" : "w-full p-4 hover:bg-gray-50 transition-colors flex items-center justify-between border-b border-gray-100"}
          >
            <div className="flex items-center gap-4">
              <div className={darkMode ? "w-12 h-12 rounded-full bg-[#3AC7B1] flex items-center justify-center" : "w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center"}>
                <Wallet className={darkMode ? "w-6 h-6 text-[#10192B]" : "w-6 h-6 text-blue-600"} />
              </div>
              <div className="text-left">
                <p className={darkMode ? "text-white" : "text-gray-800"}>Use Wallet Mode</p>
                <p className={darkMode ? "text-sm text-[#A3B1CC]" : "text-sm text-gray-500"}>Add money to your wallet</p>
              </div>
            </div>
            <ChevronRight className={darkMode ? "w-5 h-5 text-[#A3B1CC]" : "w-5 h-5 text-gray-400"} />
          </button>

          {/* Link Bank Account */}
          <button
            onClick={() => navigate("/link-bank")}
            className={darkMode ? "w-full p-4 hover:bg-[#10192B] transition-colors flex items-center justify-between" : "w-full p-4 hover:bg-gray-50 transition-colors flex items-center justify-between"}
          >
            <div className="flex items-center gap-4">
              <div className={darkMode ? `w-12 h-12 rounded-full flex items-center justify-center ${linked ? "bg-[#3AC7B1]/20" : "bg-[#6C7A9C]"}` : `w-12 h-12 rounded-full flex items-center justify-center ${linked ? "bg-green-100" : "bg-green-100"}`}>
                {linked
                  ? <CheckCircle className={darkMode ? "w-6 h-6 text-[#3AC7B1]" : "w-6 h-6 text-green-600"} />
                  : <CreditCard className={darkMode ? "w-6 h-6 text-white" : "w-6 h-6 text-green-600"} />
                }
              </div>
              <div className="text-left">
                <p className={darkMode ? "text-white" : "text-gray-800"}>
                  {linked ? (primaryAccount?.name || 'Bank Account') : 'Link Bank Account'}
                </p>
                {linked && primaryBalance !== null ? (
                  <p className={darkMode ? "text-sm text-[#3AC7B1]" : "text-sm text-green-600"}>
                    Balance: €{primaryBalance.toLocaleString('en-EU', { minimumFractionDigits: 2 })}
                    {primaryIban ? (
                      <span className="block text-xs font-mono mt-0.5 opacity-80">{primaryIban}</span>
                    ) : null}
                  </p>
                ) : (
                  <p className={darkMode ? "text-sm text-[#A3B1CC]" : "text-sm text-gray-500"}>Connect via Tink to view real balance</p>
                )}
              </div>
            </div>
            <ChevronRight className={darkMode ? "w-5 h-5 text-[#A3B1CC]" : "w-5 h-5 text-gray-400"} />
          </button>
        </div>
      </div>

      {/* Navigation Bar */}
      <div className={darkMode ? "flex justify-between items-center mt-8 bg-[#181F32] rounded-3xl px-4 py-2 m-6 flex-shrink-0" : "flex justify-between items-center mt-8 bg-white rounded-3xl px-4 py-2 m-6 border border-gray-200 flex-shrink-0"}>
        <button onClick={() => navigate("/")} className="flex flex-col items-center hover:opacity-80 transition-opacity">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={darkMode ? "text-[#A3B1CC]" : "text-gray-400"}>
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
          <span className={darkMode ? "text-[#A3B1CC] text-xs mt-1" : "text-gray-400 text-xs mt-1"}>Home</span>
        </button>

        <button onClick={() => navigate("/scan")} className="flex flex-col items-center hover:opacity-80 transition-opacity">
          <svg width="28" height="28" fill="none" viewBox="0 0 24 24"><rect x="3" y="3" width="8" height="8" rx="1" stroke={darkMode ? "#A3B1CC" : "#6b7280"} strokeWidth="2"/><rect x="13" y="3" width="8" height="8" rx="1" stroke={darkMode ? "#A3B1CC" : "#6b7280"} strokeWidth="2"/><rect x="3" y="13" width="8" height="8" rx="1" stroke={darkMode ? "#A3B1CC" : "#6b7280"} strokeWidth="2"/><rect x="13" y="13" width="8" height="8" rx="1" stroke={darkMode ? "#A3B1CC" : "#6b7280"} strokeWidth="2"/><circle cx="7" cy="7" r="1" fill={darkMode ? "#A3B1CC" : "#6b7280"}/><circle cx="17" cy="7" r="1" fill={darkMode ? "#A3B1CC" : "#6b7280"}/><circle cx="7" cy="17" r="1" fill={darkMode ? "#A3B1CC" : "#6b7280"}/><circle cx="17" cy="17" r="1" fill={darkMode ? "#A3B1CC" : "#6b7280"}/></svg>
          <span className={darkMode ? "text-[#A3B1CC] text-xs mt-1" : "text-gray-400 text-xs mt-1"}>Scan</span>
        </button>

        <button onClick={() => navigate("/history")} className="flex flex-col items-center hover:opacity-80 transition-opacity">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={darkMode ? "text-[#A3B1CC]" : "text-gray-400"}>
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          <span className={darkMode ? "text-[#A3B1CC] text-xs mt-1" : "text-gray-400 text-xs mt-1"}>History</span>
        </button>

        <button onClick={() => navigate("/profile")} className="flex flex-col items-center hover:opacity-80 transition-opacity">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#3AC7B1]">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
          <span className="text-[#3AC7B1] text-xs mt-1">Profile</span>
        </button>
      </div>
    </div>
  );
}
