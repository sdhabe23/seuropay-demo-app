import React from "react";
import { useNavigate } from "react-router";
import { useTheme } from "../context/ThemeContext";
import { Home, ArrowLeft } from "lucide-react";

export function NotFound(): React.ReactNode {
  const navigate = useNavigate();
  const { darkMode } = useTheme();

  return (
    <div
      className={
        darkMode
          ? "h-full bg-[#10192B] flex flex-col items-center justify-center p-8 text-center"
          : "h-full bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center justify-center p-8 text-center"
      }
    >
      <div
        className={
          darkMode
            ? "bg-[#1A233A] rounded-3xl p-8 w-full max-w-sm shadow-xl"
            : "bg-white rounded-3xl p-8 w-full max-w-sm shadow-xl"
        }
      >
        <div className="text-6xl mb-4">🔍</div>
        <h1
          className={
            darkMode
              ? "text-white text-2xl font-bold mb-2"
              : "text-gray-900 text-2xl font-bold mb-2"
          }
        >
          Page Not Found
        </h1>
        <p
          className={
            darkMode
              ? "text-[#A3B1CC] text-sm mb-8"
              : "text-gray-500 text-sm mb-8"
          }
        >
          The page you're looking for doesn't exist or has been moved.
        </p>

        <div className="flex flex-col gap-3">
          <button
            onClick={() => navigate("/")}
            className="bg-gradient-to-r from-[#3AC7B1] to-[#2A9E8A] text-white rounded-2xl px-6 py-3 font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
          >
            <Home className="w-5 h-5" />
            Go to Home
          </button>
          <button
            onClick={() => navigate(-1)}
            className={
              darkMode
                ? "bg-[#10192B] text-[#A3B1CC] border border-[#2A3550] rounded-2xl px-6 py-3 font-semibold flex items-center justify-center gap-2 hover:opacity-80 transition-opacity"
                : "bg-gray-100 text-gray-600 rounded-2xl px-6 py-3 font-semibold flex items-center justify-center gap-2 hover:opacity-80 transition-opacity"
            }
          >
            <ArrowLeft className="w-5 h-5" />
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
}
