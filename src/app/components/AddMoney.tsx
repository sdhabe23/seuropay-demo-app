import { useState } from "react";
import { ArrowLeft, Delete, Building2 } from "lucide-react";
import { useNavigate } from "react-router";
import { useTheme } from "../context/ThemeContext";
import React from "react";

export function AddMoney(): React.ReactNode {
  const navigate = useNavigate();
  const { darkMode } = useTheme();
  const [amount, setAmount] = useState("0");
  const [selectedBank, setSelectedBank] = useState<string>("");

  const banks = [
    { id: "swedbank", name: "Swedbank", logo: "SW", color: "from-blue-600 to-blue-700" },
    { id: "seb", name: "SEB", logo: "SEB", color: "from-purple-600 to-purple-700" },
    { id: "luminor", name: "Luminor", logo: "LU", color: "from-green-600 to-green-700" },
    { id: "lhv", name: "LHV", logo: "LHV", color: "from-orange-600 to-orange-700" },
  ];

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

  const handleAddMoney = () => {
    if (parseFloat(amount) > 0 && selectedBank) {
      navigate("/smart-id-auth", { 
        state: { 
          amount, 
          action: "add-money",
          bank: selectedBank 
        } 
      });
    }
  };

  return (
    <div className={darkMode ? "h-full bg-[#10192B] flex flex-col overflow-hidden" : "h-full bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col overflow-hidden"}>
      {/* Header */}
      <div className={darkMode ? "bg-[#181F32] text-white px-6 pt-8 py-6 shadow-lg flex-shrink-0" : "bg-white text-gray-900 px-6 pt-8 py-6 shadow-lg flex-shrink-0 border-b border-gray-200"}>
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/wallet-mode")}
            className={darkMode ? "p-2 hover:bg-white/20 rounded-xl transition-colors" : "p-2 hover:bg-gray-100 rounded-xl transition-colors"}
          >
            <ArrowLeft className={darkMode ? "w-6 h-6" : "w-6 h-6 text-gray-900"} />
          </button>
          <h1 className={darkMode ? "text-xl" : "text-xl text-gray-900"}>Add Money to Wallet</h1>
        </div>
      </div>

      <div className={darkMode ? "flex-1 p-6 overflow-y-auto" : "flex-1 p-6 overflow-y-auto"}>
        {/* Amount Display */}
        <div className={darkMode ? "bg-[#181F32] rounded-2xl p-6 mb-6" : "bg-white rounded-2xl p-6 mb-6 shadow-sm border border-gray-200"}>
          <p className={darkMode ? "text-[#A3B1CC] mb-2 text-center" : "text-gray-600 mb-2 text-center"}>Amount to Add</p>
          <div className="flex items-center justify-center gap-2">
            <span className={darkMode ? "text-[#A3B1CC] text-3xl" : "text-gray-600 text-3xl"}>€</span>
            <span className={darkMode ? "text-5xl text-white min-w-[150px] text-center" : "text-5xl text-gray-900 min-w-[150px] text-center"}>
              {amount}
            </span>
          </div>
        </div>

        {/* Select Bank */}
        <div className="mb-6">
          <p className={darkMode ? "text-white mb-3 font-semibold" : "text-gray-900 mb-3 font-semibold"}>Select Bank Account</p>
          <div className="grid grid-cols-2 gap-3">
            {banks.map((bank) => (
              <button
                key={bank.id}
                onClick={() => setSelectedBank(bank.id)}
                className={`p-4 rounded-xl border-2 transition-all ${
                  selectedBank === bank.id
                    ? darkMode
                      ? "border-[#3AC7B1] bg-[#1A233A]"
                      : "border-blue-600 bg-blue-50"
                    : darkMode
                      ? "border-[#2C3A6A] bg-[#181F32] hover:border-[#3AC7B1]/50"
                      : "border-gray-300 bg-white hover:border-gray-400"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${bank.color} flex items-center justify-center text-white text-xs flex-shrink-0 font-bold`}>
                    {bank.logo}
                  </div>
                  <span className={darkMode ? "text-white text-sm font-medium" : "text-gray-900 text-sm font-medium"}>{bank.name}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Numpad */}
        <div className={darkMode ? "bg-[#181F32] rounded-3xl shadow-xl p-6" : "bg-white rounded-3xl shadow-lg p-6 border border-gray-200"}>
          <div className="grid grid-cols-3 gap-4 mb-4">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
              <button
                key={num}
                onClick={() => handleNumberClick(num.toString())}
                className={darkMode ? "aspect-square rounded-2xl bg-[#1A233A] hover:bg-[#232E4A] text-2xl text-white transition-colors active:scale-95" : "aspect-square rounded-2xl bg-gray-100 hover:bg-gray-200 text-2xl text-gray-900 transition-colors active:scale-95"}
              >
                {num}
              </button>
            ))}
            <button
              onClick={handleDecimal}
              className={darkMode ? "aspect-square rounded-2xl bg-[#1A233A] hover:bg-[#232E4A] text-2xl text-white transition-colors active:scale-95" : "aspect-square rounded-2xl bg-gray-100 hover:bg-gray-200 text-2xl text-gray-900 transition-colors active:scale-95"}
            >
              .
            </button>
            <button
              onClick={() => handleNumberClick("0")}
              className={darkMode ? "aspect-square rounded-2xl bg-[#1A233A] hover:bg-[#232E4A] text-2xl text-white transition-colors active:scale-95" : "aspect-square rounded-2xl bg-gray-100 hover:bg-gray-200 text-2xl text-gray-900 transition-colors active:scale-95"}
            >
              0
            </button>
            <button
              onClick={handleDelete}
              className={darkMode ? "aspect-square rounded-2xl bg-[#1A233A] hover:bg-[#232E4A] flex items-center justify-center text-white transition-colors active:scale-95" : "aspect-square rounded-2xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-900 transition-colors active:scale-95"}
            >
              <Delete className="w-6 h-6" />
            </button>
          </div>

          <button
            onClick={handleAddMoney}
            disabled={parseFloat(amount) === 0 || !selectedBank}
            className="w-full bg-gradient-to-r from-[#3AC7B1] to-[#6C7A9C] text-white py-4 rounded-2xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 font-semibold"
          >
            Continue with Smart-ID
          </button>
        </div>
      </div>
    </div>
  );
}
