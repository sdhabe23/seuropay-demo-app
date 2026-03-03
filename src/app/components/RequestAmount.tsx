import React from "react";
import { useState } from "react";
import { ArrowLeft, Delete } from "lucide-react";
import { useNavigate } from "react-router";

export function RequestAmount(): React.ReactNode {
  const navigate = useNavigate();
  const [amount, setAmount] = useState("0");

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
      navigate("/request-payment", { state: { amount } });
    }
  };

  return (
    <div className="h-full bg-[#10192B] flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-[#181F32] text-white px-6 pt-8 py-6 shadow-lg flex-shrink-0">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/")}
            className="p-2 hover:bg-white/20 rounded-xl transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl">Request Money</h1>
        </div>
      </div>

      {/* Amount Display */}
      <div className="flex-1 flex flex-col justify-between p-6 overflow-hidden">
        <div className="flex flex-col items-center justify-center flex-1 mb-8">
          <p className="text-[#A3B1CC] mb-2">Enter Amount to Request</p>
          <div className="flex items-center gap-2">
            <span className="text-[#A3B1CC] text-4xl">€</span>
            <span className="text-6xl text-white min-w-[200px] text-center">
              {amount}
            </span>
          </div>
        </div>

        {/* Numpad */}
        <div className="bg-[#181F32] rounded-3xl shadow-xl p-6 max-w-md mx-auto w-full flex-shrink-0">
          <div className="grid grid-cols-3 gap-4 mb-4">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
              <button
                key={num}
                onClick={() => handleNumberClick(num.toString())}
                className="aspect-square rounded-2xl bg-[#1A233A] hover:bg-[#232E4A] text-2xl text-white transition-colors active:scale-95"
              >
                {num}
              </button>
            ))}
            <button
              onClick={handleDecimal}
              className="aspect-square rounded-2xl bg-[#1A233A] hover:bg-[#232E4A] text-2xl text-white transition-colors active:scale-95"
            >
              .
            </button>
            <button
              onClick={() => handleNumberClick("0")}
              className="aspect-square rounded-2xl bg-[#1A233A] hover:bg-[#232E4A] text-2xl text-white transition-colors active:scale-95"
            >
              0
            </button>
            <button
              onClick={handleDelete}
              className="aspect-square rounded-2xl bg-[#1A233A] hover:bg-[#232E4A] flex items-center justify-center text-white transition-colors active:scale-95"
            >
              <Delete className="w-6 h-6" />
            </button>
          </div>

          <button
            onClick={handleContinue}
            disabled={parseFloat(amount) === 0}
            className="w-full bg-gradient-to-r from-[#3AC7B1] to-[#6C7A9C] text-white py-4 rounded-2xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}
