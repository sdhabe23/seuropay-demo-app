import React from "react";
import { useState } from "react";
import { ArrowLeft, CheckCircle, Camera, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router";
import { useTheme } from "../context/ThemeContext";

export function ScanQR(): React.ReactNode {
  const navigate = useNavigate();
  const { darkMode } = useTheme();
  const [scannedData, setScannedData] = useState<any>(null);
  const [isScanning, setIsScanning] = useState(true);

  const handleSimulateScan = () => {
    setIsScanning(false);
    const mockData = {
      app: "SeuroPay",
      amount: 25.50,
      currency: "EUR",
      timestamp: Date.now(),
    };
    setScannedData(mockData);
    
    setTimeout(() => {
      navigate("/");
    }, 2000);
  };

  return (
    <div className={darkMode ? "h-full bg-black flex flex-col overflow-hidden" : "h-full bg-white flex flex-col overflow-hidden"}>
      {/* Header */}
      <div className={darkMode ? "bg-black/80 backdrop-blur-sm text-white px-6 pt-8 py-6 relative z-20 flex-shrink-0" : "bg-white border-b border-gray-200 text-gray-900 px-6 pt-8 py-6 relative z-20 flex-shrink-0"}>
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/")}
            className={darkMode ? "p-2 hover:bg-white/20 rounded-xl transition-colors" : "p-2 hover:bg-gray-100 rounded-xl transition-colors"}
          >
            <ArrowLeft className={darkMode ? "w-6 h-6 text-white" : "w-6 h-6 text-gray-900"} />
          </button>
          <h1 className="text-xl font-semibold">Scan QR Code</h1>
        </div>
      </div>

      {/* Scanner */}
      <div className="flex-1 relative overflow-hidden">
        {!scannedData ? (
          <>
            {/* Camera simulation background */}
            <div className={darkMode ? "absolute inset-0 bg-gradient-to-br from-gray-700 via-gray-800 to-gray-900" : "absolute inset-0 bg-gradient-to-br from-gray-100 via-gray-200 to-gray-300"}>
              {/* Animated camera viewfinder effect */}
              <div className="absolute inset-0 opacity-20">
                <div className="w-full h-full bg-[radial-gradient(circle_at_center,_transparent_0%,_black_100%)]"></div>
              </div>
            </div>
            
            {/* Scanning overlay */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="relative">
                {/* Corner borders */}
                <div className="w-64 h-64 relative">
                  {/* Top left */}
                  <div className="absolute top-0 left-0 w-12 h-12 border-t-4 border-l-4 border-[#3AC7B1] rounded-tl-2xl"></div>
                  {/* Top right */}
                  <div className="absolute top-0 right-0 w-12 h-12 border-t-4 border-r-4 border-[#3AC7B1] rounded-tr-2xl"></div>
                  {/* Bottom left */}
                  <div className="absolute bottom-0 left-0 w-12 h-12 border-b-4 border-l-4 border-[#3AC7B1] rounded-bl-2xl"></div>
                  {/* Bottom right */}
                  <div className="absolute bottom-0 right-0 w-12 h-12 border-b-4 border-r-4 border-[#3AC7B1] rounded-br-2xl"></div>
                  
                  {/* Scanning line */}
                  {isScanning && (
                    <div className="absolute inset-0 overflow-hidden">
                      <div className="w-full h-1 bg-[#3AC7B1] shadow-lg shadow-[#3AC7B1]/50 animate-pulse"></div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Instructions */}
            <div className={darkMode ? "absolute bottom-24 left-0 right-0 px-6 z-10" : "absolute bottom-24 left-0 right-0 px-6 z-10"}>
              <div className={darkMode ? "bg-black/60 backdrop-blur-md rounded-2xl p-4 text-center" : "bg-white/80 backdrop-blur-md rounded-2xl p-4 text-center"}>
                <p className={darkMode ? "text-white text-sm" : "text-gray-900 text-sm"}>
                  Position the QR code within the frame to scan
                </p>
              </div>
            </div>

            {/* Demo scan button */}
            <div className="absolute bottom-8 left-0 right-0 px-6 z-10 pointer-events-auto">
              <button
                onClick={handleSimulateScan}
                className="w-full bg-[#3AC7B1] hover:bg-[#32b5a0] text-white py-4 rounded-2xl transition-all shadow-lg flex items-center justify-center gap-2 font-semibold"
              >
                <Camera className="w-5 h-5" />
                <span>Simulate QR Scan (Demo)</span>
              </button>
            </div>
          </>
        ) : (
          /* Success screen */
          <div className="absolute inset-0 bg-gradient-to-br from-[#3AC7B1] to-[#2a9f8f] flex flex-col items-center justify-center px-6">
            <CheckCircle className="w-24 h-24 text-white mb-6" />
            <h2 className="text-white text-2xl mb-2">QR Code Scanned!</h2>
            <p className="text-white/80 text-center">Amount: €{scannedData.amount}</p>
          </div>
        )}
      </div>
    </div>
  );
}
