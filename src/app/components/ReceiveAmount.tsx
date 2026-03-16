import React, { useState } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

export function ReceiveAmount(): React.ReactNode {
  const navigate = useNavigate();
  const { darkMode } = useTheme();
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");

  const handleProceed = () => {
    const numAmount = parseFloat(amount);
    if (amount && numAmount > 0) {
      navigate("/receive", { state: { amount: numAmount, description: description || undefined } });
    }
  };

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
        <h1 className={darkMode ? "text-white text-4xl font-bold mb-2" : "text-gray-900 text-4xl font-bold mb-2"}>Request Money</h1>
        <p className={darkMode ? "text-[#A3B1CC] text-lg" : "text-gray-600 text-lg"}>Enter amount and optional description</p>
      </div>

      {/* Form Content */}
      <div className="flex-1 flex flex-col">
        {/* Amount Input */}
        <div className="mb-8">
          <label className={darkMode ? "text-[#A3B1CC] text-sm mb-3 block" : "text-gray-600 text-sm mb-3 block"}>Amount (€)</label>
          <input
            type="number"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className={darkMode ? "w-full bg-[#181F32] border border-[#2C3A6A] rounded-2xl px-6 py-4 text-white text-3xl font-bold placeholder-[#6C7A9C] focus:outline-none focus:border-[#3AC7B1] transition-colors [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" : "w-full bg-white border border-gray-300 rounded-2xl px-6 py-4 text-gray-900 text-3xl font-bold placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"}
          />
        </div>

        {/* Description Input */}
        <div className="mb-8">
          <label className={darkMode ? "text-[#A3B1CC] text-sm mb-3 block" : "text-gray-600 text-sm mb-3 block"}>Description (Optional)</label>
          <textarea
            placeholder="e.g., Rent, Dinner, etc."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className={darkMode ? "w-full bg-[#181F32] border border-[#2C3A6A] rounded-2xl px-6 py-4 text-white placeholder-[#6C7A9C] focus:outline-none focus:border-[#3AC7B1] transition-colors resize-none" : "w-full bg-white border border-gray-300 rounded-2xl px-6 py-4 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors resize-none"}
          />
        </div>

        <div className="flex-1"></div>

        {/* Action Buttons */}
        <div className="space-y-4">
          <button
            onClick={handleProceed}
            disabled={!amount || parseFloat(amount) <= 0}
            className={`w-full rounded-2xl py-4 font-semibold text-lg transition-all flex items-center justify-center gap-2 ${
              amount && parseFloat(amount) > 0
                ? "bg-gradient-to-r from-[#3AC7B1] to-[#2A9E8A] text-white hover:shadow-lg"
                : darkMode ? "bg-[#1A233A] text-[#6C7A9C] cursor-not-allowed" : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
          >
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
              <path d="M17 7L7 17M7 17H17M7 17V7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Proceed
          </button>
          <button
            onClick={() => navigate("/")}
            className={darkMode ? "w-full bg-[#181F32] border border-[#2C3A6A] text-[#A3B1CC] rounded-2xl py-4 font-semibold text-lg hover:bg-[#1F2A3A] transition-colors" : "w-full bg-white border border-gray-300 text-gray-700 rounded-2xl py-4 font-semibold text-lg hover:bg-gray-50 transition-colors"}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
