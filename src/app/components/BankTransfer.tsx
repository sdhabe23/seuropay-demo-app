/**
 * BankTransfer.tsx — Instant in-app bank transfer.
 *
 * The Tink sandbox only provides redirect-based banks for EE (PSD2 SCA requirement).
 * Since this is a demo, we use the /api/tink/transfer endpoint which:
 *  - Adjusts account balances in the local store
 *  - Records a SETTLED transaction visible in History
 *  - Mimics what a real pre-consented PIS payment would produce
 *
 * Flow:
 *  1. Enter amount + message
 *  2. Review summary
 *  3. Face ID auth (2-second scan animation) → fires transfer
 *  4. Success screen with new balance + transaction ref
 */
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import {
  ArrowLeft, Landmark, Loader2, CheckCircle2,
  ChevronRight, ShieldCheck,
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { useBankData } from "../context/BankContext";
import { simulateTransfer } from "../../services/api";

const DEST_IBAN = "EE468233973006396045";
const DEST_NAME = "SeuroPay Checking Account 2";

type Phase = "enter" | "review" | "faceid" | "success";

interface TransferResult {
  transactionId: string;
  amount: number;
  fromAccount: string;
  toAccount: string;
  toIban: string;
  newSourceBalance: number;
  settledAt: string;
  message: string;
}

export function BankTransfer(): React.ReactNode {
  const navigate = useNavigate();
  const { darkMode } = useTheme();
  const { accounts, selectedAccountId, addTinkPayment, refresh } = useBankData();

  const [phase, setPhase] = useState<Phase>("enter");
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");
  const [scanning, setScanning] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<TransferResult | null>(null);
  const confirmedRef = useRef(false);

  // Source account
  const sourceAccount = selectedAccountId
    ? accounts.find((a) => a.id === selectedAccountId)
    : accounts.find((a) => a.accountNumber !== DEST_IBAN) ?? accounts[0];

  const sourceIban =
    typeof sourceAccount?.identifiers === "string"
      ? (sourceAccount.identifiers.match(/iban:\/\/([^"]+)/) || [])[1] ?? ""
      : sourceAccount?.identifiers?.iban?.iban ?? sourceAccount?.accountNumber ?? "";

  const numAmount = parseFloat(amount);
  const valid = !!amount && !isNaN(numAmount) && numAmount > 0;

  // ── Face ID auto-scan → fire transfer ───────────────────────────────────
  useEffect(() => {
    if (phase !== "faceid") return;
    confirmedRef.current = false;
    setScanning(true);
    setError(null);

    // Simulate Face ID scan (2 s), then fire the transfer
    const scanTimer = setTimeout(async () => {
      if (confirmedRef.current) return;
      confirmedRef.current = true;
      setScanning(false);
      setLoading(true);
      try {
        const res = await simulateTransfer({
          amount: numAmount,
          sourceAccountId: sourceAccount?.id ?? sourceAccount?.accountNumber,
          message: message || `Bank transfer to ${DEST_NAME}`,
        });

        addTinkPayment({
          id: res.transactionId,
          amount: res.amount,
          currency: res.currency,
          market: "EE",
          message: res.message,
          status: "SETTLED",
          createdAt: Date.now(),
        });

        try { await refresh(); } catch (_) {}
        setResult(res);
        setPhase("success");
      } catch (e: any) {
        setError(e.message ?? "Transfer failed");
        setPhase("review");
      } finally {
        setLoading(false);
      }
    }, 2000);

    return () => clearTimeout(scanTimer);
  }, [phase]);

  // ── Styles ───────────────────────────────────────────────────────────────
  const bg = darkMode ? "bg-[#10192B]" : "bg-gradient-to-br from-blue-50 to-indigo-100";
  const header = darkMode
    ? "px-6 pt-8 pb-4 flex items-center gap-4 bg-[#181F32] flex-shrink-0 rounded-t-3xl"
    : "px-6 pt-8 pb-4 flex items-center gap-4 bg-white border-b border-gray-200 flex-shrink-0 rounded-t-3xl";
  const card = darkMode ? "bg-[#181F32] rounded-2xl p-4" : "bg-white rounded-2xl p-4 border border-gray-200";
  const destCard = darkMode
    ? "bg-[#181F32] rounded-2xl p-4 border border-[#3AC7B1]/30"
    : "bg-emerald-50 rounded-2xl p-4 border border-emerald-200";
  const label = darkMode ? "text-[#A3B1CC] text-xs mb-1" : "text-gray-500 text-xs mb-1";
  const title = darkMode ? "text-white font-semibold" : "text-gray-900 font-semibold";
  const sub = darkMode ? "text-[#6C7A9C] text-xs font-mono mt-0.5" : "text-gray-400 text-xs font-mono mt-0.5";
  const inputCls = (accent: string) =>
    darkMode
      ? `w-full bg-[#181F32] border border-[#2C3A6A] rounded-2xl px-6 py-4 text-white ${accent} placeholder-[#6C7A9C] focus:outline-none focus:border-[#3AC7B1] transition-colors`
      : `w-full bg-white border border-gray-300 rounded-2xl px-6 py-4 text-gray-900 ${accent} placeholder-gray-400 focus:outline-none focus:border-emerald-500 transition-colors`;
  const btnPrimary = `w-full rounded-2xl py-4 font-semibold text-lg bg-gradient-to-r from-[#3AC7B1] to-[#2A9E8A] text-white hover:shadow-lg flex items-center justify-center gap-2 transition-all`;
  const btnSecondary = darkMode
    ? "w-full bg-[#181F32] border border-[#2C3A6A] text-[#A3B1CC] rounded-2xl py-4 font-semibold text-lg hover:bg-[#1F2A3A] transition-colors"
    : "w-full bg-white border border-gray-200 text-gray-700 rounded-2xl py-4 font-semibold text-lg hover:bg-gray-50 transition-colors";

  // ── Phase: Enter amount ──────────────────────────────────────────────────
  if (phase === "enter") {
    return (
      <div className={`${bg} h-full w-full rounded-3xl flex flex-col shadow-xl`}>
        <div className={header}>
          <button onClick={() => navigate("/payment-method")} className={darkMode ? "p-2 hover:bg-white/20 rounded-xl" : "p-2 hover:bg-gray-100 rounded-xl"}>
            <ArrowLeft className={darkMode ? "w-6 h-6 text-white" : "w-6 h-6 text-gray-900"} />
          </button>
          <Landmark className="w-6 h-6 text-[#3AC7B1]" />
          <h1 className={darkMode ? "text-white text-xl font-semibold" : "text-gray-900 text-xl font-semibold"}>Bank Transfer</h1>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {sourceAccount && (
            <div className={card}>
              <p className={label}>From</p>
              <p className={title}>{sourceAccount.name}</p>
              {sourceIban && <p className={sub}>{sourceIban}</p>}
              {typeof sourceAccount.balance === "number" && (
                <p className={darkMode ? "text-[#3AC7B1] text-sm font-semibold mt-1" : "text-emerald-600 text-sm font-semibold mt-1"}>
                  Balance: €{sourceAccount.balance.toLocaleString("en", { minimumFractionDigits: 2 })}
                </p>
              )}
            </div>
          )}

          <div className={destCard}>
            <p className={label}>To</p>
            <p className={title}>{DEST_NAME}</p>
            <p className={darkMode ? "text-[#3AC7B1] text-xs font-mono mt-0.5" : "text-emerald-600 text-xs font-mono mt-0.5"}>{DEST_IBAN}</p>
          </div>

          <div>
            <label className={darkMode ? "text-[#A3B1CC] text-sm mb-2 block" : "text-gray-600 text-sm mb-2 block"}>Amount (€)</label>
            <input
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className={`${inputCls("text-3xl font-bold")} [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`}
            />
          </div>

          <div>
            <label className={darkMode ? "text-[#A3B1CC] text-sm mb-2 block" : "text-gray-600 text-sm mb-2 block"}>Message (optional)</label>
            <input
              type="text"
              placeholder="e.g. Rent, Invoice #42…"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className={inputCls("text-base")}
            />
          </div>
        </div>

        <div className="p-6 space-y-3 flex-shrink-0">
          <button onClick={() => setPhase("review")} disabled={!valid} className={`${btnPrimary} ${!valid ? "opacity-40 cursor-not-allowed" : ""}`}>
            Review Transfer <ChevronRight className="w-5 h-5" />
          </button>
          <button onClick={() => navigate("/payment-method")} className={btnSecondary}>Cancel</button>
        </div>
      </div>
    );
  }

  // ── Phase: Review ────────────────────────────────────────────────────────
  if (phase === "review") {
    return (
      <div className={`${bg} h-full w-full rounded-3xl flex flex-col shadow-xl`}>
        <div className={header}>
          <button onClick={() => setPhase("enter")} className={darkMode ? "p-2 hover:bg-white/20 rounded-xl" : "p-2 hover:bg-gray-100 rounded-xl"}>
            <ArrowLeft className={darkMode ? "w-6 h-6 text-white" : "w-6 h-6 text-gray-900"} />
          </button>
          <h1 className={darkMode ? "text-white text-xl font-semibold" : "text-gray-900 text-xl font-semibold"}>Confirm Transfer</h1>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center p-6 gap-5">
          {/* Amount hero */}
          <div className="text-center">
            <p className={darkMode ? "text-[#A3B1CC] text-sm" : "text-gray-500 text-sm"}>You're sending</p>
            <p className={darkMode ? "text-white text-5xl font-bold mt-1" : "text-gray-900 text-5xl font-bold mt-1"}>
              €{numAmount.toFixed(2)}
            </p>
          </div>

          {/* From → To */}
          <div className={`${card} w-full space-y-4`}>
            <div>
              <p className={label}>From</p>
              <p className={title}>{sourceAccount?.name}</p>
              <p className={sub}>{sourceIban}</p>
            </div>
            <div className="border-t border-dashed" style={{ borderColor: darkMode ? "#2C3A6A" : "#E5E7EB" }} />
            <div>
              <p className={label}>To</p>
              <p className={title}>{DEST_NAME}</p>
              <p className={darkMode ? "text-[#3AC7B1] text-xs font-mono mt-0.5" : "text-emerald-600 text-xs font-mono mt-0.5"}>{DEST_IBAN}</p>
            </div>
            {message && (
              <>
                <div className="border-t border-dashed" style={{ borderColor: darkMode ? "#2C3A6A" : "#E5E7EB" }} />
                <div>
                  <p className={label}>Message</p>
                  <p className={title}>{message}</p>
                </div>
              </>
            )}
          </div>

          {error && <p className="text-red-400 text-sm text-center">{error}</p>}

          <div className={darkMode ? "bg-[#1A3A35] border border-[#3AC7B1]/30 rounded-xl p-4 w-full" : "bg-emerald-50 border border-emerald-200 rounded-xl p-4 w-full"}>
            <p className={darkMode ? "text-[#3AC7B1] text-xs text-center" : "text-emerald-700 text-xs text-center"}>
              Authorised via your linked bank consent · Secured by Face ID
            </p>
          </div>
        </div>

        <div className="p-6 space-y-3 flex-shrink-0">
          <button onClick={() => setPhase("faceid")} className={btnPrimary}>
            <ShieldCheck className="w-5 h-5" /> Authorise with Face ID
          </button>
          <button onClick={() => setPhase("enter")} className={btnSecondary}>Back</button>
        </div>
      </div>
    );
  }

  // ── Phase: Face ID ───────────────────────────────────────────────────────
  if (phase === "faceid") {
    return (
      <div className={`${bg} h-full w-full rounded-3xl flex flex-col items-center justify-center shadow-xl`}>
        <style>{`
          @keyframes face-frame-pulse {
            0%, 100% { stroke-opacity: 0.3; }
            50% { stroke-opacity: 1; }
          }
          @keyframes success-check {
            0% { opacity: 0; transform: scale(0); }
            100% { opacity: 1; transform: scale(1); }
          }
          .face-frame { animation: face-frame-pulse 1.2s ease-in-out infinite; }
          .success-check { animation: success-check 0.5s ease-out forwards; }
        `}</style>

        <div className="relative w-64 h-72 flex items-center justify-center mb-6">
          {scanning ? (
            <>
              <svg width="220" height="260" viewBox="0 0 220 260" fill="none" className="absolute">
                <path d="M 20 40 L 20 20 L 40 20" stroke="#3AC7B1" strokeWidth="3" strokeLinecap="round" className="face-frame" />
                <path d="M 180 20 L 200 20 L 200 40" stroke="#3AC7B1" strokeWidth="3" strokeLinecap="round" className="face-frame" />
                <path d="M 20 220 L 20 240 L 40 240" stroke="#3AC7B1" strokeWidth="3" strokeLinecap="round" className="face-frame" />
                <path d="M 180 240 L 200 240 L 200 220" stroke="#3AC7B1" strokeWidth="3" strokeLinecap="round" className="face-frame" />
              </svg>
              {/* Face outline */}
              <svg width="140" height="180" viewBox="0 0 140 180" fill="none" className="face-frame">
                <ellipse cx="70" cy="85" rx="55" ry="70" stroke="#3AC7B1" strokeWidth="1.5" strokeDasharray="4 4" />
                <circle cx="45" cy="72" r="7" fill="#3AC7B1" fillOpacity="0.4" />
                <circle cx="95" cy="72" r="7" fill="#3AC7B1" fillOpacity="0.4" />
                <path d="M 50 110 Q 70 125 90 110" stroke="#3AC7B1" strokeWidth="2" strokeLinecap="round" fill="none" />
              </svg>
              {/* Scan line */}
              <div className="absolute w-36 h-0.5 bg-gradient-to-r from-transparent via-[#3AC7B1] to-transparent"
                style={{ animation: "scan 1.5s ease-in-out infinite", top: "40%" }} />
            </>
          ) : (
            <div className="success-check">
              <div className="w-28 h-28 rounded-full bg-green-500/20 flex items-center justify-center">
                <CheckCircle2 className="w-16 h-16 text-green-500" />
              </div>
            </div>
          )}
        </div>

        <p className={darkMode ? "text-white text-xl font-semibold mb-2" : "text-gray-900 text-xl font-semibold mb-2"}>
          {scanning ? "Scanning…" : loading ? "Processing…" : "Authorised"}
        </p>
        <p className={darkMode ? "text-[#A3B1CC] text-sm" : "text-gray-500 text-sm"}>
          {scanning ? `Authorising €${numAmount.toFixed(2)} transfer` : "Transfer in progress"}
        </p>

        {(scanning || loading) && (
          <Loader2 className="w-6 h-6 text-[#3AC7B1] animate-spin mt-6" />
        )}
      </div>
    );
  }

  // ── Phase: Success ───────────────────────────────────────────────────────
  return (
    <div className={`${bg} h-full w-full rounded-3xl flex flex-col shadow-xl`}>
      <div className="flex-1 flex flex-col items-center justify-center p-6 gap-6">
        <div className={darkMode ? "w-24 h-24 rounded-full bg-green-900/40 flex items-center justify-center" : "w-24 h-24 rounded-full bg-green-100 flex items-center justify-center"}>
          <CheckCircle2 className="w-12 h-12 text-green-500" />
        </div>

        <div className="text-center space-y-1">
          <h2 className={darkMode ? "text-white text-2xl font-bold" : "text-gray-900 text-2xl font-bold"}>Transfer Complete!</h2>
          <p className={darkMode ? "text-[#3AC7B1] text-4xl font-bold mt-2" : "text-emerald-600 text-4xl font-bold mt-2"}>
            €{result?.amount.toFixed(2)}
          </p>
        </div>

        {result && (
          <div className={`${card} w-full space-y-3`}>
            <div className="flex justify-between">
              <span className={darkMode ? "text-[#A3B1CC] text-sm" : "text-gray-500 text-sm"}>From</span>
              <span className={darkMode ? "text-white text-sm font-semibold" : "text-gray-900 text-sm font-semibold"}>{result.fromAccount}</span>
            </div>
            <div className="flex justify-between">
              <span className={darkMode ? "text-[#A3B1CC] text-sm" : "text-gray-500 text-sm"}>To</span>
              <span className={darkMode ? "text-white text-sm font-semibold" : "text-gray-900 text-sm font-semibold"}>{result.toAccount}</span>
            </div>
            <div className="flex justify-between">
              <span className={darkMode ? "text-[#A3B1CC] text-sm" : "text-gray-500 text-sm"}>New balance</span>
              <span className={darkMode ? "text-[#3AC7B1] text-sm font-semibold" : "text-emerald-600 text-sm font-semibold"}>€{result.newSourceBalance.toLocaleString("en", { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between">
              <span className={darkMode ? "text-[#A3B1CC] text-sm" : "text-gray-500 text-sm"}>Status</span>
              <span className="text-green-500 text-sm font-semibold">Settled ✓</span>
            </div>
            <div className="flex justify-between">
              <span className={darkMode ? "text-[#A3B1CC] text-sm" : "text-gray-500 text-sm"}>Ref</span>
              <span className={darkMode ? "text-[#6C7A9C] text-xs font-mono" : "text-gray-400 text-xs font-mono"}>{result.transactionId.slice(0, 16)}</span>
            </div>
          </div>
        )}
      </div>

      <div className="p-6 space-y-3 flex-shrink-0">
        <button onClick={() => navigate("/")} className={btnPrimary}>Back to Home</button>
        <button onClick={() => { setPhase("enter"); setAmount(""); setMessage(""); setError(null); setResult(null); }} className={btnSecondary}>
          New Transfer
        </button>
      </div>
    </div>
  );
}
