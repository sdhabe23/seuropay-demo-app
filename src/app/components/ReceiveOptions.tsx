import { useState } from "react";
import { ArrowLeft, QrCode, Nfc, Link2, Copy, Check } from "lucide-react";
import { useNavigate } from "react-router";
import React from "react";

export function ReceiveOptions(): React.ReactNode {
  const navigate = useNavigate();
  const [copiedLink, setCopiedLink] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<"qr" | "nfc" | "link" | null>(null);

  // Generate a unique receive link
  const receiveLink = `seuropay.app/receive/${Math.random().toString(36).substr(2, 9)}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(receiveLink);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch (err) {
      console.error("Failed to copy link:", err);
    }
  };

  const handleMethodSelect = (method: "qr" | "nfc" | "link") => {
    setSelectedMethod(method);
    if (method === "qr") {
      navigate("/receive-qr");
    } else if (method === "nfc") {
      navigate("/receive-nfc");
    } else if (method === "link") {
      navigate("/receive-link");
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
          <h1 className="text-xl">Receive Money</h1>
        </div>
      </div>

      <div className="flex-1 p-6 overflow-y-auto">
        {/* Info Card */}
        <div className="bg-[#1A233A] border border-[#3AC7B1]/30 rounded-xl p-4 mb-6">
          <p className="text-sm text-[#A3B1CC] text-center">
            Choose how you want to receive money from others
          </p>
        </div>

        {/* Receive Methods */}
        <div className="space-y-4 mb-6">
          {/* QR Code Method */}
          <button
            onClick={() => handleMethodSelect("qr")}
            className="w-full bg-[#181F32] rounded-2xl p-6 hover:bg-[#1A233A] transition-all border-2 border-[#2C3A6A] hover:border-[#3AC7B1] active:scale-95"
          >
            <div className="flex items-center gap-4">
              <div className="bg-[#3AC7B1]/20 p-4 rounded-full flex-shrink-0">
                <QrCode className="w-8 h-8 text-[#3AC7B1]" />
              </div>
              <div className="text-left flex-1">
                <p className="text-white font-semibold">QR Code</p>
                <p className="text-sm text-[#A3B1CC]">Share your QR code to receive payments</p>
              </div>
              <div className="text-[#A3B1CC]">→</div>
            </div>
          </button>

          {/* NFC Method */}
          <button
            onClick={() => handleMethodSelect("nfc")}
            className="w-full bg-[#181F32] rounded-2xl p-6 hover:bg-[#1A233A] transition-all border-2 border-[#2C3A6A] hover:border-[#3AC7B1] active:scale-95"
          >
            <div className="flex items-center gap-4">
              <div className="bg-[#6C7A9C]/20 p-4 rounded-full flex-shrink-0">
                <Nfc className="w-8 h-8 text-[#6C7A9C]" />
              </div>
              <div className="text-left flex-1">
                <p className="text-white font-semibold">NFC Tap</p>
                <p className="text-sm text-[#A3B1CC]">Tap devices to receive payments instantly</p>
              </div>
              <div className="text-[#A3B1CC]">→</div>
            </div>
          </button>

          {/* Share Link Method */}
          <button
            onClick={() => handleMethodSelect("link")}
            className="w-full bg-[#181F32] rounded-2xl p-6 hover:bg-[#1A233A] transition-all border-2 border-[#2C3A6A] hover:border-[#3AC7B1] active:scale-95"
          >
            <div className="flex items-center gap-4">
              <div className="bg-[#3AC7B1]/20 p-4 rounded-full flex-shrink-0">
                <Link2 className="w-8 h-8 text-[#3AC7B1]" />
              </div>
              <div className="text-left flex-1">
                <p className="text-white font-semibold">Share Link</p>
                <p className="text-sm text-[#A3B1CC]">Send a unique link to request payment</p>
              </div>
              <div className="text-[#A3B1CC]">→</div>
            </div>
          </button>
        </div>

        {/* Quick Link Preview */}
        <div className="bg-[#181F32] rounded-2xl p-4">
          <p className="text-[#A3B1CC] text-sm mb-3">Your Receive Link</p>
          <div className="flex items-center gap-2 bg-[#1A233A] rounded-xl p-3">
            <code className="text-[#3AC7B1] text-xs flex-1 truncate">{receiveLink}</code>
            <button
              onClick={handleCopyLink}
              className="p-2 hover:bg-[#232E4A] rounded-lg transition-colors flex-shrink-0"
            >
              {copiedLink ? (
                <Check className="w-5 h-5 text-green-400" />
              ) : (
                <Copy className="w-5 h-5 text-[#A3B1CC]" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
