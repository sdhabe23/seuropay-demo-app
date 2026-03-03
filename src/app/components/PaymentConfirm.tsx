import { useNavigate, useLocation } from "react-router";
import { ArrowLeft, CheckCircle } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import React from "react";

export function PaymentConfirm(): React.ReactNode {
  const navigate = useNavigate();
  const location = useLocation();
  const { darkMode } = useTheme();
  const amount = location.state?.amount || "0";
  const description = location.state?.description || "";
  const contact = location.state?.contact;

  const handleConfirm = () => {
    // Store balance update
    const numAmount = parseFloat(amount);
    sessionStorage.setItem('balanceUpdate', JSON.stringify({ 
      type: 'payment', 
      amount: numAmount 
    }));
    
    navigate("/payment-success", { 
      state: { 
        amount, 
        contact,
        description 
      } 
    });
  };

  const handleCancel = () => {
    navigate("/payment-method");
  };

  return (
    <div className={darkMode ? "h-full bg-[#10192B] flex flex-col overflow-hidden" : "h-full bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col overflow-hidden"}>
      {/* Header */}
      <div className={darkMode ? "bg-[#181F32] text-white px-6 pt-8 py-6 shadow-lg flex-shrink-0" : "bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-6 pt-8 py-6 shadow-lg flex-shrink-0"}>
        <div className="flex items-center gap-4">
          <button
            onClick={handleCancel}
            className={darkMode ? "p-2 hover:bg-white/20 rounded-xl transition-colors" : "p-2 hover:bg-white/30 rounded-xl transition-colors"}
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl">Confirm Payment</h1>
        </div>
      </div>

      <div className="flex-1 p-6 flex flex-col justify-between overflow-y-auto">
        {/* Payment Summary */}
        <div className="space-y-6">
          {/* Recipient Card */}
          <div className={darkMode ? "bg-[#181F32] rounded-3xl p-6" : "bg-white rounded-3xl p-6 shadow-sm"}>
            <p className={darkMode ? "text-[#A3B1CC] text-sm mb-4 block" : "text-gray-600 text-sm mb-4 block"}>Paying</p>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#3AC7B1] to-[#6C7A9C] flex items-center justify-center text-white text-lg font-semibold flex-shrink-0">
                {contact?.avatar || "?"}
              </div>
              <div>
                <p className={darkMode ? "text-white text-xl font-semibold" : "text-gray-900 text-xl font-semibold"}>{contact?.name || "Unknown"}</p>
                <p className={darkMode ? "text-[#A3B1CC] text-sm" : "text-gray-500 text-sm"}>{contact?.phone || ""}</p>
              </div>
            </div>
          </div>

          {/* Amount Card */}
          <div className={darkMode ? "bg-[#181F32] rounded-3xl p-6 text-center" : "bg-white rounded-3xl p-6 text-center shadow-sm"}>
            <p className={darkMode ? "text-[#A3B1CC] text-sm mb-2" : "text-gray-600 text-sm mb-2"}>Amount</p>
            <p className={darkMode ? "text-white text-5xl font-bold" : "text-gray-900 text-5xl font-bold"}>€{amount}</p>
          </div>

          {/* Description Card (if exists) */}
          {description && (
            <div className={darkMode ? "bg-[#181F32] rounded-3xl p-6" : "bg-white rounded-3xl p-6 shadow-sm"}>
              <p className={darkMode ? "text-[#A3B1CC] text-sm mb-2 block" : "text-gray-600 text-sm mb-2 block"}>Description</p>
              <p className={darkMode ? "text-white text-lg" : "text-gray-900 text-lg"}>{description}</p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 mt-8">
          <button
            onClick={handleConfirm}
            className="bg-gradient-to-r from-[#3AC7B1] to-[#6C7A9C] rounded-2xl w-full py-4 text-white text-lg font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2"
          >
            <CheckCircle className="w-5 h-5" />
            Confirm & Send
          </button>
          <button
            onClick={handleCancel}
            className={darkMode ? "bg-[#181F32] border border-[#2C3A6A] rounded-2xl w-full py-4 text-white text-lg font-semibold hover:bg-[#1F2A3A] transition-all" : "bg-white border border-gray-200 rounded-2xl w-full py-4 text-gray-900 text-lg font-semibold hover:bg-gray-50 transition-all"}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
