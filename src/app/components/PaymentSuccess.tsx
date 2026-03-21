import React, { useState, useMemo } from "react";
import { useNavigate, useLocation } from "react-router";
import { ArrowLeft, Download, Share2 } from "lucide-react";
import { getRandomAmount } from "../utils/currency";
import { useTheme } from "../context/ThemeContext";

export function PaymentSuccess(): React.ReactNode {
  const navigate = useNavigate();
  const location = useLocation();
  const { darkMode } = useTheme();
  
  // Get data from either contact payment or other payment method
  const contact = location.state?.contact;
  const amount = location.state?.amount ? parseFloat(location.state.amount) : getRandomAmount();
  const description = location.state?.description || "";
  const [recipient] = useState(contact?.name || "Merchant Store");
  const timestamp = useMemo(() => {
    const now = new Date();
    return now.toLocaleString();
  }, []);

  return (
    <div className={darkMode ? "bg-[#10192B] h-full w-full rounded-3xl p-6 flex flex-col shadow-xl overflow-y-auto" : "bg-gradient-to-br from-blue-50 to-indigo-100 h-full w-full rounded-3xl p-6 flex flex-col shadow-xl overflow-y-auto"}>
      {/* Header with Back Button */}
      <div className="flex items-center justify-between mb-8">
        <button 
          onClick={() => navigate("/")}
          className="flex items-center justify-center hover:opacity-80 transition-opacity"
        >
          <ArrowLeft width="24" height="24" color="#3AC7B1" />
        </button>
        <div className="flex-1"></div>
      </div>

      {/* Success Checkmark Circle */}
      <div className="flex justify-center mb-8">
        <div className="relative w-32 h-32 bg-gradient-to-br from-[#3AC7B1] to-[#2A9E8A] rounded-full flex items-center justify-center shadow-2xl">
          <svg width="64" height="64" fill="none" viewBox="0 0 24 24">
            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" fill="white"/>
          </svg>
        </div>
      </div>

      {/* Success Message */}
      <div className="text-center mb-8">
        <h1 className={darkMode ? "text-white text-3xl font-bold mb-2" : "text-gray-900 text-3xl font-bold mb-2"}>Payment Successful!</h1>
        <p className={darkMode ? "text-[#A3B1CC] text-lg" : "text-gray-600 text-lg"}>Your payment has been sent</p>
      </div>

      {/* Receipt Card */}
      <div className={darkMode ? "bg-[#181F32] border border-[#2C3A6A] rounded-3xl p-8 mb-8 flex-1" : "bg-white border border-gray-200 rounded-3xl p-8 mb-8 flex-1"}>
        {/* Receipt Header */}
        <div className={darkMode ? "mb-8 pb-6 border-b border-[#2C3A6A]" : "mb-8 pb-6 border-b border-gray-200"}>
          <p className={darkMode ? "text-[#A3B1CC] text-sm mb-2" : "text-gray-600 text-sm mb-2"}>AMOUNT SENT</p>
          <p className={darkMode ? "text-white text-5xl font-bold" : "text-gray-900 text-5xl font-bold"}>€{typeof amount === 'number' ? amount.toFixed(2) : parseFloat(amount).toFixed(2)}</p>
        </div>

        {/* Receipt Details */}
        <div className="space-y-6">
          {/* Recipient */}
          <div className="flex justify-between items-start">
            <div>
              <p className={darkMode ? "text-[#A3B1CC] text-sm mb-1" : "text-gray-600 text-sm mb-1"}>PAID TO</p>
              <p className={darkMode ? "text-white text-lg font-semibold" : "text-gray-900 text-lg font-semibold"}>{recipient}</p>
              {contact?.phone && <p className={darkMode ? "text-[#A3B1CC] text-xs mt-1" : "text-gray-500 text-xs mt-1"}>{contact.phone}</p>}
            </div>
            {contact && (
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#3AC7B1] to-[#6C7A9C] flex items-center justify-center text-white font-semibold flex-shrink-0">
                {contact.avatar}
              </div>
            )}
          </div>

          {/* Description */}
          {description && (
            <div className="flex justify-between items-start">
              <div>
                <p className={darkMode ? "text-[#A3B1CC] text-sm mb-1" : "text-gray-600 text-sm mb-1"}>DESCRIPTION</p>
                <p className={darkMode ? "text-white text-lg font-semibold" : "text-gray-900 text-lg font-semibold"}>{description}</p>
              </div>
            </div>
          )}

          {/* Transaction ID */}
          <div className="flex justify-between items-start">
            <div>
              <p className={darkMode ? "text-[#A3B1CC] text-sm mb-1" : "text-gray-600 text-sm mb-1"}>TRANSACTION ID</p>
              <p className={darkMode ? "text-white font-mono text-sm" : "text-gray-900 font-mono text-sm"}>TXN-{Math.random().toString(36).substr(2, 9).toUpperCase()}</p>
            </div>
          </div>

          {/* Date & Time */}
          <div className="flex justify-between items-start">
            <div>
              <p className={darkMode ? "text-[#A3B1CC] text-sm mb-1" : "text-gray-600 text-sm mb-1"}>DATE & TIME</p>
              <p className={darkMode ? "text-white text-sm" : "text-gray-900 text-sm"}>{timestamp}</p>
            </div>
          </div>

          {/* Payment Method */}
          <div className="flex justify-between items-start">
            <div>
              <p className={darkMode ? "text-[#A3B1CC] text-sm mb-1" : "text-gray-600 text-sm mb-1"}>PAYMENT METHOD</p>
              <p className={darkMode ? "text-white text-lg font-semibold" : "text-gray-900 text-lg font-semibold"}>{contact ? "Payee from Contact" : "NFC Payment"}</p>
            </div>
            {contact ? (
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#3AC7B1] to-[#6C7A9C] flex items-center justify-center text-white font-semibold flex-shrink-0">
                {contact.avatar}
              </div>
            ) : (
              <div className={darkMode ? "bg-[#1C3A36] rounded-full p-3" : "bg-teal-100 rounded-full p-3"}>
                <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
                  <rect x="6" y="8" width="6" height="8" rx="1" stroke="#3AC7B1" strokeWidth="2"/>
                  <path d="M14 10v4M16 9v6M18 11v2" stroke="#3AC7B1" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
            )}
          </div>

          {/* Status */}
          <div className={darkMode ? "flex justify-between items-start pt-4 border-t border-[#2C3A6A]" : "flex justify-between items-start pt-4 border-t border-gray-200"}>
            <div>
              <p className={darkMode ? "text-[#A3B1CC] text-sm mb-1" : "text-gray-600 text-sm mb-1"}>STATUS</p>
              <p className="text-[#3AC7B1] text-lg font-semibold">✓ Completed</p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-4">
        <button
          onClick={() => {
            sessionStorage.setItem('balanceUpdate', JSON.stringify({ type: 'payment', amount }));
            navigate("/");
          }}
          className="w-full bg-gradient-to-r from-[#3AC7B1] to-[#2A9E8A] text-white rounded-2xl py-4 font-semibold text-lg hover:shadow-lg transition-all flex items-center justify-center gap-2"
        >
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
            <path d="M3 12l9-9 9 9M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Back to Home
        </button>

        <div className="flex gap-4">
          <button
            className={darkMode ? "flex-1 bg-[#181F32] border border-[#2C3A6A] text-[#A3B1CC] rounded-2xl py-3 font-semibold hover:bg-[#1F2A3A] transition-colors flex items-center justify-center gap-2" : "flex-1 bg-gray-100 border border-gray-200 text-gray-700 rounded-2xl py-3 font-semibold hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"}
          >
            <Download width="18" height="18" />
            Download
          </button>
          <button
            className={darkMode ? "flex-1 bg-[#181F32] border border-[#2C3A6A] text-[#A3B1CC] rounded-2xl py-3 font-semibold hover:bg-[#1F2A3A] transition-colors flex items-center justify-center gap-2" : "flex-1 bg-gray-100 border border-gray-200 text-gray-700 rounded-2xl py-3 font-semibold hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"}
          >
            <Share2 width="18" height="18" />
            Share
          </button>
        </div>
      </div>
    </div>
  );
}
