/**
 * PaymentResult — shown after Tink redirects back from the /1.0/pay/ flow.
 *
 * Tink appends to the redirect_uri:
 *   ?payment_request_id=<id>&status=<PENDING|PAID|CANCELLED>
 *   or
 *   ?error=<code>&message=<description>
 *
 * We parse these from the URL (hash router puts query params in window.location.search
 * when the redirect lands, BEFORE the hash router takes over — so we read them on mount).
 */

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { CheckCircle, XCircle, Clock, ArrowLeft, RefreshCw } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { getTinkPaymentStatus } from "../../services/api";
import { useBankData } from "../context/BankContext";

type PaymentStatus = "PENDING" | "PAID" | "SETTLED" | "CANCELLED" | "FAILED" | "ERROR" | null;

export function PaymentResult(): React.ReactNode {
  const navigate = useNavigate();
  const { darkMode } = useTheme();
  const { transactions } = useBankData();

  const [paymentRequestId, setPaymentRequestId] = useState<string | null>(null);
  const [status, setStatus] = useState<PaymentStatus>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [polling, setPolling] = useState(false);

  // Parse URL on mount — could come from both search params and hash params
  useEffect(() => {
    // Tink redirects to: https://demo.seuropay.com/api/tink/callback
    // which our backend then redirects to: https://demo.seuropay.com/#/payment-result?...
    // So the query params are in window.location.search (before the hash) OR after the hash.
    const searchParams = new URLSearchParams(window.location.search);
    const hashParams = new URLSearchParams(window.location.hash.split("?")[1] || "");

    const id = searchParams.get("payment_request_id") || hashParams.get("payment_request_id");
    const st = searchParams.get("status") || hashParams.get("status");
    const err = searchParams.get("error") || hashParams.get("error");

    if (err) {
      setErrorMsg(decodeURIComponent(err));
      setStatus("ERROR");
    } else if (id) {
      setPaymentRequestId(id);
      setStatus((st as PaymentStatus) || "PENDING");
    }

    // Clean up URL
    window.history.replaceState(null, "", window.location.pathname + window.location.hash.split("?")[0]);
  }, []);

  // Poll for PENDING status
  useEffect(() => {
    if (status !== "PENDING" || !paymentRequestId) return;

    let attempts = 0;
    const maxAttempts = 12; // 60 seconds total

    const poll = async () => {
      attempts++;
      setPolling(true);
      try {
        const data = await getTinkPaymentStatus(paymentRequestId);
        const newStatus = data.status as PaymentStatus;
        setStatus(newStatus);
        if (newStatus === "PENDING" && attempts < maxAttempts) {
          setTimeout(poll, 5000);
        } else {
          setPolling(false);
        }
      } catch {
        setPolling(false);
      }
    };

    const timer = setTimeout(poll, 3000);
    return () => clearTimeout(timer);
  }, [status, paymentRequestId]);

  const isSuccess = status === "PAID" || status === "SETTLED";
  const isPending = status === "PENDING";
  const isFailed = status === "CANCELLED" || status === "FAILED" || status === "ERROR";

  const card = darkMode
    ? "bg-[#181F32] rounded-2xl shadow-md"
    : "bg-white rounded-2xl shadow-md border border-gray-200";
  const textColor = darkMode ? "text-white" : "text-gray-900";
  const labelColor = darkMode ? "text-[#A3B1CC]" : "text-gray-600";

  return (
    <div className={darkMode ? "h-full bg-[#10192B] flex flex-col" : "h-full bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col"}>
      {/* Header */}
      <div className={darkMode ? "bg-[#181F32] text-white px-6 pt-8 py-6 shadow-lg" : "bg-white text-gray-900 px-6 pt-8 py-6 shadow-lg border-b border-gray-200"}>
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/")}
            className={darkMode ? "p-2 hover:bg-white/20 rounded-xl" : "p-2 hover:bg-gray-100 rounded-xl"}
          >
            <ArrowLeft className={darkMode ? "w-6 h-6" : "w-6 h-6 text-gray-900"} />
          </button>
          <h1 className={darkMode ? "text-xl" : "text-xl text-gray-900"}>Payment Result</h1>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-8 gap-6">
        {/* Status icon */}
        <div className={`w-24 h-24 rounded-full flex items-center justify-center ${
          isSuccess
            ? darkMode ? "bg-green-900/40" : "bg-green-100"
            : isPending
              ? darkMode ? "bg-amber-900/40" : "bg-amber-100"
              : darkMode ? "bg-red-900/40" : "bg-red-100"
        }`}>
          {isSuccess && <CheckCircle className="w-12 h-12 text-green-500" />}
          {isPending && (
            polling
              ? <RefreshCw className="w-12 h-12 text-amber-500 animate-spin" />
              : <Clock className="w-12 h-12 text-amber-500" />
          )}
          {isFailed && <XCircle className="w-12 h-12 text-red-500" />}
        </div>

        {/* Status message */}
        <div className="text-center space-y-2">
          <h2 className={`text-2xl font-bold ${textColor}`}>
            {isSuccess && "Payment Successful!"}
            {isPending && (polling ? "Checking status…" : "Payment Pending")}
            {isFailed && "Payment Failed"}
          </h2>

          {paymentRequestId && (
            <p className={`text-xs font-mono ${labelColor}`}>
              ID: {paymentRequestId.slice(0, 16)}…
            </p>
          )}

          {errorMsg && (
            <p className={`text-sm ${darkMode ? "text-red-300" : "text-red-600"}`}>{errorMsg}</p>
          )}

          {isPending && !polling && (
            <p className={`text-sm ${labelColor}`}>
              Your bank may still be processing the payment. Check back later.
            </p>
          )}

          {isSuccess && (
            <p className={`text-sm ${darkMode ? "text-green-300" : "text-green-700"}`}>
              Your bank payment was approved and processed successfully.
            </p>
          )}
        </div>

        {/* Payment details card */}
        {paymentRequestId && (
          <div className={`${card} p-5 w-full max-w-sm`}>
            <p className={`${labelColor} text-xs font-semibold uppercase mb-3`}>Payment Details</p>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className={`text-sm ${labelColor}`}>Reference</span>
                <span className={`text-sm font-mono ${textColor}`}>{paymentRequestId.slice(0, 8)}…</span>
              </div>
              <div className="flex justify-between">
                <span className={`text-sm ${labelColor}`}>Status</span>
                <span className={`text-sm font-semibold ${
                  isSuccess ? "text-green-500" : isPending ? "text-amber-500" : "text-red-500"
                }`}>{status}</span>
              </div>
              <div className="flex justify-between">
                <span className={`text-sm ${labelColor}`}>Provider</span>
                <span className={`text-sm ${textColor}`}>Tink</span>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col gap-3 w-full max-w-sm">
          {isPending && !polling && (
            <button
              onClick={() => {
                setStatus("PENDING");
                setPolling(true);
              }}
              className={darkMode ? "w-full bg-amber-600 text-white py-3 rounded-2xl font-semibold flex items-center justify-center gap-2" : "w-full bg-amber-500 text-white py-3 rounded-2xl font-semibold flex items-center justify-center gap-2"}
            >
              <RefreshCw className="w-4 h-4" />
              Refresh Status
            </button>
          )}
          <button
            onClick={() => navigate("/")}
            className="w-full bg-gradient-to-r from-[#3AC7B1] to-[#6C7A9C] text-white py-3 rounded-2xl font-semibold"
          >
            Back to Home
          </button>
          <button
            onClick={() => navigate("/link-bank")}
            className={darkMode ? "w-full bg-[#181F32] border border-[#2C3A6A] text-[#A3B1CC] py-3 rounded-2xl font-semibold" : "w-full bg-white border border-gray-200 text-gray-600 py-3 rounded-2xl font-semibold"}
          >
            Make Another Payment
          </button>
        </div>
      </div>
    </div>
  );
}
