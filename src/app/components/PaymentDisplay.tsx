import React from "react";
import { useState } from "react";
import { ArrowLeft, Smartphone, Check, Loader } from "lucide-react";
import { useNavigate, useLocation } from "react-router";

export function PaymentDisplay(): React.ReactNode {
  const navigate = useNavigate();
  const location = useLocation();
  const amount = location.state?.amount || "0";
  const contact = location.state?.contact;
  const initialMethod = location.state?.method || "qr";
  const [paymentMethod, setPaymentMethod] = useState<"qr" | "nfc">(initialMethod);
  const [isNfcActive, setIsNfcActive] = useState(false);

  const paymentData = JSON.stringify({
    app: "SeuroPay",
    amount: parseFloat(amount),
    currency: "EUR",
    timestamp: Date.now(),
  });

  const handleNfcTap = () => {
    setIsNfcActive(true);
    setTimeout(() => {
      setIsNfcActive(false);
    }, 2000);
  };

  return (
    <div className="h-full bg-[#10192B] flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-[#181F32] text-white px-6 pt-8 py-6 shadow-lg flex-shrink-0">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/send")}
            className="p-2 hover:bg-white/20 rounded-xl transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl">Payment</h1>
        </div>
      </div>

      <div className="flex-1 p-6 overflow-y-auto">
        {/* Amount Display */}
        <div className="bg-[#181F32] rounded-2xl shadow-md p-6 mb-6 text-center">
          <p className="text-[#A3B1CC] mb-1">Amount to Send</p>
          <p className="text-5xl text-white">€{amount}</p>
        </div>

        {/* Payment Method Tabs */}
        <div className="bg-[#181F32] rounded-2xl shadow-md p-2 mb-6 flex gap-2">
          <button
            onClick={() => setPaymentMethod("qr")}
            className={`flex-1 py-3 rounded-xl transition-all flex items-center justify-center gap-2 ${
              paymentMethod === "qr"
                ? "bg-gradient-to-r from-[#3AC7B1] to-[#6C7A9C] text-white shadow-md"
                : "text-[#A3B1CC] hover:bg-[#1A233A]"
            }`}
          >
            <span>QR Code</span>
          </button>
          <button
            onClick={() => setPaymentMethod("nfc")}
            className={`flex-1 py-3 rounded-xl transition-all flex items-center justify-center gap-2 ${
              paymentMethod === "nfc"
                ? "bg-gradient-to-r from-[#3AC7B1] to-[#6C7A9C] text-white shadow-md"
                : "text-[#A3B1CC] hover:bg-[#1A233A]"
            }`}
          >
            <span>NFC Tap</span>
          </button>
        </div>

        {/* Payment Display */}
        {paymentMethod === "qr" ? (
          <div className="bg-[#181F32] rounded-2xl shadow-xl p-8">
            <div className="flex flex-col items-center">
              <p className="text-[#A3B1CC] mb-6 text-center">
                Show this QR code to the recipient
              </p>
              <div className="bg-white p-6 rounded-2xl shadow-inner w-64 h-64 flex items-center justify-center">
                <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg flex items-center justify-center text-gray-500">
                  QR Code Placeholder
                </div>
              </div>
              <p className="text-sm text-[#A3B1CC] mt-6 text-center max-w-xs">
                The recipient can scan this QR code with their SeuroPay app to receive €{amount}
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-[#181F32] rounded-2xl shadow-xl p-8">
            <div className="flex flex-col items-center">
              <p className="text-[#A3B1CC] mb-6 text-center">
                Tap your device to send payment
              </p>
              
              <button
                onClick={handleNfcTap}
                disabled={isNfcActive}
                className={`relative w-64 h-64 rounded-full flex items-center justify-center transition-all ${
                  isNfcActive
                    ? "bg-gradient-to-br from-green-500 to-green-600 shadow-2xl scale-105"
                    : "bg-gradient-to-br from-[#3AC7B1] to-[#6C7A9C] hover:shadow-2xl hover:scale-105 active:scale-95"
                }`}
              >
                <div className="absolute inset-0 rounded-full bg-white/20 animate-ping"></div>
                {isNfcActive ? (
                  <Check className="w-24 h-24 text-white relative z-10" />
                ) : (
                  <Smartphone className="w-24 h-24 text-white relative z-10" />
                )}
              </button>

              <p className="text-sm text-[#A3B1CC] mt-6 text-center max-w-xs">
                {isNfcActive
                  ? "Payment processing..."
                  : "Hold your device near the recipient's device to transfer €" + amount}
              </p>

              {isNfcActive && (
                <div className="mt-4 flex items-center gap-2 text-green-400">
                  <Check className="w-5 h-5" />
                  <span>Connection established!</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Info */}
        <div className="mt-6 bg-[#1A233A] border border-[#3AC7B1]/30 rounded-xl p-4">
          <p className="text-sm text-[#A3B1CC] text-center">
            <strong>Tip:</strong> Make sure the recipient has their SeuroPay app ready to receive the payment
          </p>
        </div>

        {/* Cancel Button */}
        <button
          onClick={() => navigate("/")}
          className="w-full mt-6 bg-[#181F32] text-[#A3B1CC] py-4 rounded-2xl shadow-md hover:shadow-lg transition-all"
        >
          Cancel Payment
        </button>
      </div>
    </div>
  );
}
