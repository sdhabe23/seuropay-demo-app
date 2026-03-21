import { ArrowLeft, Smartphone, Check, Loader } from "lucide-react";
import { useNavigate } from "react-router";
import { useState } from "react";
import React from "react";

export function ReceiveNFC(): React.ReactNode {
  const navigate = useNavigate();
  const [isActive, setIsActive] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  const handleActivateNFC = () => {
    setIsActive(true);
    setTimeout(() => {
      setIsConnected(true);
    }, 3000);
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
          <h1 className="text-xl">Receive via NFC</h1>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 overflow-hidden">
        {!isConnected ? (
          <div className="text-center">
            <div className="relative mb-8">
              <button
                onClick={handleActivateNFC}
                disabled={isActive}
                className={`relative w-40 h-40 mx-auto rounded-full flex items-center justify-center transition-all ${
                  isActive
                    ? "bg-gradient-to-br from-[#3AC7B1] to-[#2a9f8f] shadow-2xl scale-110"
                    : "bg-gradient-to-br from-[#3AC7B1] to-[#6C7A9C] hover:shadow-2xl hover:scale-105 active:scale-95 cursor-pointer"
                }`}
              >
                <div className="absolute inset-0 rounded-full bg-white/20 animate-pulse"></div>
                {isActive ? (
                  <Loader className="w-20 h-20 text-white relative z-10 animate-spin" />
                ) : (
                  <Smartphone className="w-20 h-20 text-white relative z-10" />
                )}
              </button>
            </div>

            <h2 className="text-2xl text-white mb-4">
              {isActive ? "Waiting for Connection..." : "Ready to Receive"}
            </h2>
            <p className="text-[#A3B1CC] mb-6 max-w-sm">
              {isActive
                ? "Hold the sender's device near yours to receive payment via NFC"
                : "Tap the button below to enable NFC and wait for an incoming payment"}
            </p>

            {!isActive && (
              <button
                onClick={handleActivateNFC}
                className="bg-gradient-to-r from-[#3AC7B1] to-[#6C7A9C] text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg transition-all"
              >
                Enable NFC
              </button>
            )}

            {isActive && (
              <div className="flex items-center justify-center gap-2 text-[#3AC7B1]">
                <Loader className="w-5 h-5 animate-spin" />
                <span>Searching for sender...</span>
              </div>
            )}
          </div>
        ) : (
          /* Connected */
          <div className="text-center">
            <div className="w-40 h-40 mx-auto rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center mb-8">
              <Check className="w-24 h-24 text-white" />
            </div>

            <h2 className="text-2xl text-white mb-4">Payment Ready!</h2>
            <p className="text-[#A3B1CC] mb-6 max-w-sm">
              Your device is ready to receive payments via NFC. The sender can now transfer money to you.
            </p>

            <div className="flex items-center justify-center gap-2 text-green-400 mb-8">
              <Check className="w-5 h-5" />
              <span className="font-semibold">NFC Enabled</span>
            </div>

            <button
              onClick={() => navigate("/")}
              className="bg-gradient-to-r from-[#3AC7B1] to-[#6C7A9C] text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg transition-all"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
