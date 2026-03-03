import React from "react";
import { useNavigate } from "react-router";
import { ArrowLeft } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

export function PaymentMethod(): React.ReactNode {
  const navigate = useNavigate();
  const { darkMode } = useTheme();

  return (
    <div className={darkMode ? "bg-[#10192B] h-full w-full rounded-3xl p-6 flex flex-col shadow-xl overflow-y-auto" : "bg-gradient-to-br from-blue-50 to-indigo-100 h-full w-full rounded-3xl p-6 flex flex-col shadow-xl overflow-y-auto"}>
      {/* Header */}
      <div className="flex items-center mb-8">
        <button 
          onClick={() => navigate("/")}
          className="flex items-center justify-center hover:opacity-80 transition-opacity"
        >
          <ArrowLeft width="24" height="24" color="#3AC7B1" />
        </button>
      </div>

      {/* Title */}
      <div className="mb-12">
        <h1 className={darkMode ? "text-white text-4xl font-bold mb-2" : "text-gray-900 text-4xl font-bold mb-2"}>Pay with SeuroPay</h1>
        <p className={darkMode ? "text-[#A3B1CC] text-lg" : "text-gray-600 text-lg"}>Choose a payment method</p>
      </div>

      {/* Payment Options */}
      <div className="space-y-6 flex-1">
        {/* Tap to Pay Option */}
        <button
          onClick={() => navigate("/face-id-auth", { state: { fromNFC: true } })}
          className={darkMode ? "bg-[#181F32] border border-[#2C3A6A] rounded-3xl p-6 hover:bg-[#1F2A3A] transition-colors w-full text-left" : "bg-white border border-gray-200 rounded-3xl p-6 hover:bg-gray-50 transition-colors w-full text-left"}
        >
          <div className="flex items-center space-x-6">
            {/* NFC Icon Circle */}
            <div className={darkMode ? "bg-[#1C3A36] rounded-full p-6 flex-shrink-0" : "bg-blue-100 rounded-full p-6 flex-shrink-0"}>
              <svg width="48" height="48" fill="none" viewBox="0 0 24 24">
                <rect x="6" y="8" width="6" height="8" rx="1" stroke="#3AC7B1" strokeWidth="2"/>
                <path d="M14 10v4M16 9v6M18 11v2" stroke="#3AC7B1" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            {/* Text Content */}
            <div className="flex-1">
              <h2 className={darkMode ? "text-white text-2xl font-bold mb-2" : "text-gray-900 text-2xl font-bold mb-2"}>Tap to Pay</h2>
              <p className={darkMode ? "text-[#A3B1CC]" : "text-gray-600"}>Hold your phone near an NFC-enabled terminal</p>
            </div>
            {/* Arrow */}
            <div className="flex-shrink-0">
              <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="#3AC7B1" strokeWidth="2">
                <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
        </button>

        {/* Scan QR Option */}
        <button
          onClick={() => navigate("/scan")}
          className={darkMode ? "bg-[#181F32] border border-[#2C3A6A] rounded-3xl p-6 hover:bg-[#1F2A3A] transition-colors w-full text-left" : "bg-white border border-gray-200 rounded-3xl p-6 hover:bg-gray-50 transition-colors w-full text-left"}
        >
          <div className="flex items-center space-x-6">
            {/* QR Icon Circle */}
            <div className={darkMode ? "bg-[#1C2C4A] rounded-full p-6 flex-shrink-0" : "bg-purple-100 rounded-full p-6 flex-shrink-0"}>
              <svg width="48" height="48" fill="none" viewBox="0 0 24 24">
                <rect x="3" y="3" width="8" height="8" rx="1" stroke="#9D6FFF" strokeWidth="2"/>
                <rect x="13" y="3" width="8" height="8" rx="1" stroke="#9D6FFF" strokeWidth="2"/>
                <rect x="3" y="13" width="8" height="8" rx="1" stroke="#9D6FFF" strokeWidth="2"/>
                <rect x="13" y="13" width="8" height="8" rx="1" stroke="#9D6FFF" strokeWidth="2"/>
                <circle cx="7" cy="7" r="1" fill="#9D6FFF"/>
                <circle cx="17" cy="7" r="1" fill="#9D6FFF"/>
                <circle cx="7" cy="17" r="1" fill="#9D6FFF"/>
                <rect x="14" y="14" width="2" height="2" fill="#9D6FFF"/>
                <rect x="17" y="14" width="2" height="2" fill="#9D6FFF"/>
                <rect x="14" y="17" width="2" height="2" fill="#9D6FFF"/>
              </svg>
            </div>
            {/* Text Content */}
            <div className="flex-1">
              <h2 className={darkMode ? "text-white text-2xl font-bold mb-2" : "text-gray-900 text-2xl font-bold mb-2"}>Scan QR</h2>
              <p className={darkMode ? "text-[#A3B1CC]" : "text-gray-600"}>Scan a QR code to pay</p>
            </div>
            {/* Arrow */}
            <div className="flex-shrink-0">
              <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="#9D6FFF" strokeWidth="2">
                <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
        </button>

        {/* Contact Option */}
        <button
          onClick={() => navigate("/payment-contact")}
          className={darkMode ? "bg-[#181F32] border border-[#2C3A6A] rounded-3xl p-6 hover:bg-[#1F2A3A] transition-colors w-full text-left" : "bg-white border border-gray-200 rounded-3xl p-6 hover:bg-gray-50 transition-colors w-full text-left"}
        >
          <div className="flex items-center space-x-6">
            {/* Contact Icon Circle */}
            <div className={darkMode ? "bg-[#2C3A6A] rounded-full p-6 flex-shrink-0" : "bg-orange-100 rounded-full p-6 flex-shrink-0"}>
              <svg width="48" height="48" fill="none" viewBox="0 0 24 24">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="#FF9D6F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="12" cy="7" r="4" stroke="#FF9D6F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            {/* Text Content */}
            <div className="flex-1">
              <h2 className={darkMode ? "text-white text-2xl font-bold mb-2" : "text-gray-900 text-2xl font-bold mb-2"}>Contact</h2>
              <p className={darkMode ? "text-[#A3B1CC]" : "text-gray-600"}>Pay someone from your contacts</p>
            </div>
            {/* Arrow */}
            <div className="flex-shrink-0">
              <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="#FF9D6F" strokeWidth="2">
                <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
        </button>
      </div>
    </div>
  );
}
