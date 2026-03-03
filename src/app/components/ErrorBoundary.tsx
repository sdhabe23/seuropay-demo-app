import React from "react";
import { useNavigate, useRouteError, isRouteErrorResponse } from "react-router";

export function ErrorBoundary(): React.ReactNode {
  const error = useRouteError();
  const navigate = useNavigate();

  const is404 =
    isRouteErrorResponse(error) && error.status === 404;

  const title = is404 ? "Page Not Found" : "Something Went Wrong";
  const message = is404
    ? "The page you're looking for doesn't exist or has been moved."
    : error instanceof Error
    ? error.message
    : "An unexpected error occurred.";
  const emoji = is404 ? "🔍" : "⚠️";

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-[400px] h-[844px] bg-gradient-to-br from-blue-50 to-indigo-100 rounded-[3rem] shadow-2xl overflow-hidden relative flex items-center justify-center">
        {/* Phone notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-7 bg-black rounded-b-3xl z-50" />

        <div className="bg-white rounded-3xl p-8 w-72 shadow-xl text-center">
          <div className="text-6xl mb-4">{emoji}</div>
          <h1 className="text-gray-900 text-2xl font-bold mb-2">{title}</h1>
          <p className="text-gray-500 text-sm mb-8">{message}</p>

          <div className="flex flex-col gap-3">
            <button
              onClick={() => navigate("/")}
              className="bg-gradient-to-r from-[#3AC7B1] to-[#2A9E8A] text-white rounded-2xl px-6 py-3 font-semibold hover:opacity-90 transition-opacity"
            >
              🏠 Go to Home
            </button>
            <button
              onClick={() => navigate(-1)}
              className="bg-gray-100 text-gray-600 rounded-2xl px-6 py-3 font-semibold hover:opacity-80 transition-opacity"
            >
              ← Go Back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
