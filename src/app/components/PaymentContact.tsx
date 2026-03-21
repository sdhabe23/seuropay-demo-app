import { useState } from "react";
import { ArrowLeft, Delete } from "lucide-react";
import { useNavigate } from "react-router";
import { useTheme } from "../context/ThemeContext";
import React from "react";

export function PaymentContact(): React.ReactNode {
  const navigate = useNavigate();
  const { darkMode } = useTheme();
  const [amount, setAmount] = useState("0");
  const [description, setDescription] = useState("");

  const handleNumberClick = (num: string) => {
    if (amount === "0") {
      setAmount(num);
    } else {
      setAmount(amount + num);
    }
  };

  const handleDecimal = () => {
    if (!amount.includes(".")) {
      setAmount(amount + ".");
    }
  };

  const handleDelete = () => {
    if (amount.length === 1) {
      setAmount("0");
    } else {
      setAmount(amount.slice(0, -1));
    }
  };

  const handleContinue = () => {
    if (parseFloat(amount) > 0) {
      navigate("/select-recipient", { 
        state: { 
          amount, 
          description,
          fromContact: true 
        } 
      });
    }
  };

  return (
    <div className={darkMode ? "h-full bg-[#10192B] flex flex-col overflow-hidden" : "h-full bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col overflow-hidden"}>
      {/* Header */}
      <div className={darkMode ? "bg-[#181F32] text-white px-6 pt-8 py-6 shadow-lg flex-shrink-0" : "bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-6 pt-8 py-6 shadow-lg flex-shrink-0"}>
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/payment-method")}
            className={darkMode ? "p-2 hover:bg-white/20 rounded-xl transition-colors" : "p-2 hover:bg-white/30 rounded-xl transition-colors"}
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl">Pay a Contact</h1>
        </div>
      </div>

      <div className="flex-1 p-6 flex flex-col overflow-y-auto">
        {/* Amount Display */}
        <div className={darkMode ? "bg-[#181F32] rounded-3xl p-8 mb-8 text-center" : "bg-white rounded-3xl p-8 mb-8 text-center shadow-sm"}>
          <p className={darkMode ? "text-[#A3B1CC] text-sm mb-2" : "text-gray-600 text-sm mb-2"}>Amount to Send</p>
          <p className={darkMode ? "text-white text-5xl font-bold" : "text-gray-900 text-5xl font-bold"}>€{amount}</p>
        </div>

        {/* Description Field */}
        <div className="mb-8">
          <label className={darkMode ? "text-white text-sm font-semibold mb-3 block" : "text-gray-900 text-sm font-semibold mb-3 block"}>Description (Optional)</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g., Dinner, Gift, Loan..."
            className={darkMode ? "w-full bg-[#181F32] border border-[#2C3A6A] rounded-2xl px-4 py-3 text-white placeholder-[#6C7A9C] focus:outline-none focus:border-[#3AC7B1]" : "w-full bg-white border border-gray-300 rounded-2xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-600"}
          />
        </div>

        {/* Number Pad */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            ["1", "2", "3"],
            ["4", "5", "6"],
            ["7", "8", "9"],
            [".", "0", "del"]
          ].map((row, i) => (
            <div key={i} className="contents">
              {row.map((num, j) => (
                <button
                  key={j}
                  onClick={() => num === "." ? handleDecimal() : num === "del" ? handleDelete() : num && handleNumberClick(num)}
                  disabled={!num}
                  className={num ? (darkMode ? "bg-[#181F32] border border-[#2C3A6A] rounded-2xl py-4 text-white text-xl font-semibold hover:bg-[#1F2A3A] transition-colors flex items-center justify-center" : "bg-white border border-gray-200 rounded-2xl py-4 text-gray-900 text-xl font-semibold hover:bg-gray-50 transition-colors flex items-center justify-center") : ""}
                >
                  {num === "del" ? <Delete className="w-5 h-5" /> : num}
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Continue Button */}
      <div className="p-6 flex-shrink-0">
        <button
          onClick={handleContinue}
          disabled={parseFloat(amount) <= 0}
          className={parseFloat(amount) > 0 ? "bg-gradient-to-r from-[#3AC7B1] to-[#6C7A9C] rounded-2xl w-full py-4 text-white text-lg font-semibold hover:shadow-lg transition-all" : "bg-gray-400 rounded-2xl w-full py-4 text-white text-lg font-semibold opacity-50 cursor-not-allowed"}
        >
          Continue
        </button>
      </div>
    </div>
  );
}
