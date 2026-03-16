import React, { useState, useEffect, useCallback } from "react";
import { ArrowLeft, CheckCircle, AlertCircle, Loader } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router";
import { useTheme } from "../context/ThemeContext";
import { getQRSession, payQR, QRSessionInfo } from "../../services/api";
// @ts-ignore — package has types but no default export in some bundler modes
import { Scanner } from "@yudiel/react-qr-scanner";

export function ScanQR(): React.ReactNode {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { darkMode } = useTheme();

  // If the URL already has ?qr=<token> (from a QR code deep-link) skip camera
  const tokenFromUrl = searchParams.get("qr");

  const [phase, setPhase] = useState<"scan" | "preview" | "amount" | "paying" | "success" | "error">(
    tokenFromUrl ? "preview" : "scan"
  );
  const [qrSession, setQrSession] = useState<QRSessionInfo | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState(false);
  // For open-amount QR — payer enters the amount
  const [payerAmount, setPayerAmount] = useState("");
  // The final amount used after payment (may come from session or payerAmount)
  const [paidAmount, setPaidAmount] = useState<number | null>(null);

  // Load QR session from token (either from URL or after scanning)
  const loadSession = useCallback(async (token: string) => {
    try {
      const session = await getQRSession(token);
      if (session.status === "expired") {
        setErrorMsg("This QR code has expired. Ask the recipient to generate a new one.");
        setPhase("error");
        return;
      }
      if (session.status === "paid") {
        setErrorMsg("This QR code has already been paid.");
        setPhase("error");
        return;
      }
      setQrSession(session);
      // If no fixed amount, ask the payer to enter one
      setPhase(session.amount === null ? "amount" : "preview");
    } catch (e: any) {
      setErrorMsg("QR code not recognised — make sure this is a SeuroPay QR.");
      setPhase("error");
    }
  }, []);

  // Auto-load if token in URL
  useEffect(() => {
    if (tokenFromUrl) loadSession(tokenFromUrl);
  }, [tokenFromUrl, loadSession]);

  // Called when the QR scanner decodes a value
  const handleScan = useCallback((results: { rawValue: string }[]) => {
    if (!results?.length) return;
    const text = results[0].rawValue;
    // Extract qr token from deep-link: /#/scan?qr=TOKEN or similar
    const match = text.match(/[?&]qr=([^&]+)/);
    if (match) {
      loadSession(match[1]);
    } else {
      setErrorMsg("QR code not recognised — not a SeuroPay payment QR.");
      setPhase("error");
    }
  }, [loadSession]);

  const handlePay = async (overrideAmount?: number) => {
    if (!qrSession) return;
    setPhase("paying");
    const finalAmount = overrideAmount ?? qrSession.amount ?? undefined;
    try {
      const result = await payQR(qrSession.qrToken, finalAmount);
      setPaidAmount(result.amount ?? finalAmount ?? null);
      setPhase("success");
      setTimeout(() => navigate("/"), 2500);
    } catch (e: any) {
      setErrorMsg(e.message);
      setPhase("error");
    }
  };

  return (
    <div className={darkMode ? "h-full bg-black flex flex-col overflow-hidden" : "h-full bg-white flex flex-col overflow-hidden"}>
      {/* Header */}
      <div className={darkMode ? "bg-black/80 backdrop-blur-sm text-white px-6 pt-8 py-6 relative z-20 flex-shrink-0" : "bg-white border-b border-gray-200 text-gray-900 px-6 pt-8 py-6 relative z-20 flex-shrink-0"}>
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/")}
            className={darkMode ? "p-2 hover:bg-white/20 rounded-xl transition-colors" : "p-2 hover:bg-gray-100 rounded-xl transition-colors"}
          >
            <ArrowLeft className={darkMode ? "w-6 h-6 text-white" : "w-6 h-6 text-gray-900"} />
          </button>
          <h1 className={`text-xl font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}>Scan QR Code</h1>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 relative overflow-hidden">

        {/* ── Scanning phase ── */}
        {phase === "scan" && (
          <>
            {!cameraError ? (
              <div className="absolute inset-0">
                <Scanner
                  onScan={handleScan}
                  onError={() => setCameraError(true)}
                  styles={{ container: { width: "100%", height: "100%" } }}
                  constraints={{ facingMode: "environment" }}
                  components={{ audio: false } as any}
                />
                {/* Corner overlay */}
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  <div className="w-64 h-64 relative">
                    <div className="absolute top-0 left-0 w-12 h-12 border-t-4 border-l-4 border-[#3AC7B1] rounded-tl-2xl"></div>
                    <div className="absolute top-0 right-0 w-12 h-12 border-t-4 border-r-4 border-[#3AC7B1] rounded-tr-2xl"></div>
                    <div className="absolute bottom-0 left-0 w-12 h-12 border-b-4 border-l-4 border-[#3AC7B1] rounded-bl-2xl"></div>
                    <div className="absolute bottom-0 right-0 w-12 h-12 border-b-4 border-r-4 border-[#3AC7B1] rounded-br-2xl"></div>
                    <div className="absolute inset-0 overflow-hidden flex flex-col justify-start">
                      <div className="w-full h-0.5 bg-[#3AC7B1] shadow-lg shadow-[#3AC7B1]/50 animate-bounce"></div>
                    </div>
                  </div>
                </div>
                <div className="absolute bottom-10 left-0 right-0 px-6">
                  <div className={darkMode ? "bg-black/60 backdrop-blur-md rounded-2xl p-4 text-center" : "bg-white/80 backdrop-blur-md rounded-2xl p-4 text-center"}>
                    <p className={darkMode ? "text-white text-sm" : "text-gray-900 text-sm"}>
                      Point your camera at a SeuroPay QR code to pay
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              /* Camera not available fallback */
              <div className="absolute inset-0 flex flex-col items-center justify-center px-8 gap-6">
                <div className={darkMode ? "bg-[#1A233A] rounded-2xl p-6 text-center" : "bg-gray-100 rounded-2xl p-6 text-center"}>
                  <AlertCircle className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
                  <p className={darkMode ? "text-white font-semibold mb-2" : "text-gray-900 font-semibold mb-2"}>Camera not available</p>
                  <p className={darkMode ? "text-[#A3B1CC] text-sm" : "text-gray-600 text-sm"}>
                    Use a shared QR link to pay instead.
                  </p>
                </div>
              </div>
            )}
          </>
        )}

        {/* ── Preview / confirm payment ── */}
        {(phase === "preview" && qrSession) && (
          <div className="absolute inset-0 flex flex-col items-center justify-center px-6 gap-6">
            <div className={darkMode ? "bg-[#181F32] rounded-3xl p-8 w-full max-w-sm shadow-xl" : "bg-white rounded-3xl p-8 w-full max-w-sm shadow-xl border border-gray-200"}>
              <p className={darkMode ? "text-[#A3B1CC] text-sm mb-1 text-center" : "text-gray-500 text-sm mb-1 text-center"}>Paying</p>
              <p className={darkMode ? "text-white text-xl font-bold text-center mb-6" : "text-gray-900 text-xl font-bold text-center mb-6"}>
                {qrSession.payeeDisplayName}
              </p>
              <p className={darkMode ? "text-[#3AC7B1] text-5xl font-bold text-center mb-4" : "text-blue-600 text-5xl font-bold text-center mb-4"}>
                €{(qrSession.amount ?? 0).toFixed(2)}
              </p>
              {qrSession.description && (
                <p className={darkMode ? "text-[#A3B1CC] text-sm text-center mb-6" : "text-gray-500 text-sm text-center mb-6"}>
                  {qrSession.description}
                </p>
              )}
              <button
                onClick={() => handlePay()}
                className="w-full bg-gradient-to-r from-[#3AC7B1] to-[#6C7A9C] text-white py-4 rounded-2xl font-semibold text-lg hover:shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-5 h-5" />
                Confirm & Pay
              </button>
              <button
                onClick={() => navigate("/")}
                className={darkMode ? "w-full mt-3 text-[#A3B1CC] py-3 rounded-2xl text-center" : "w-full mt-3 text-gray-500 py-3 rounded-2xl text-center"}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* ── Open-amount: payer enters the amount ── */}
        {(phase === "amount" && qrSession) && (
          <div className="absolute inset-0 flex flex-col items-center justify-center px-6 gap-6">
            <div className={darkMode ? "bg-[#181F32] rounded-3xl p-8 w-full max-w-sm shadow-xl" : "bg-white rounded-3xl p-8 w-full max-w-sm shadow-xl border border-gray-200"}>
              <p className={darkMode ? "text-[#A3B1CC] text-sm mb-1 text-center" : "text-gray-500 text-sm mb-1 text-center"}>Paying</p>
              <p className={darkMode ? "text-white text-xl font-bold text-center mb-6" : "text-gray-900 text-xl font-bold text-center mb-6"}>
                {qrSession.payeeDisplayName}
              </p>
              {qrSession.description && (
                <p className={darkMode ? "text-[#A3B1CC] text-sm text-center mb-4" : "text-gray-500 text-sm text-center mb-4"}>
                  {qrSession.description}
                </p>
              )}
              <label className={darkMode ? "text-[#A3B1CC] text-sm mb-2 block" : "text-gray-600 text-sm mb-2 block"}>Enter amount (€)</label>
              <input
                type="number"
                placeholder="0.00"
                value={payerAmount}
                onChange={(e) => setPayerAmount(e.target.value)}
                className={darkMode
                  ? "w-full bg-[#10192B] border border-[#2C3A6A] rounded-2xl px-6 py-4 text-white text-3xl font-bold placeholder-[#6C7A9C] focus:outline-none focus:border-[#3AC7B1] mb-6 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  : "w-full bg-gray-50 border border-gray-300 rounded-2xl px-6 py-4 text-gray-900 text-3xl font-bold placeholder-gray-400 focus:outline-none focus:border-blue-500 mb-6 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"}
              />
              <button
                onClick={() => {
                  const amt = parseFloat(payerAmount);
                  if (!amt || amt <= 0) return;
                  handlePay(amt);
                }}
                disabled={!payerAmount || parseFloat(payerAmount) <= 0}
                className={`w-full py-4 rounded-2xl font-semibold text-lg transition-all flex items-center justify-center gap-2 ${
                  payerAmount && parseFloat(payerAmount) > 0
                    ? "bg-gradient-to-r from-[#3AC7B1] to-[#6C7A9C] text-white hover:shadow-lg"
                    : darkMode ? "bg-[#1A233A] text-[#6C7A9C] cursor-not-allowed" : "bg-gray-200 text-gray-400 cursor-not-allowed"
                }`}
              >
                <CheckCircle className="w-5 h-5" />
                Confirm & Pay
              </button>
              <button
                onClick={() => navigate("/")}
                className={darkMode ? "w-full mt-3 text-[#A3B1CC] py-3 rounded-2xl text-center" : "w-full mt-3 text-gray-500 py-3 rounded-2xl text-center"}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* ── Paying ── */}
        {phase === "paying" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
            <Loader className="w-16 h-16 animate-spin text-[#3AC7B1]" />
            <p className={darkMode ? "text-white text-lg" : "text-gray-900 text-lg"}>Processing payment…</p>
          </div>
        )}

        {/* ── Success ── */}
        {phase === "success" && (
          <div className="absolute inset-0 bg-gradient-to-br from-[#3AC7B1] to-[#2a9f8f] flex flex-col items-center justify-center px-6">
            <CheckCircle className="w-24 h-24 text-white mb-6" />
            <h2 className="text-white text-3xl font-bold mb-2">Payment Sent!</h2>
            <p className="text-white/80 text-center text-lg">
              €{(paidAmount ?? 0).toFixed(2)} to {qrSession?.payeeDisplayName}
            </p>
          </div>
        )}

        {/* ── Error ── */}
        {phase === "error" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center px-6 gap-6">
            <AlertCircle className="w-20 h-20 text-red-400" />
            <p className={darkMode ? "text-white text-xl font-semibold text-center" : "text-gray-900 text-xl font-semibold text-center"}>
              {errorMsg}
            </p>
            <button
              onClick={() => { setPhase("scan"); setErrorMsg(null); }}
              className="bg-gradient-to-r from-[#3AC7B1] to-[#6C7A9C] text-white py-4 px-8 rounded-2xl font-semibold"
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
