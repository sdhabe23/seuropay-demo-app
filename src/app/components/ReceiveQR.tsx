import { ArrowLeft, Copy, Check, Download } from "lucide-react";
import { useNavigate } from "react-router";
import { useState } from "react";
import React from "react";

export function ReceiveQR(): React.ReactNode {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  
  // Generate unique receive code
  const receiveCode = Math.random().toString(36).substr(2, 9).toUpperCase();
  const receiveData = `seuropay://receive/${receiveCode}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(receiveData);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleDownload = () => {
    // Simulate QR code download
    alert("QR Code downloaded! (Demo)");
  };

  return (
    <div className="h-full bg-[#10192B] flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-[#181F32] text-white px-6 pt-8 py-6 shadow-lg flex-shrink-0">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/receive")}
            className="p-2 hover:bg-white/20 rounded-xl transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl">Your Receive QR Code</h1>
        </div>
      </div>

      <div className="flex-1 p-6 overflow-y-auto flex flex-col">
        {/* QR Code Display */}
        <div className="flex-1 flex items-center justify-center mb-6">
          <div className="bg-white p-8 rounded-2xl shadow-xl">
            <div className="w-56 h-56 bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <div className="text-gray-500 text-sm mb-2">QR Code</div>
                <div className="text-gray-400 text-xs">seuropay://receive/{receiveCode}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Receive Code */}
        <div className="bg-[#181F32] rounded-2xl p-4 mb-6">
          <p className="text-[#A3B1CC] text-sm mb-3">Your Receive Code</p>
          <div className="flex items-center gap-2 bg-[#1A233A] rounded-xl p-3">
            <code className="text-[#3AC7B1] text-sm font-mono flex-1 text-center">{receiveCode}</code>
            <button
              onClick={handleCopy}
              className="p-2 hover:bg-[#232E4A] rounded-lg transition-colors flex-shrink-0"
            >
              {copied ? (
                <Check className="w-5 h-5 text-green-400" />
              ) : (
                <Copy className="w-5 h-5 text-[#A3B1CC]" />
              )}
            </button>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-[#1A233A] border border-[#3AC7B1]/30 rounded-xl p-4 mb-6">
          <p className="text-sm text-[#A3B1CC] text-center">
            <strong>How to use:</strong> Share this QR code with anyone who wants to send you money. They can scan it with the SeuroPay app.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 flex-shrink-0">
          <button
            onClick={handleDownload}
            className="w-full bg-gradient-to-r from-[#3AC7B1] to-[#6C7A9C] text-white py-4 rounded-2xl shadow-md hover:shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 font-semibold"
          >
            <Download className="w-5 h-5" />
            Download QR Code
          </button>
          <button
            onClick={() => navigate("/")}
            className="w-full bg-[#181F32] text-[#A3B1CC] py-4 rounded-2xl shadow-md hover:shadow-lg transition-all"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
