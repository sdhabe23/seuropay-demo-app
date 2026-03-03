import { useState } from "react";
import { ArrowLeft, CreditCard, Shield } from "lucide-react";
import { useNavigate } from "react-router";
import { useTheme } from "../context/ThemeContext";
import React from "react";

export function LinkBank(): React.ReactNode {
  const navigate = useNavigate();
  const { darkMode } = useTheme();
  const [selectedBank, setSelectedBank] = useState<string>("");
  const linkedBankAccount = localStorage.getItem("linkedBankAccount");

  const banks = [
    { id: "swedbank", name: "Swedbank", logo: "SW", color: "from-blue-600 to-blue-700" },
    { id: "seb", name: "SEB", logo: "SEB", color: "from-purple-600 to-purple-700" },
    { id: "luminor", name: "Luminor", logo: "LU", color: "from-green-600 to-green-700" },
    { id: "lhv", name: "LHV", logo: "LHV", color: "from-orange-600 to-orange-700" },
  ];

  const handleLinkBank = () => {
    if (selectedBank) {
      navigate("/smart-id-auth", { 
        state: { 
          action: "link-bank",
          bank: selectedBank 
        } 
      });
    }
  };

  const handleUnlink = () => {
    localStorage.removeItem("linkedBankAccount");
    navigate("/profile");
  };

  return (
    <div className={darkMode ? "h-full bg-[#10192B] flex flex-col overflow-hidden" : "h-full bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col overflow-hidden"}>
      {/* Header */}
      <div className={darkMode ? "bg-[#181F32] text-white px-6 pt-8 py-6 shadow-lg flex-shrink-0" : "bg-white text-gray-900 px-6 pt-8 py-6 shadow-lg flex-shrink-0 border-b border-gray-200"}>
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/profile")}
            className={darkMode ? "p-2 hover:bg-white/20 rounded-xl transition-colors" : "p-2 hover:bg-gray-100 rounded-xl transition-colors"}
          >
            <ArrowLeft className={darkMode ? "w-6 h-6" : "w-6 h-6 text-gray-900"} />
          </button>
          <h1 className={darkMode ? "text-xl" : "text-xl text-gray-900"}>Link Bank Account</h1>
        </div>
      </div>

      <div className="flex-1 p-6 overflow-y-auto">
        {linkedBankAccount ? (
          /* Already Linked */
          <div className="space-y-6">
            <div className={darkMode ? "bg-[#181F32] rounded-2xl shadow-md p-6" : "bg-white rounded-2xl shadow-md p-6 border border-gray-200"}>
              <div className="flex items-center gap-4 mb-4">
                <div className={darkMode ? "w-12 h-12 rounded-full bg-[#3AC7B1]/20 flex items-center justify-center" : "w-12 h-12 rounded-full bg-green-100 flex items-center justify-center"}>
                  <CreditCard className={darkMode ? "w-6 h-6 text-[#3AC7B1]" : "w-6 h-6 text-green-600"} />
                </div>
                <div>
                  <p className={darkMode ? "text-[#A3B1CC] text-sm" : "text-gray-600 text-sm"}>Linked Bank Account (IBAN)</p>
                  <p className={darkMode ? "text-xl text-white font-mono" : "text-xl text-gray-900 font-mono"}>{linkedBankAccount}</p>
                </div>
              </div>
              <div className={darkMode ? "bg-[#1A233A] border border-[#3AC7B1]/30 rounded-xl p-3" : "bg-green-50 border border-green-300 rounded-xl p-3"}>
                <p className={darkMode ? "text-sm text-[#3AC7B1] text-center" : "text-sm text-green-700 text-center"}>
                  ✓ Your bank account is successfully linked via Estonian Smart-ID
                </p>
              </div>
            </div>

            <button
              onClick={handleUnlink}
              className={darkMode ? "w-full bg-[#181F32] border border-red-400/30 text-red-400 py-4 rounded-2xl shadow-md hover:shadow-lg transition-all" : "w-full bg-white border border-red-300 text-red-600 py-4 rounded-2xl shadow-md hover:shadow-lg transition-all"}
            >
              Unlink Bank Account
            </button>
          </div>
        ) : (
          /* Link New Account */
          <div className="space-y-6">
            {/* Info Box */}
            <div className={darkMode ? "bg-[#1A233A] border border-[#3AC7B1]/30 rounded-xl p-4" : "bg-blue-50 border border-blue-300 rounded-xl p-4"}>
              <div className="flex gap-3">
                <Shield className={darkMode ? "w-5 h-5 text-[#3AC7B1] flex-shrink-0 mt-0.5" : "w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5"} />
                <div>
                  <p className={darkMode ? "text-sm text-[#A3B1CC] font-semibold" : "text-sm text-blue-900 font-semibold"}>
                    Secure Banking Integration
                  </p>
                  <p className={darkMode ? "text-xs text-[#A3B1CC] mt-1" : "text-xs text-blue-800 mt-1"}>
                    We use official Estonian Smart-ID authentication to securely link your bank account. Your credentials are never stored.
                  </p>
                </div>
              </div>
            </div>

            {/* Bank Selection */}
            <div>
              <p className={darkMode ? "text-white mb-3 font-semibold" : "text-gray-900 mb-3 font-semibold"}>Select Your Bank</p>
              <div className="space-y-3">
                {banks.map((bank) => (
                  <button
                    key={bank.id}
                    onClick={() => setSelectedBank(bank.id)}
                    className={`w-full p-4 rounded-xl border-2 transition-all ${
                      selectedBank === bank.id
                        ? darkMode 
                          ? "border-[#3AC7B1] bg-[#1A233A]"
                          : "border-blue-600 bg-blue-50"
                        : darkMode
                          ? "border-[#2C3A6A] bg-[#181F32] hover:border-[#3AC7B1]/50"
                          : "border-gray-300 bg-white hover:border-gray-400"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${bank.color} flex items-center justify-center text-white text-sm font-bold flex-shrink-0`}>
                        {bank.logo}
                      </div>
                      <div className="text-left">
                        <span className={darkMode ? "text-white block font-medium" : "text-gray-900 block font-medium"}>{bank.name}</span>
                        <span className={darkMode ? "text-[#A3B1CC] text-xs" : "text-gray-600 text-xs"}>Estonian Bank</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Link Button */}
            <button
              onClick={handleLinkBank}
              disabled={!selectedBank}
              className="w-full bg-gradient-to-r from-[#3AC7B1] to-[#6C7A9C] text-white py-4 rounded-2xl shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 font-semibold"
            >
              Link with Smart-ID
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
