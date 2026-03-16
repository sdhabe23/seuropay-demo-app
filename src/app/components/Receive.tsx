import React, { useState, useEffect, useCallback } from 'react';
import { Radio, ArrowLeft, Copy, CheckCircle2, RefreshCw, Loader2 } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router';
import { useTheme } from '../context/ThemeContext';
import { createQRSession } from '../../services/api';
import { useBankData } from '../context/BankContext';

export function Receive(): React.ReactNode {
  const navigate = useNavigate();
  const location = useLocation();
  const { darkMode } = useTheme();
  const { lastPaymentEvent, clearPaymentEvent } = useBankData();
  const [activeTab, setActiveTab] = useState<'qr' | 'nfc'>('qr');
  const [copied, setCopied] = useState(false);

  // QR session state
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [qrToken, setQrToken] = useState<string | null>(null);
  const [qrExpiry, setQrExpiry] = useState<number | null>(null);
  const [qrLoading, setQrLoading] = useState(false);
  const [qrError, setQrError] = useState<string | null>(null);
  const [secondsLeft, setSecondsLeft] = useState<number>(0);

  // Parse amount/description passed from ReceiveAmount screen via location.state
  const amount: number | undefined = (location.state as { amount?: number; description?: string })?.amount;
  const description: string | undefined = (location.state as { amount?: number; description?: string })?.description;

  const paymentLink = qrToken
    ? `${window.location.origin}${window.location.pathname}#/scan?qr=${qrToken}`
    : '';

  const generateQR = useCallback(async () => {
    setQrLoading(true);
    setQrError(null);
    try {
      const session = await createQRSession(amount, description);
      setQrDataUrl(session.qrDataUrl);
      setQrToken(session.qrToken);
      setQrExpiry(session.expiresAt);
      setSecondsLeft(Math.max(0, Math.round((session.expiresAt - Date.now()) / 1000)));
    } catch (err: unknown) {
      setQrError(err instanceof Error ? err.message : 'Failed to generate QR code');
    } finally {
      setQrLoading(false);
    }
  }, [amount, description]);

  // Generate QR on mount (QR tab)
  useEffect(() => {
    if (activeTab === 'qr') {
      generateQR();
    }
  }, [activeTab, generateQR]);

  // Countdown timer
  useEffect(() => {
    if (!qrExpiry) return;
    const id = setInterval(() => {
      const secs = Math.max(0, Math.round((qrExpiry - Date.now()) / 1000));
      setSecondsLeft(secs);
      if (secs === 0) clearInterval(id);
    }, 1000);
    return () => clearInterval(id);
  }, [qrExpiry]);

  // Listen for PAYMENT_RECEIVED via BankContext WS event
  useEffect(() => {
    if (lastPaymentEvent?.type === 'PAYMENT_RECEIVED' && lastPaymentEvent.qrToken === qrToken) {
      clearPaymentEvent();
      navigate('/money-received');
    }
  }, [lastPaymentEvent, qrToken, clearPaymentEvent, navigate]);

  const handleCopyLink = async () => {
    if (!paymentLink) return;
    await navigator.clipboard.writeText(paymentLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatCountdown = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // Fallback static QR SVG (only shown when backend unavailable)
  const StaticQRCodeSVG = () => (
    <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-64 h-64 mx-auto opacity-30">
      <rect width="200" height="200" fill="white"/>
      <rect x="10" y="10" width="60" height="60" fill="none" stroke="#1F2937" strokeWidth="8"/>
      <rect x="28" y="28" width="24" height="24" fill="#1F2937"/>
      <rect x="130" y="10" width="60" height="60" fill="none" stroke="#1F2937" strokeWidth="8"/>
      <rect x="148" y="28" width="24" height="24" fill="#1F2937"/>
      <rect x="10" y="130" width="60" height="60" fill="none" stroke="#1F2937" strokeWidth="8"/>
      <rect x="28" y="148" width="24" height="24" fill="#1F2937"/>
    </svg>
  );

  return (
    <div className={darkMode ? "h-full w-full bg-[#10192B] flex flex-col" : "h-full w-full bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col"}>
      {/* Header */}
      <div className={darkMode ? "pt-6 pb-4 px-6 flex items-center gap-4 bg-[#181F32]" : "pt-6 pb-4 px-6 flex items-center gap-4 bg-white border-b border-gray-200"}>
        <button
          onClick={() => navigate('/')}
          className={darkMode ? "p-2 hover:bg-[#1A233A] rounded-lg transition-colors flex-shrink-0" : "p-2 hover:bg-blue-100 rounded-lg transition-colors flex-shrink-0"}
        >
          <ArrowLeft className={darkMode ? "w-6 h-6 text-white" : "w-6 h-6 text-gray-900"} />
        </button>
        <h1 className={darkMode ? "text-white text-2xl font-bold" : "text-gray-900 text-2xl font-bold"}>Receive</h1>
      </div>

      {/* Tab Selection */}
      <div className="px-6 pt-4 pb-4 flex gap-3">
        <button
          onClick={() => setActiveTab('qr')}
          className={`flex-1 py-3 rounded-2xl font-medium transition-all ${
            darkMode
              ? activeTab === 'qr' ? 'bg-[#2C3A6A] text-white' : 'bg-[#1A233A] text-[#6C7A9C]'
              : activeTab === 'qr' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'
          }`}
        >
          QR Code
        </button>
        <button
          onClick={() => setActiveTab('nfc')}
          className={`flex-1 py-3 rounded-2xl font-medium transition-all ${
            darkMode
              ? activeTab === 'nfc' ? 'bg-[#2C3A6A] text-white' : 'bg-[#1A233A] text-[#6C7A9C]'
              : activeTab === 'nfc' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'
          }`}
        >
          NFC Tap
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 px-6 flex flex-col items-center justify-center py-4 overflow-y-auto">
        {activeTab === 'qr' && (
          <>
            {/* Amount badge */}
            {amount !== undefined && (
              <div className={darkMode ? "mb-4 px-6 py-2 rounded-full bg-[#1A233A] border border-[#2C3A6A]" : "mb-4 px-6 py-2 rounded-full bg-white border border-gray-200 shadow"}>
                <span className={darkMode ? "text-[#3AC7B1] font-bold text-lg" : "text-blue-600 font-bold text-lg"}>
                  {amount} EUR
                </span>
                {description && (
                  <span className={darkMode ? "text-[#A3B1CC] text-sm ml-2" : "text-gray-500 text-sm ml-2"}>· {description}</span>
                )}
              </div>
            )}

            {/* QR Display */}
            <div className="bg-white rounded-3xl p-5 shadow-2xl relative">
              {qrLoading && (
                <div className="w-64 h-64 flex items-center justify-center">
                  <Loader2 className="w-12 h-12 text-gray-400 animate-spin" />
                </div>
              )}
              {!qrLoading && qrError && (
                <div className="w-64 h-64 flex flex-col items-center justify-center gap-3">
                  <StaticQRCodeSVG />
                  <p className="text-red-500 text-xs text-center px-4">{qrError}</p>
                  <button
                    onClick={generateQR}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-xl text-sm font-medium"
                  >
                    <RefreshCw className="w-4 h-4" /> Retry
                  </button>
                </div>
              )}
              {!qrLoading && !qrError && qrDataUrl && (
                <img src={qrDataUrl} alt="Payment QR Code" className="w-64 h-64 rounded-xl" />
              )}
            </div>

            {/* Expiry countdown */}
            {!qrLoading && !qrError && qrToken && (
              <div className="mt-3 flex items-center gap-2">
                {secondsLeft > 0 ? (
                  <>
                    <span className={darkMode ? "text-[#A3B1CC] text-xs" : "text-gray-500 text-xs"}>
                      Expires in
                    </span>
                    <span className={`text-xs font-mono font-bold ${secondsLeft < 60 ? 'text-red-400' : darkMode ? 'text-[#3AC7B1]' : 'text-blue-600'}`}>
                      {formatCountdown(secondsLeft)}
                    </span>
                    <button onClick={generateQR} className={darkMode ? "p-1 hover:bg-[#1A233A] rounded" : "p-1 hover:bg-gray-100 rounded"}>
                      <RefreshCw className={`w-3 h-3 ${darkMode ? 'text-[#6C7A9C]' : 'text-gray-400'}`} />
                    </button>
                  </>
                ) : (
                  <button
                    onClick={generateQR}
                    className="flex items-center gap-2 px-4 py-2 bg-[#3AC7B1] text-[#10192B] rounded-xl text-sm font-medium"
                  >
                    <RefreshCw className="w-4 h-4" /> Generate New QR
                  </button>
                )}
              </div>
            )}

            {/* Waiting indicator */}
            {!qrLoading && !qrError && qrToken && secondsLeft > 0 && (
              <p className={darkMode ? "mt-3 text-[#6C7A9C] text-xs text-center" : "mt-3 text-gray-400 text-xs text-center"}>
                Waiting for payment…
              </p>
            )}
          </>
        )}

        {activeTab === 'nfc' && (
          <div className="text-center cursor-pointer group" onClick={() => navigate("/money-received")}>
            <div className={darkMode
              ? "w-48 h-48 mx-auto bg-[#1A233A] rounded-full border-4 border-[#3AC7B1] flex items-center justify-center mb-6 animate-pulse group-hover:scale-105 group-hover:shadow-2xl group-hover:shadow-[#3AC7B1]/50 transition-all duration-300"
              : "w-48 h-48 mx-auto bg-blue-100 rounded-full border-4 border-[#3AC7B1] flex items-center justify-center mb-6 animate-pulse group-hover:scale-105 group-hover:shadow-2xl group-hover:shadow-blue-300/50 transition-all duration-300"
            }>
              <Radio className="w-24 h-24 text-[#3AC7B1]" />
            </div>
            <p className={darkMode ? "text-white text-lg font-medium mb-2" : "text-gray-900 text-lg font-medium mb-2"}>Ready to Receive</p>
            <p className={darkMode ? "text-[#A3B1CC] text-sm" : "text-gray-600 text-sm"}>Hold your phone near the sender's device to receive payment securely via NFC.</p>
          </div>
        )}
      </div>

      {/* Payment Link — QR tab only */}
      {activeTab === 'qr' && paymentLink && (
        <div className="px-6 pb-8 pt-2 flex-shrink-0">
          <div className={darkMode ? "bg-gradient-to-br from-[#1A233A] to-[#181F32] border border-[#2C3A6A] rounded-2xl p-4 shadow-lg" : "bg-white border border-gray-200 rounded-2xl p-4 shadow-lg"}>
            <p className={darkMode ? "text-[#A3B1CC] text-xs mb-3 font-medium" : "text-gray-600 text-xs mb-3 font-medium"}>Payment Link</p>
            <div className={darkMode ? "flex items-center gap-3 bg-[#10192B] rounded-xl p-3" : "flex items-center gap-3 bg-gray-50 rounded-xl p-3"}>
              <span className={darkMode ? "text-white font-mono text-xs flex-1 truncate" : "text-gray-900 font-mono text-xs flex-1 truncate"}>{paymentLink}</span>
              <button
                onClick={handleCopyLink}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-medium transition-all duration-300 flex-shrink-0 text-xs ${
                  copied
                    ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                    : darkMode ? 'bg-[#3AC7B1] text-[#10192B] hover:bg-[#2DB5A0]' : 'bg-blue-500 text-white hover:bg-blue-600'
                }`}
              >
                {copied ? <><CheckCircle2 className="w-3 h-3" /> Copied!</> : <><Copy className="w-3 h-3" /> Copy</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
