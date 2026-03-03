import { useState } from "react";
import { ArrowLeft, Smartphone, Check, Loader } from "lucide-react";
import { useNavigate, useLocation } from "react-router";
import { useTheme } from "../context/ThemeContext";
import React from "react";

export function SmartIdAuth(): React.ReactNode {
  const navigate = useNavigate();
  const location = useLocation();
  const { darkMode } = useTheme();
  const { amount, action, bank } = location.state || {};
  
  const [authStep, setAuthStep] = useState("input");
  const [estonianId, setEstonianId] = useState("");
  const [idError, setIdError] = useState("");
  const [verificationCode, setVerificationCode] = useState("");

  // Validate Estonian ID format (11 digits)
  const validateEstonianId = (id: string): boolean => {
    return /^\d{11}$/.test(id);
  };

  // Generate realistic Estonian IBAN based on bank
  const generateEstonianIBAN = (bankCode: string) => {
    const bankCodes: { [key: string]: string } = {
      "swedbank": "010",
      "seb": "020",
      "luminor": "030",
      "lhv": "040"
    };
    const code = bankCodes[bankCode] || "010";
    const accountNumber = Math.floor(Math.random() * 9999999999).toString().padStart(10, "0");
    return `EE${code}${accountNumber}`;
  };

  const handleSubmitId = () => {
    if (!estonianId.trim()) {
      setIdError("Please enter your Estonian ID code");
      return;
    }

    if (!validateEstonianId(estonianId)) {
      setIdError("Estonian ID must be 11 digits");
      return;
    }

    setIdError("");
    setVerificationCode(Math.floor(1000 + Math.random() * 9000).toString());
    setAuthStep("waiting");

    // Simulate waiting for Smart-ID confirmation
    const timer = setTimeout(() => {
      setAuthStep("success");
      
      setTimeout(() => {
        if (action === "link-bank") {
          const iban = generateEstonianIBAN(bank);
          localStorage.setItem("linkedBankAccount", iban);
          navigate("/profile");
        } else if (action === "add-money") {
          navigate("/money-added", { state: { amount } });
        }
      }, 2000);
    }, 3000);

    return () => clearTimeout(timer);
  };

  return (
    <div className={darkMode ? "h-full bg-[#10192B] flex flex-col overflow-hidden" : "h-full bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col overflow-hidden"}>
      {/* Header */}
      <div className={darkMode ? "bg-[#181F32] text-white px-6 pt-8 py-6 shadow-lg flex-shrink-0" : "bg-white text-gray-900 px-6 pt-8 py-6 shadow-lg flex-shrink-0 border-b border-gray-200"}>
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className={darkMode ? "p-2 hover:bg-white/20 rounded-xl transition-colors" : "p-2 hover:bg-gray-100 rounded-xl transition-colors"}
          >
            <ArrowLeft className={darkMode ? "w-6 h-6" : "w-6 h-6 text-gray-900"} />
          </button>
          <h1 className={darkMode ? "text-xl" : "text-xl text-gray-900"}>Smart-ID Authentication</h1>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        {authStep === "input" ? (
          <div className="w-full max-w-sm">
            <div className="text-center mb-8">
              <h2 className={darkMode ? "text-2xl text-white mb-2" : "text-2xl text-gray-900 mb-2"}>Enter Your Estonian ID</h2>
              <p className={darkMode ? "text-[#A3B1CC]" : "text-gray-600"}>
                Your ID number is 11 digits long
              </p>
            </div>

            {/* ID Input */}
            <div className="mb-6">
              <input
                type="text"
                inputMode="numeric"
                placeholder="Enter your ID (11 digits)"
                value={estonianId}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, "").slice(0, 11);
                  setEstonianId(val);
                  if (idError) setIdError("");
                }}
                maxLength={11}
                className={darkMode ? "w-full px-4 py-3 rounded-xl bg-[#181F32] border-2 border-[#2C3A6A] text-white text-center text-2xl font-mono placeholder-[#A3B1CC]/50 focus:outline-none focus:border-[#3AC7B1] transition-colors" : "w-full px-4 py-3 rounded-xl bg-white border-2 border-gray-300 text-gray-900 text-center text-2xl font-mono placeholder-gray-400 focus:outline-none focus:border-blue-600 transition-colors"}
              />
              {idError && (
                <p className="text-red-500 text-sm mt-2 text-center">{idError}</p>
              )}
            </div>

            {/* Info Box */}
            <div className={darkMode ? "bg-[#1A233A] border border-[#3AC7B1]/30 rounded-xl p-4 mb-6" : "bg-blue-50 border border-blue-300 rounded-xl p-4 mb-6"}>
              <p className={darkMode ? "text-xs text-[#A3B1CC] text-center" : "text-xs text-blue-900 text-center"}>
                📱 Your Smart-ID app will receive an authentication request after you submit your ID
              </p>
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmitId}
              disabled={!estonianId || !validateEstonianId(estonianId)}
              className="w-full bg-gradient-to-r from-[#3AC7B1] to-[#6C7A9C] text-white py-4 rounded-2xl shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 font-semibold"
            >
              Submit & Authenticate
            </button>
          </div>
        ) : authStep === "waiting" ? (
          <div className="text-center">
            <div className="relative mb-8">
              <div className="w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-[#3AC7B1] to-[#6C7A9C] flex items-center justify-center relative">
                <Smartphone className="w-16 h-16 text-white" />
                <div className="absolute inset-0 rounded-full border-4 border-[#3AC7B1]/50 animate-ping"></div>
              </div>
            </div>

            <h2 className={darkMode ? "text-2xl text-white mb-4" : "text-2xl text-gray-900 mb-4"}>Check Your Phone</h2>
            <p className={darkMode ? "text-[#A3B1CC] mb-6" : "text-gray-600 mb-6"}>
              Open your Smart-ID app and confirm the authentication request
            </p>

            {/* Smart ID Info Card */}
            <div className={darkMode ? "bg-[#181F32] rounded-2xl shadow-md p-6 mb-6 max-w-sm mx-auto" : "bg-white rounded-2xl shadow-md p-6 mb-6 max-w-sm mx-auto border border-gray-200"}>
              <div className="mb-4">
                <p className={darkMode ? "text-[#A3B1CC] text-sm mb-1" : "text-gray-600 text-sm mb-1"}>Verification Code</p>
                <p className={darkMode ? "text-4xl text-white tracking-wider font-mono" : "text-4xl text-gray-900 tracking-wider font-mono"}>{verificationCode}</p>
              </div>
              <div className={darkMode ? "border-t border-[#2C3A6A] pt-4" : "border-t border-gray-200 pt-4"}>
                <p className={darkMode ? "text-xs text-[#A3B1CC]" : "text-xs text-gray-500"}>Estonian Smart-ID Authentication</p>
                <p className={darkMode ? "text-xs text-[#3AC7B1] mt-1" : "text-xs text-gray-600 mt-1"}>
                  {action === "link-bank" ? "Bank Account Linking" : "Add Money to Wallet"}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2">
              <Loader className="w-5 h-5 animate-spin text-[#3AC7B1]" />
              <span className={darkMode ? "text-[#A3B1CC]" : "text-gray-600"}>Waiting for Smart-ID confirmation...</span>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <div className="w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center mb-8">
              <Check className="w-16 h-16 text-white" />
            </div>

            <h2 className={darkMode ? "text-2xl text-white mb-4" : "text-2xl text-gray-900 mb-4"}>Authentication Successful!</h2>
            <p className={darkMode ? "text-[#A3B1CC] mb-6" : "text-gray-600 mb-6"}>
              {action === "link-bank" 
                ? "Your bank account has been linked successfully"
                : `Adding €${amount} to your wallet...`
              }
            </p>

            <div className="flex items-center justify-center gap-2 text-green-500">
              <Check className="w-5 h-5" />
              <span>Verified with Estonian Smart-ID</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
