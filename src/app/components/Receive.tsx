import React, { useState } from 'react';
import { Radio, ArrowLeft, Copy, CheckCircle2 } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router';
import { useTheme } from '../context/ThemeContext';

export function Receive(): React.ReactNode {
  const navigate = useNavigate();
  const location = useLocation();
  const { darkMode } = useTheme();
  const [activeTab, setActiveTab] = useState<'qr' | 'nfc'>('qr');
  const [copied, setCopied] = useState(false);
  const paymentLink = 'seuropay/saurabh_dhabe';

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(paymentLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Elegant QR Code SVG with square dots
  const QRCodeSVG = () => (
    <svg viewBox="0 0 464 464" xmlns="http://www.w3.org/2000/svg" className="w-80 h-80 mx-auto">
      {/* White background with rounded corners */}
      <rect width="464" height="464" fill="white" rx="40" ry="40"/>
      
      {/* Top-left position marker with rounded corners */}
      <rect x="50" y="50" width="90" height="90" fill="none" stroke="#1F2937" strokeWidth="16" rx="18" ry="18"/>
      <rect x="78" y="78" width="34" height="34" fill="#1F2937" rx="4" ry="4"/>
      
      {/* Top-right position marker */}
      <rect x="324" y="50" width="90" height="90" fill="none" stroke="#1F2937" strokeWidth="16" rx="18" ry="18"/>
      <rect x="352" y="78" width="34" height="34" fill="#1F2937" rx="4" ry="4"/>
      
      {/* Bottom-left position marker */}
      <rect x="50" y="324" width="90" height="90" fill="none" stroke="#1F2937" strokeWidth="16" rx="18" ry="18"/>
      <rect x="78" y="352" width="34" height="34" fill="#1F2937" rx="4" ry="4"/>
      
      {/* Timing patterns - Horizontal squares */}
      <rect x="152" y="22" width="16" height="16" fill="#1F2937" rx="2" ry="2"/>
      <rect x="206" y="22" width="16" height="16" fill="#1F2937" rx="2" ry="2"/>
      <rect x="260" y="22" width="16" height="16" fill="#1F2937" rx="2" ry="2"/>
      
      <rect x="152" y="426" width="16" height="16" fill="#1F2937" rx="2" ry="2"/>
      <rect x="206" y="426" width="16" height="16" fill="#1F2937" rx="2" ry="2"/>
      <rect x="260" y="426" width="16" height="16" fill="#1F2937" rx="2" ry="2"/>
      
      {/* Timing patterns - Vertical squares */}
      <rect x="22" y="152" width="16" height="16" fill="#1F2937" rx="2" ry="2"/>
      <rect x="22" y="206" width="16" height="16" fill="#1F2937" rx="2" ry="2"/>
      <rect x="22" y="260" width="16" height="16" fill="#1F2937" rx="2" ry="2"/>
      
      <rect x="426" y="152" width="16" height="16" fill="#1F2937" rx="2" ry="2"/>
      <rect x="426" y="206" width="16" height="16" fill="#1F2937" rx="2" ry="2"/>
      <rect x="426" y="260" width="16" height="16" fill="#1F2937" rx="2" ry="2"/>
      
      {/* QR data pattern - square dots */}
      <rect x="152" y="152" width="16" height="16" fill="#1F2937" rx="2" ry="2"/>
      <rect x="182" y="152" width="16" height="16" fill="#1F2937" rx="2" ry="2"/>
      <rect x="212" y="152" width="16" height="16" fill="#1F2937" rx="2" ry="2"/>
      <rect x="242" y="152" width="16" height="16" fill="#1F2937" rx="2" ry="2"/>
      <rect x="272" y="152" width="16" height="16" fill="#1F2937" rx="2" ry="2"/>
      
      <rect x="152" y="182" width="16" height="16" fill="#1F2937" rx="2" ry="2"/>
      <rect x="182" y="182" width="16" height="16" fill="#1F2937" rx="2" ry="2"/>
      <rect x="212" y="182" width="16" height="16" fill="#1F2937" rx="2" ry="2"/>
      <rect x="242" y="182" width="16" height="16" fill="#1F2937" rx="2" ry="2"/>
      <rect x="272" y="182" width="16" height="16" fill="#1F2937" rx="2" ry="2"/>
      
      <rect x="152" y="212" width="16" height="16" fill="#1F2937" rx="2" ry="2"/>
      <rect x="182" y="212" width="16" height="16" fill="#1F2937" rx="2" ry="2"/>
      <rect x="212" y="212" width="16" height="16" fill="#1F2937" rx="2" ry="2"/>
      <rect x="242" y="212" width="16" height="16" fill="#1F2937" rx="2" ry="2"/>
      <rect x="272" y="212" width="16" height="16" fill="#1F2937" rx="2" ry="2"/>
      
      <rect x="152" y="242" width="16" height="16" fill="#1F2937" rx="2" ry="2"/>
      <rect x="182" y="242" width="16" height="16" fill="#1F2937" rx="2" ry="2"/>
      <rect x="212" y="242" width="16" height="16" fill="#1F2937" rx="2" ry="2"/>
      <rect x="242" y="242" width="16" height="16" fill="#1F2937" rx="2" ry="2"/>
      <rect x="272" y="242" width="16" height="16" fill="#1F2937" rx="2" ry="2"/>
      
      <rect x="152" y="272" width="16" height="16" fill="#1F2937" rx="2" ry="2"/>
      <rect x="182" y="272" width="16" height="16" fill="#1F2937" rx="2" ry="2"/>
      <rect x="212" y="272" width="16" height="16" fill="#1F2937" rx="2" ry="2"/>
      <rect x="242" y="272" width="16" height="16" fill="#1F2937" rx="2" ry="2"/>
      <rect x="272" y="272" width="16" height="16" fill="#1F2937" rx="2" ry="2"/>
      
      {/* Additional QR data squares for more density */}
      <rect x="132" y="167" width="14" height="14" fill="#1F2937" rx="1" ry="1"/>
      <rect x="162" y="167" width="14" height="14" fill="#1F2937" rx="1" ry="1"/>
      <rect x="192" y="167" width="14" height="14" fill="#1F2937" rx="1" ry="1"/>
      <rect x="232" y="167" width="14" height="14" fill="#1F2937" rx="1" ry="1"/>
      <rect x="262" y="167" width="14" height="14" fill="#1F2937" rx="1" ry="1"/>
      <rect x="292" y="167" width="14" height="14" fill="#1F2937" rx="1" ry="1"/>
      
      <rect x="132" y="197" width="14" height="14" fill="#1F2937" rx="1" ry="1"/>
      <rect x="162" y="197" width="14" height="14" fill="#1F2937" rx="1" ry="1"/>
      <rect x="192" y="197" width="14" height="14" fill="#1F2937" rx="1" ry="1"/>
      <rect x="232" y="197" width="14" height="14" fill="#1F2937" rx="1" ry="1"/>
      <rect x="262" y="197" width="14" height="14" fill="#1F2937" rx="1" ry="1"/>
      <rect x="292" y="197" width="14" height="14" fill="#1F2937" rx="1" ry="1"/>
      
      <rect x="132" y="227" width="14" height="14" fill="#1F2937" rx="1" ry="1"/>
      <rect x="162" y="227" width="14" height="14" fill="#1F2937" rx="1" ry="1"/>
      <rect x="192" y="227" width="14" height="14" fill="#1F2937" rx="1" ry="1"/>
      <rect x="232" y="227" width="14" height="14" fill="#1F2937" rx="1" ry="1"/>
      <rect x="262" y="227" width="14" height="14" fill="#1F2937" rx="1" ry="1"/>
      <rect x="292" y="227" width="14" height="14" fill="#1F2937" rx="1" ry="1"/>
      
      <rect x="132" y="257" width="14" height="14" fill="#1F2937" rx="1" ry="1"/>
      <rect x="162" y="257" width="14" height="14" fill="#1F2937" rx="1" ry="1"/>
      <rect x="192" y="257" width="14" height="14" fill="#1F2937" rx="1" ry="1"/>
      <rect x="232" y="257" width="14" height="14" fill="#1F2937" rx="1" ry="1"/>
      <rect x="262" y="257" width="14" height="14" fill="#1F2937" rx="1" ry="1"/>
      <rect x="292" y="257" width="14" height="14" fill="#1F2937" rx="1" ry="1"/>
      
      {/* Decorative corner squares */}
      <rect x="224" y="132" width="16" height="16" fill="#1F2937" rx="2" ry="2"/>
      <rect x="224" y="316" width="16" height="16" fill="#1F2937" rx="2" ry="2"/>
      <rect x="132" y="224" width="16" height="16" fill="#1F2937" rx="2" ry="2"/>
      <rect x="316" y="224" width="16" height="16" fill="#1F2937" rx="2" ry="2"/>
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
      <div className="px-6 pb-6 flex gap-3">
        <button
          onClick={() => setActiveTab('qr')}
          className={`flex-1 py-3 rounded-2xl font-medium transition-all ${
            darkMode ? (
              activeTab === 'qr'
                ? 'bg-[#2C3A6A] text-white'
                : 'bg-[#1A233A] text-[#6C7A9C]'
            ) : (
              activeTab === 'qr'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-600'
            )
          }`}
        >
          QR Code
        </button>
        <button
          onClick={() => setActiveTab('nfc')}
          className={`flex-1 py-3 rounded-2xl font-medium transition-all ${
            darkMode ? (
              activeTab === 'nfc'
                ? 'bg-[#2C3A6A] text-white'
                : 'bg-[#1A233A] text-[#6C7A9C]'
            ) : (
              activeTab === 'nfc'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-600'
            )
          }`}
        >
          NFC Tap
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 px-6 flex flex-col items-center justify-center py-8">
        {activeTab === 'qr' && (
          <div className="bg-white rounded-3xl p-6 shadow-2xl">
            <QRCodeSVG />
          </div>
        )}
        
        {activeTab === 'nfc' && (
          <div className="text-center cursor-pointer group" onClick={() => navigate("/money-received")}>
            <div className={darkMode ? "w-48 h-48 mx-auto bg-[#1A233A] rounded-full border-4 border-[#3AC7B1] flex items-center justify-center mb-6 animate-pulse group-hover:scale-105 group-hover:shadow-2xl group-hover:shadow-[#3AC7B1]/50 transition-all duration-300" : "w-48 h-48 mx-auto bg-blue-100 rounded-full border-4 border-[#3AC7B1] flex items-center justify-center mb-6 animate-pulse group-hover:scale-105 group-hover:shadow-2xl group-hover:shadow-blue-300/50 transition-all duration-300"}>
              <Radio className="w-24 h-24 text-[#3AC7B1]" />
            </div>
            <p className={darkMode ? "text-white text-lg font-medium mb-2" : "text-gray-900 text-lg font-medium mb-2"}>Ready to Receive</p>
            <p className={darkMode ? "text-[#A3B1CC] text-sm" : "text-gray-600 text-sm"}>Hold your phone near the sender's device to receive payment securely via NFC.</p>
          </div>
        )}
      </div>

      {/* Payment Link - Only for QR Code tab */}
      {activeTab === 'qr' && (
        <div className="px-6 pb-8">
          <div className={darkMode ? "bg-gradient-to-br from-[#1A233A] to-[#181F32] border border-[#2C3A6A] rounded-2xl p-5 shadow-lg" : "bg-white border border-gray-200 rounded-2xl p-5 shadow-lg"}>
            <p className={darkMode ? "text-[#A3B1CC] text-sm mb-4 font-medium" : "text-gray-600 text-sm mb-4 font-medium"}>Your Payment Link</p>
            <div className={darkMode ? "flex items-center gap-3 bg-[#10192B] rounded-xl p-3 mb-3" : "flex items-center gap-3 bg-gray-50 rounded-xl p-3 mb-3"}>
              <span className={darkMode ? "text-white font-mono text-sm flex-1 truncate" : "text-gray-900 font-mono text-sm flex-1 truncate"}>{paymentLink}</span>
              <button
                onClick={handleCopyLink}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 flex-shrink-0 ${
                  copied
                    ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                    : darkMode ? 'bg-[#3AC7B1] text-[#10192B] hover:bg-[#2DB5A0] hover:shadow-lg hover:shadow-[#3AC7B1]/30' : 'bg-blue-500 text-white hover:bg-blue-600 hover:shadow-lg'
                }`}
              >
                {copied ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span className="text-xs">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span className="text-xs">Copy</span>
                  </>
                )}
              </button>
            </div>
            <p className="text-[#6C7A9C] text-xs text-center">Share this link with anyone to receive payment</p>
          </div>
        </div>
      )}
    </div>
  );
}
