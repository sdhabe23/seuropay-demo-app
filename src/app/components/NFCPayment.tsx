import React, { useState, useMemo } from "react";
import { useNavigate, useLocation } from "react-router";
import { useTheme } from "../context/ThemeContext";
import { getRandomAmount } from "../utils/currency";

export function NFCPayment(): React.ReactNode {
  const navigate = useNavigate();
  const location = useLocation();
  const { darkMode } = useTheme();
  const amount = location.state?.amount;

  return (
    <div className={darkMode ? "bg-[#10192B] h-full w-full rounded-3xl p-6 flex flex-col justify-between shadow-xl overflow-y-auto" : "bg-gradient-to-br from-blue-50 to-indigo-100 h-full w-full rounded-3xl p-6 flex flex-col justify-between shadow-xl overflow-y-auto"}>
      {/* Top Section */}
      <div className="flex flex-col items-center flex-1 justify-center">
        {/* Title */}
        <h1 className={darkMode ? "text-[#A3B1CC] text-2xl mb-12 text-center" : "text-gray-600 text-2xl mb-12 text-center"}>
          Tap your device to send payment
        </h1>

        {/* NFC Animation Circle */}
        <div className="relative w-64 h-64 flex items-center justify-center mb-12 cursor-pointer group" onClick={() => navigate("/payment-success", { state: { amount } })}>
          {/* Outer animated circle */}
          <style>{`
            @keyframes pulse-ring-1 {
              0% {
                transform: scale(0.6);
                opacity: 0;
              }
              50% {
                opacity: 1;
              }
              100% {
                transform: scale(1.2);
                opacity: 0;
              }
            }
            @keyframes pulse-ring-2 {
              0% {
                transform: scale(0.8);
                opacity: 0;
              }
              50% {
                opacity: 0.8;
              }
              100% {
                transform: scale(1.3);
                opacity: 0;
              }
            }
            .pulse-ring-1 {
              animation: pulse-ring-1 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
            }
            .pulse-ring-2 {
              animation: pulse-ring-2 2s cubic-bezier(0.4, 0, 0.6, 1) infinite 0.3s;
            }
          `}</style>
          
          <div className="absolute w-64 h-64 rounded-full bg-[#3AC7B1] opacity-10 pulse-ring-1"></div>
          <div className="absolute w-64 h-64 rounded-full bg-[#3AC7B1] opacity-5 pulse-ring-2"></div>

          {/* Main circle with gradient */}
          <div className="relative w-56 h-56 bg-gradient-to-br from-[#3AC7B1] to-[#2A9E8A] rounded-full flex items-center justify-center shadow-2xl group-hover:shadow-3xl group-hover:scale-105 transition-all duration-300">
            {/* Phone icon inside */}
            <svg width="80" height="80" fill="none" viewBox="0 0 24 24">
              <rect x="6" y="2" width="12" height="20" rx="2" stroke="white" strokeWidth="1.5" fill="none"/>
              <circle cx="12" cy="19" r="0.8" fill="white"/>
            </svg>
          </div>
        </div>

        {/* Instructions - No amount shown */}
        <p className={darkMode ? "text-[#A3B1CC] text-center text-lg mb-8" : "text-gray-600 text-center text-lg mb-8"}>
          Hold your device near the payment terminal to complete the transaction
        </p>
      </div>

      {/* Bottom Section */}
      <div className="space-y-4">
        {/* Tip Box */}
        <div className={darkMode ? "bg-[#181F32] border border-[#2C3A6A] rounded-2xl p-6" : "bg-white border border-gray-200 rounded-2xl p-6"}>
          <p className={darkMode ? "text-[#A3B1CC]" : "text-gray-600"}>
            <span className={darkMode ? "text-white font-semibold" : "text-gray-900 font-semibold"}>Tip:</span> {" "}
            Amount will be displayed on the terminal screen
          </p>
        </div>

        {/* Cancel Button */}
        <button
          onClick={() => navigate("/payment-method")}
          className={darkMode ? "w-full bg-[#181F32] border border-[#2C3A6A] text-[#A3B1CC] rounded-2xl py-4 font-semibold text-lg hover:bg-[#1F2A3A] transition-colors" : "w-full bg-white border border-gray-200 text-gray-900 rounded-2xl py-4 font-semibold text-lg hover:bg-gray-50 transition-colors"}
        >
          Cancel Payment
        </button>
      </div>
    </div>
  );
}
