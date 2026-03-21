import { ArrowLeft, Copy, Check, Share2, Mail } from "lucide-react";
import { useNavigate } from "react-router";
import { useState } from "react";
import React from "react";

export function ReceiveLink(): React.ReactNode {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  
  // Generate unique receive link
  const receiveLink = `seuropay.app/receive/${Math.random().toString(36).substr(2, 12)}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(receiveLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "SeuroPay Receive Link",
          text: "Send me money using this SeuroPay link",
          url: receiveLink,
        });
      } catch (err) {
        console.error("Error sharing:", err);
      }
    } else {
      // Fallback
      handleCopy();
    }
  };

  const handleShareEmail = () => {
    const subject = "Send me money on SeuroPay";
    const body = `Hi!\n\nYou can send me money using this SeuroPay link:\n${receiveLink}\n\nThanks!`;
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
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
          <h1 className="text-xl">Share Receive Link</h1>
        </div>
      </div>

      <div className="flex-1 p-6 overflow-y-auto flex flex-col">
        {/* Info Card */}
        <div className="bg-[#1A233A] border border-[#3AC7B1]/30 rounded-xl p-4 mb-6">
          <p className="text-sm text-[#A3B1CC] text-center">
            Share this unique link with anyone to let them send you money instantly
          </p>
        </div>

        {/* Link Display */}
        <div className="bg-[#181F32] rounded-2xl p-6 mb-6">
          <p className="text-[#A3B1CC] text-sm mb-4">Your Unique Receive Link</p>
          <div className="flex items-center gap-2 bg-[#1A233A] rounded-xl p-3 mb-4">
            <code className="text-[#3AC7B1] text-sm flex-1 truncate font-mono">{receiveLink}</code>
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
          {copied && <p className="text-green-400 text-sm">Link copied to clipboard!</p>}
        </div>

        {/* Share Options */}
        <div className="space-y-3 mb-6 flex-1">
          <p className="text-[#A3B1CC] text-sm mb-3">Share via:</p>
          
          <button
            onClick={handleShare}
            className="w-full bg-[#181F32] rounded-2xl p-4 hover:bg-[#1A233A] transition-all border-2 border-[#2C3A6A] hover:border-[#3AC7B1] active:scale-95 flex items-center gap-4"
          >
            <div className="bg-[#3AC7B1]/20 p-3 rounded-full">
              <Share2 className="w-6 h-6 text-[#3AC7B1]" />
            </div>
            <div className="text-left flex-1">
              <p className="text-white font-semibold">Share</p>
              <p className="text-xs text-[#A3B1CC]">Via apps or messaging</p>
            </div>
            <div className="text-[#A3B1CC]">→</div>
          </button>

          <button
            onClick={handleShareEmail}
            className="w-full bg-[#181F32] rounded-2xl p-4 hover:bg-[#1A233A] transition-all border-2 border-[#2C3A6A] hover:border-[#3AC7B1] active:scale-95 flex items-center gap-4"
          >
            <div className="bg-[#6C7A9C]/20 p-3 rounded-full">
              <Mail className="w-6 h-6 text-[#6C7A9C]" />
            </div>
            <div className="text-left flex-1">
              <p className="text-white font-semibold">Email</p>
              <p className="text-xs text-[#A3B1CC]">Send via email</p>
            </div>
            <div className="text-[#A3B1CC]">→</div>
          </button>
        </div>

        {/* Benefits */}
        <div className="bg-[#181F32] rounded-2xl p-4 mb-6">
          <p className="text-white font-semibold mb-3">Benefits:</p>
          <ul className="space-y-2 text-sm text-[#A3B1CC]">
            <li className="flex items-start gap-2">
              <span className="text-[#3AC7B1] mt-1">✓</span>
              <span>One-time use link - expires after payment</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#3AC7B1] mt-1">✓</span>
              <span>No limit on amount the sender can pay</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#3AC7B1] mt-1">✓</span>
              <span>Secure and encrypted transaction</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#3AC7B1] mt-1">✓</span>
              <span>Instant payment notification</span>
            </li>
          </ul>
        </div>

        {/* Done Button */}
        <button
          onClick={() => navigate("/")}
          className="w-full bg-[#181F32] text-[#A3B1CC] py-4 rounded-2xl shadow-md hover:shadow-lg transition-all"
        >
          Done
        </button>
      </div>
    </div>
  );
}
