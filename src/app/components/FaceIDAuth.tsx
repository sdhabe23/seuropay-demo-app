import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router";
import { useTheme } from "../context/ThemeContext";
import React from "react";

export function FaceIDAuth(): React.ReactNode {
  const navigate = useNavigate();
  const location = useLocation();
  const { darkMode } = useTheme();
  const [isScanning, setIsScanning] = useState(true);
  const amount = location.state?.amount;
  const fromNFC = location.state?.fromNFC;

  useEffect(() => {
    // Auto-start scanning when component mounts
    const timer = setTimeout(() => {
      setIsScanning(false);
      // Complete the Face ID verification and navigate
      setTimeout(() => {
        if (fromNFC) {
          navigate("/nfc-payment", { state: { amount } });
        } else {
          navigate("/payment-success", { state: { amount } });
        }
      }, 500);
    }, 2000);

    return () => clearTimeout(timer);
  }, [navigate, amount, fromNFC]);

  return (
    <div className={darkMode ? "h-full bg-[#10192B] flex flex-col items-center justify-center overflow-hidden" : "h-full bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center justify-center overflow-hidden"}>
      {/* Main Face ID Circle */}
      <div className="relative w-64 h-80 flex items-center justify-center">
        <style>{`
          @keyframes face-frame-pulse {
            0%, 100% {
              stroke-opacity: 0.3;
            }
            50% {
              stroke-opacity: 0.8;
            }
          }
          @keyframes success-check {
            0% {
              opacity: 0;
              transform: scale(0);
            }
            50% {
              opacity: 1;
            }
            100% {
              opacity: 1;
              transform: scale(1);
            }
          }
          .face-frame {
            animation: face-frame-pulse 1.5s ease-in-out infinite;
          }
          .success-check {
            animation: success-check 0.6s ease-out forwards;
          }
        `}</style>

        {isScanning ? (
          <>
            {/* Scanning Face Frame */}
            <svg
              width="220"
              height="280"
              viewBox="0 0 220 280"
              fill="none"
              className="absolute"
            >
              {/* Top left corner */}
              <path d="M 20 40 L 20 20 L 40 20" stroke={darkMode ? "#3AC7B1" : "#2563eb"} strokeWidth="3" />
              {/* Top right corner */}
              <path d="M 200 20 L 220 20 L 220 40" stroke={darkMode ? "#3AC7B1" : "#2563eb"} strokeWidth="3" />
              {/* Bottom left corner */}
              <path d="M 20 240 L 20 260 L 40 260" stroke={darkMode ? "#3AC7B1" : "#2563eb"} strokeWidth="3" />
              {/* Bottom right corner */}
              <path d="M 200 260 L 220 260 L 220 240" stroke={darkMode ? "#3AC7B1" : "#2563eb"} strokeWidth="3" />
              
              {/* Oval face outline */}
              <ellipse cx="110" cy="140" rx="70" ry="90" fill="none" stroke={darkMode ? "#3AC7B1" : "#2563eb"} strokeWidth="2" className="face-frame" />
              
              {/* Left Eye */}
              <circle cx="85" cy="110" r="6" fill={darkMode ? "#3AC7B1" : "#2563eb"} />
              {/* Right Eye */}
              <circle cx="135" cy="110" r="6" fill={darkMode ? "#3AC7B1" : "#2563eb"} />
              
              {/* Mouth (curved smile) */}
              <path d="M 90 160 Q 110 175 130 160" stroke={darkMode ? "#3AC7B1" : "#2563eb"} strokeWidth="2" fill="none" strokeLinecap="round" />
            </svg>

            {/* Scanning Text */}
            <div className="absolute top-8 text-center">
              <p className={darkMode ? "text-[#A3B1CC] text-sm font-medium" : "text-gray-600 text-sm font-medium"}>
                Scanning...
              </p>
            </div>
          </>
        ) : (
          <>
            {/* Success Face Frame */}
            <svg
              width="220"
              height="280"
              viewBox="0 0 220 280"
              fill="none"
              className="absolute"
            >
              {/* Top left corner */}
              <path d="M 20 40 L 20 20 L 40 20" stroke="#10B981" strokeWidth="3" />
              {/* Top right corner */}
              <path d="M 200 20 L 220 20 L 220 40" stroke="#10B981" strokeWidth="3" />
              {/* Bottom left corner */}
              <path d="M 20 240 L 20 260 L 40 260" stroke="#10B981" strokeWidth="3" />
              {/* Bottom right corner */}
              <path d="M 200 260 L 220 260 L 220 240" stroke="#10B981" strokeWidth="3" />
              
              {/* Oval face outline */}
              <ellipse cx="110" cy="140" rx="70" ry="90" fill="none" stroke="#10B981" strokeWidth="2" />
              
              {/* Left Eye */}
              <circle cx="85" cy="110" r="6" fill="#10B981" />
              {/* Right Eye */}
              <circle cx="135" cy="110" r="6" fill="#10B981" />
              
              {/* Mouth (happy smile) */}
              <path d="M 90 160 Q 110 175 130 160" stroke="#10B981" strokeWidth="2" fill="none" strokeLinecap="round" />
            </svg>

            {/* Success Checkmark */}
            <svg width="80" height="80" viewBox="0 0 24 24" fill="none" className="success-check">
              <path
                d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"
                fill="#10B981"
              />
            </svg>

            {/* Success Text */}
            <div className="absolute top-8 text-center">
              <p className="text-green-500 text-sm font-medium">
                Verified
              </p>
            </div>
          </>
        )}
      </div>

      {/* Bottom Instructions */}
      <div className="absolute bottom-12 text-center px-6">
        <p className={darkMode ? "text-[#A3B1CC] text-sm" : "text-gray-600 text-sm"}>
          {isScanning ? "Position your face in the center" : "Biometric verification complete"}
        </p>
      </div>
    </div>
  );
}
