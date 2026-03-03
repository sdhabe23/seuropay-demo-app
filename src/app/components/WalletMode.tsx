import React from "react";
import { useState } from "react";
import { ArrowLeft, Wallet } from "lucide-react";
import { useNavigate } from "react-router";

export function WalletMode(): React.ReactNode {
  const navigate = useNavigate();
  const [currentBalance] = useState("1,234.56");

  return (
    <div className="h-full bg-[#10192B] flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-[#181F32] text-white px-6 pt-8 py-6 shadow-lg flex-shrink-0">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/profile")}
            className="p-2 hover:bg-white/20 rounded-xl transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl">Wallet Mode</h1>
        </div>
      </div>

      <div className="flex-1 p-6 overflow-y-auto">
        {/* Current Balance */}
        <div className="bg-[#181F32] rounded-2xl shadow-md p-6 mb-6 text-center">
          <div className="bg-[#3AC7B1]/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Wallet className="w-8 h-8 text-[#3AC7B1]" />
          </div>
          <p className="text-[#A3B1CC] mb-1">Current Wallet Balance</p>
          <p className="text-4xl text-white">€{currentBalance}</p>
        </div>

        {/* Info Card */}
        <div className="bg-[#1A233A] border border-[#3AC7B1]/30 rounded-xl p-4 mb-6">
          <p className="text-sm text-[#A3B1CC] text-center">
            <strong>Wallet Mode</strong> allows you to add money from your bank account to your SeuroPay wallet for faster transactions
          </p>
        </div>

        {/* Add Money Button */}
        <button
          onClick={() => navigate("/add-money")}
          className="w-full bg-gradient-to-r from-[#3AC7B1] to-[#6C7A9C] text-white py-4 rounded-2xl shadow-md hover:shadow-lg transition-all active:scale-95"
        >
          Add Money to Wallet
        </button>
      </div>
    </div>
  );
}
