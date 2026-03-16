import { useState, useEffect } from "react";
import { ArrowLeft, Building2, Shield, ExternalLink, Loader, CheckCircle, XCircle, RefreshCw, Unlink, CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router";
import { useTheme } from "../context/ThemeContext";
import { useBankData, parseTinkAmount } from "../context/BankContext";
import { getTinkLinkUrl } from "../../services/api";
import React from "react";

const TINK_MARKETS = [
  { id: "EE", name: "Estonia", flag: "🇪🇪" },
  { id: "SE", name: "Sweden", flag: "🇸🇪" },
  { id: "GB", name: "United Kingdom", flag: "🇬🇧" },
  { id: "DE", name: "Germany", flag: "🇩🇪" },
  { id: "FR", name: "France", flag: "🇫🇷" },
  { id: "NL", name: "Netherlands", flag: "🇳🇱" },
  { id: "ES", name: "Spain", flag: "🇪🇸" },
  { id: "FI", name: "Finland", flag: "🇫🇮" },
  { id: "NO", name: "Norway", flag: "🇳🇴" },
  { id: "DK", name: "Denmark", flag: "🇩🇰" },
  { id: "LT", name: "Lithuania", flag: "🇱🇹" },
  { id: "LV", name: "Latvia", flag: "🇱🇻" },
];

export function LinkBank(): React.ReactNode {
  const navigate = useNavigate();
  const { darkMode } = useTheme();
  const { linked, accounts, loading, refresh, disconnectTinkBank, selectedAccountId, setSelectedAccountId } = useBankData();

  const [selectedMarket, setSelectedMarket] = useState("EE");
  const [linking, setLinking] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [justLinked, setJustLinked] = useState(false);

  // Detect Tink callback return — params are in the hash fragment (e.g. /#/link-bank?tink_success=1)
  useEffect(() => {
    const hash = window.location.hash; // e.g. "#/link-bank?tink_success=1"
    const qIndex = hash.indexOf('?');
    const hashParams = qIndex >= 0 ? new URLSearchParams(hash.slice(qIndex + 1)) : new URLSearchParams();

    const success = hashParams.get("tink_success");
    const tinkError = hashParams.get("tink_error");

    if (success === "1") {
      setJustLinked(true);
      // Strip the flag from the URL so refresh doesn't re-trigger
      window.history.replaceState(null, '', window.location.pathname + window.location.search + '#/link-bank');
      refresh();
    }
    if (tinkError) {
      setError(decodeURIComponent(tinkError));
      window.history.replaceState(null, '', window.location.pathname + window.location.search + '#/link-bank');
    }
  }, []);

  // Navigate home — always replace current entry so Tink URL is not in stack
  const goHome = () => navigate('/', { replace: true });

  const card = darkMode
    ? "bg-[#181F32] rounded-2xl shadow-md"
    : "bg-white rounded-2xl shadow-md border border-gray-200";
  const labelColor = darkMode ? "text-[#A3B1CC]" : "text-gray-600";
  const textColor = darkMode ? "text-white" : "text-gray-900";

  const handleLink = async () => {
    setLinking(true);
    setError(null);
    try {
      const result = await getTinkLinkUrl(selectedMarket);
      window.location.href = result.tinkUrl;
    } catch (e: any) {
      setError(e.message);
      setLinking(false);
    }
  };

  const handleDisconnect = async () => {
    setDisconnecting(true);
    try {
      await disconnectTinkBank();
      setJustLinked(false);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setDisconnecting(false);
    }
  };

  return (
    <div className={darkMode ? "h-full bg-[#10192B] flex flex-col overflow-hidden" : "h-full bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col overflow-hidden"}>
      {/* Header */}
      <div className={darkMode ? "bg-[#181F32] text-white px-6 pt-8 py-6 shadow-lg flex-shrink-0" : "bg-white text-gray-900 px-6 pt-8 py-6 shadow-lg flex-shrink-0 border-b border-gray-200"}>
        <div className="flex items-center gap-4">
          <button
            onClick={goHome}
            className={darkMode ? "p-2 hover:bg-white/20 rounded-xl transition-colors" : "p-2 hover:bg-gray-100 rounded-xl transition-colors"}
          >
            <ArrowLeft className={darkMode ? "w-6 h-6" : "w-6 h-6 text-gray-900"} />
          </button>
          <h1 className={darkMode ? "text-xl" : "text-xl text-gray-900"}>
            {linked ? "Bank Account" : "Connect Bank Account"}
          </h1>
          {linked && (
            <button
              onClick={refresh}
              disabled={loading}
              className={`ml-auto p-2 rounded-xl transition-colors ${darkMode ? "hover:bg-white/20" : "hover:bg-gray-100"}`}
            >
              <RefreshCw className={`w-5 h-5 ${loading ? "animate-spin" : ""} ${darkMode ? "text-[#3AC7B1]" : "text-blue-600"}`} />
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 p-6 overflow-y-auto space-y-5">

        {/* Success banner */}
        {justLinked && (
          <div className={darkMode ? "bg-green-900/40 border border-green-500/40 rounded-xl p-4 flex items-center gap-3" : "bg-green-50 border border-green-300 rounded-xl p-4 flex items-center gap-3"}>
            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
            <p className={darkMode ? "text-green-300 text-sm font-medium" : "text-green-800 text-sm font-medium"}>
              Bank account connected successfully!
            </p>
          </div>
        )}

        {/* Error banner */}
        {error && (
          <div className={darkMode ? "bg-red-900/40 border border-red-500/40 rounded-xl p-4 flex items-center gap-3" : "bg-red-50 border border-red-300 rounded-xl p-4 flex items-center gap-3"}>
            <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <p className={darkMode ? "text-red-300 text-sm" : "text-red-700 text-sm"}>{error}</p>
          </div>
        )}

        {/* ── LINKED STATE ── */}
        {linked ? (
          <>
            {/* Connected accounts */}
            <div className={`${card} overflow-hidden`}>
              <div className={`px-5 py-3 border-b ${darkMode ? "border-[#2C3A6A]" : "border-gray-100"}`}>
                <p className={`text-xs font-semibold uppercase tracking-wide ${labelColor}`}>Connected Accounts</p>
              </div>
              {loading ? (
                <div className="p-6 flex justify-center">
                  <Loader className={`w-6 h-6 animate-spin ${darkMode ? "text-[#3AC7B1]" : "text-blue-600"}`} />
                </div>
              ) : accounts.length === 0 ? (
                <div className="p-5 text-center">
                  <p className={`${labelColor} text-sm`}>No accounts found. Try refreshing.</p>
                </div>
              ) : (
                accounts.map((acc, i) => {
                  // Support both v2 (balances.booked) and v1 (currencyDenominatedBalance) formats
                  const bookedBalance =
                    parseTinkAmount(acc.balances?.booked) ||
                    parseTinkAmount(acc.currencyDenominatedBalance) ||
                    parseTinkAmount(acc.balance);
                  const availableBalance = parseTinkAmount(acc.balances?.available);
                  const iban =
                    acc.iban ||
                    acc.identifiers?.iban?.iban ||
                    acc.accountNumber ||
                    '';
                  const balance = bookedBalance || availableBalance;
                  const currency =
                    acc.balances?.booked?.amount?.currencyCode ||
                    acc.balances?.available?.amount?.currencyCode ||
                    acc.currencyDenominatedBalance?.currencyCode ||
                    acc.currencyCode || 'EUR';
                  const isSelected = selectedAccountId === acc.id;

                  return (
                    <div
                      key={acc.id}
                      className={`px-5 py-4 transition-colors ${i < accounts.length - 1 ? darkMode ? "border-b border-[#2C3A6A]" : "border-b border-gray-100" : ""} ${isSelected ? darkMode ? "bg-[#1A3A35]" : "bg-teal-50" : ""}`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${darkMode ? "bg-[#3AC7B1]/20" : "bg-blue-100"}`}>
                            <Building2 className={`w-5 h-5 ${darkMode ? "text-[#3AC7B1]" : "text-blue-600"}`} />
                          </div>
                          <div className="min-w-0">
                            <p className={`font-semibold text-sm truncate ${textColor}`}>{acc.name || 'Bank Account'}</p>
                            <p className={`text-xs ${labelColor} truncate`}>{acc.type?.replace(/_/g, ' ')}</p>
                            {iban && (
                              <p className={`text-xs font-mono mt-0.5 ${darkMode ? "text-[#6B7A99]" : "text-gray-400"} truncate`}>
                                {iban}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2 flex-shrink-0">
                          <p className={`font-bold text-base ${darkMode ? "text-white" : "text-gray-900"}`}>
                            {currency} {balance.toLocaleString('en-EU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </p>
                          {availableBalance !== bookedBalance && availableBalance > 0 && (
                            <p className={`text-xs ${labelColor}`}>
                              Avail. {availableBalance.toLocaleString('en-EU', { minimumFractionDigits: 2 })}
                            </p>
                          )}
                          <button
                            onClick={() => setSelectedAccountId(isSelected ? null : acc.id)}
                            className={`flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full transition-all ${
                              isSelected
                                ? darkMode ? "bg-[#3AC7B1] text-[#10192B]" : "bg-teal-500 text-white"
                                : darkMode ? "border border-[#3AC7B1]/50 text-[#3AC7B1] hover:bg-[#3AC7B1]/10" : "border border-teal-500 text-teal-600 hover:bg-teal-50"
                            }`}
                          >
                            {isSelected ? <><CheckCircle2 className="w-3 h-3" /> In use</> : "Use this"}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Payment consent badge */}
            <div className={`rounded-xl p-3 flex items-center gap-3 ${darkMode ? "bg-green-900/30 border border-green-500/30" : "bg-green-50 border border-green-300"}`}>
              <Shield className="w-4 h-4 text-green-500 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className={`text-xs font-semibold ${darkMode ? "text-green-400" : "text-green-800"}`}>
                  Payment consent active · 1 year
                </p>
                <p className={`text-xs mt-0.5 ${darkMode ? "text-green-500/70" : "text-green-700"}`}>
                  Transfers authorised via Face ID — no bank redirect needed
                </p>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${darkMode ? "bg-green-500/20 text-green-400" : "bg-green-200 text-green-800"}`}>
                ACTIVE
              </span>
            </div>

            {/* Disconnect */}
            <button
              onClick={handleDisconnect}
              disabled={disconnecting}
              className={`w-full flex items-center justify-center gap-2 py-4 rounded-2xl border transition-colors font-medium ${
                darkMode
                  ? "border-red-500/40 text-red-400 hover:bg-red-900/20"
                  : "border-red-300 text-red-600 hover:bg-red-50"
              } disabled:opacity-50`}
            >
              {disconnecting ? <Loader className="w-4 h-4 animate-spin" /> : <Unlink className="w-4 h-4" />}
              {disconnecting ? "Disconnecting…" : "Disconnect Bank"}
            </button>
          </>
        ) : (
          <>
            {/* ── NOT LINKED STATE ── */}

            {/* Info box */}
            <div className={darkMode ? "bg-[#1A233A] border border-[#3AC7B1]/30 rounded-xl p-4" : "bg-blue-50 border border-blue-300 rounded-xl p-4"}>
              <div className="flex gap-3">
                <Shield className={`w-5 h-5 flex-shrink-0 mt-0.5 ${darkMode ? "text-[#3AC7B1]" : "text-blue-600"}`} />
                <div>
                  <p className={`text-sm font-semibold ${darkMode ? "text-white" : "text-blue-900"}`}>
                    Secure bank connection via Tink
                  </p>
                  <p className={`text-xs mt-1 ${darkMode ? "text-[#A3B1CC]" : "text-blue-800"}`}>
                    Connect your bank once. SeuroPay uses your <strong>1-year standing consent</strong> to initiate future transfers instantly — no bank login required each time. We never store your credentials.
                  </p>
                </div>
              </div>
            </div>

            {/* Market selector */}
            <div className={`${card} p-5`}>
              <p className={`${textColor} font-semibold mb-3`}>Select your country / bank</p>
              <div className={`rounded-xl overflow-hidden border ${darkMode ? "border-[#2C3A6A]" : "border-gray-200"}`}>
                {TINK_MARKETS.map((m, i) => (
                  <button
                    key={m.id}
                    onClick={() => setSelectedMarket(m.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 transition-all text-left ${
                      i < TINK_MARKETS.length - 1
                        ? darkMode ? "border-b border-[#2C3A6A]" : "border-b border-gray-100"
                        : ""
                    } ${
                      selectedMarket === m.id
                        ? darkMode ? "bg-[#1A3A35]" : "bg-blue-50"
                        : darkMode ? "bg-[#10192B] hover:bg-[#1A233A]" : "bg-white hover:bg-gray-50"
                    }`}
                  >
                    <span className="text-xl">{m.flag}</span>
                    <span className={`flex-1 text-sm font-medium ${textColor}`}>{m.name}</span>
                    {selectedMarket === m.id && (
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${darkMode ? "bg-[#3AC7B1] text-[#10192B]" : "bg-blue-500 text-white"}`}>
                        ✓
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Demo credentials */}
            <div className={darkMode ? "bg-amber-900/30 border border-amber-500/40 rounded-xl p-4" : "bg-amber-50 border border-amber-300 rounded-xl p-4"}>
              <div className="flex gap-2 items-start">
                <Building2 className={`w-4 h-4 mt-0.5 flex-shrink-0 ${darkMode ? "text-amber-400" : "text-amber-600"}`} />
                <div>
                  <p className={`text-xs font-semibold ${darkMode ? "text-amber-300" : "text-amber-800"}`}>Demo bank credentials (Estonia)</p>
                  <p className={`text-xs mt-1 font-mono ${darkMode ? "text-amber-400" : "text-amber-700"}`}>Username: <strong>u45530588</strong></p>
                  <p className={`text-xs font-mono ${darkMode ? "text-amber-400" : "text-amber-700"}`}>Password: <strong>jkw063</strong></p>
                </div>
              </div>
            </div>

            {/* Connect button */}
            <button
              onClick={handleLink}
              disabled={linking}
              className="w-full bg-gradient-to-r from-[#3AC7B1] to-[#6C7A9C] text-white py-4 rounded-2xl shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 font-semibold flex items-center justify-center gap-2"
            >
              {linking ? (
                <Loader className="w-5 h-5 animate-spin" />
              ) : (
                <ExternalLink className="w-5 h-5" />
              )}
              {linking ? "Opening Tink…" : "Connect Bank Account"}
            </button>

            <p className={`${labelColor} text-xs text-center pb-4`}>
              You'll be redirected to Tink once to authorise. After that, all transfers use Face ID with your stored 1-year consent — no bank login needed again.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
