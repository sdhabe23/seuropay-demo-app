import React, { useState, useMemo } from "react";
import { useNavigate, useLocation } from "react-router";
import { ArrowLeft } from "lucide-react";
import { getRandomAmount } from "../utils/currency";
import { useTheme } from "../context/ThemeContext";

export function MoneyReceivedSuccess(): React.ReactNode {
  const navigate = useNavigate();
  const location = useLocation();
  const { darkMode } = useTheme();
  const receiveAmount = sessionStorage.getItem('receiveAmount');
  const receiveDescription = sessionStorage.getItem('receiveDescription');
  const requestedAmount = receiveAmount ? parseFloat(receiveAmount) : getRandomAmount();
  const amount = useMemo(() => requestedAmount, [requestedAmount]);
  
  const contacts = [
    { name: "Angelika Dhabe", phone: "+372 501 2341" },
    { name: "Eve Tõnissoo", phone: "+372 502 5678" },
    { name: "Aadu Raudsepp", phone: "+372 503 9012" },
    { name: "Swapnil Kasar", phone: "+372 504 3456" },
    { name: "Vishal Jotshi", phone: "+372 505 7890" },
  ];
  
  const [sender] = useState(() => contacts[Math.floor(Math.random() * contacts.length)].name);
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
        <h1 className={darkMode ? "text-white text-3xl font-bold mb-2" : "text-gray-900 text-3xl font-bold mb-2"}>Money Received!</h1>
        <p className={darkMode ? "text-[#A3B1CC] text-lg" : "text-gray-600 text-lg"}>Payment received successfully</p>
      </div>

      {/* Receipt Card */}
      <div className={darkMode ? "bg-[#181F32] border border-[#2C3A6A] rounded-3xl p-8 mb-8 flex-1" : "bg-white border border-gray-200 rounded-3xl p-8 mb-8 flex-1"}>
        {/* Receipt Header */}
        <div className={darkMode ? "mb-8 pb-6 border-b border-[#2C3A6A]" : "mb-8 pb-6 border-b border-gray-200"}>
          <p className={darkMode ? "text-[#A3B1CC] text-sm mb-2" : "text-gray-600 text-sm mb-2"}>AMOUNT RECEIVED</p>
          <p className={darkMode ? "text-white text-5xl font-bold" : "text-gray-900 text-5xl font-bold"}>€{amount.toFixed(2)}</p>
        </div>

        {/* Receipt Details */}
        <div className="space-y-6">
          {/* Sender */}
          <div className="flex justify-between items-start">
            <div>
              <p className={darkMode ? "text-[#A3B1CC] text-sm mb-1" : "text-gray-600 text-sm mb-1"}>RECEIVED FROM</p>
              <p className={darkMode ? "text-white text-lg font-semibold" : "text-gray-900 text-lg font-semibold"}>{sender}</p>
            </div>
            <div className={darkMode ? "bg-[#2C3A6A] rounded-full p-3" : "bg-blue-100 rounded-full p-3"}>
              <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="9" stroke="#3AC7B1" strokeWidth="2"/>
                <path d="M12 8v4l3 2" stroke="#3AC7B1" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
          </div>

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
              <p className={darkMode ? "text-white text-lg font-semibold" : "text-gray-900 text-lg font-semibold"}>NFC Payment</p>
            </div>
            <div className={darkMode ? "bg-[#1C3A36] rounded-full p-3" : "bg-teal-100 rounded-full p-3"}>
              <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
                <path d="M6 9v6M9 6v12M18 9v6" stroke="#3AC7B1" strokeWidth="2" strokeLinecap="round"/>
                <path d="M4 12a8 8 0 0116 0" stroke="#3AC7B1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
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

      {/* Action Button */}
      <div>
        <button
          onClick={() => {
            sessionStorage.setItem('balanceUpdate', JSON.stringify({ type: 'receive', amount }));
            sessionStorage.removeItem('receiveAmount');
            sessionStorage.removeItem('receiveDescription');
            navigate("/");
          }}
          className="w-full bg-gradient-to-r from-[#3AC7B1] to-[#2A9E8A] text-white rounded-2xl py-4 font-semibold text-lg hover:shadow-lg transition-all flex items-center justify-center gap-2"
        >
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
            <path d="M3 12l9-9 9 9M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Back to Home
        </button>
      </div>
    </div>
  );
}
