import { ArrowLeft, ArrowUpRight, ArrowDownLeft, Search } from "lucide-react";
import { useNavigate } from "react-router";
import { useState, useMemo } from "react";
import { getRandomAmount } from "../utils/currency";
import { useTheme } from "../context/ThemeContext";
import React from "react";

export function History(): React.ReactNode {
  const navigate = useNavigate();
  const { darkMode } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");

  const allTransactions = useMemo(() => [
    { id: 1, name: "coffee shop", amount: -getRandomAmount(), date: "Today, 10:30 AM", type: "expense" },
    { id: 2, name: "Swapnil Kasar", amount: getRandomAmount(), date: "Today, 09:15 AM", type: "income" },
    { id: 3, name: "grocery store", amount: -getRandomAmount(), date: "Yesterday, 6:45 PM", type: "expense" },
    { id: 4, name: "Eve Tönissoo", amount: getRandomAmount(), date: "Yesterday, 2:20 PM", type: "income" },
    { id: 5, name: "restaurant", amount: -getRandomAmount(), date: "Feb 15, 7:30 PM", type: "expense" },
    { id: 6, name: "Angelika Dhabe", amount: getRandomAmount(), date: "Feb 15, 3:15 PM", type: "income" },
    { id: 7, name: "pharmacy", amount: -getRandomAmount(), date: "Feb 14, 11:20 AM", type: "expense" },
    { id: 8, name: "bookstore", amount: -getRandomAmount(), date: "Feb 14, 9:45 AM", type: "expense" },
    { id: 9, name: "Swapnil Kasar", amount: getRandomAmount(), date: "Feb 13, 4:30 PM", type: "income" },
    { id: 10, name: "gas station", amount: -getRandomAmount(), date: "Feb 13, 8:00 AM", type: "expense" },
    { id: 11, name: "repair shop", amount: -getRandomAmount(), date: "Feb 12, 2:00 PM", type: "expense" },
    { id: 12, name: "Eve Tönissoo", amount: getRandomAmount(), date: "Feb 12, 10:30 AM", type: "income" },
    { id: 13, name: "bakery", amount: -getRandomAmount(), date: "Feb 11, 7:15 AM", type: "expense" },
    { id: 14, name: "clothing store", amount: -getRandomAmount(), date: "Feb 10, 5:45 PM", type: "expense" },
    { id: 15, name: "Angelika Dhabe", amount: getRandomAmount(), date: "Feb 10, 1:00 PM", type: "income" },
    { id: 16, name: "grocery store", amount: -getRandomAmount(), date: "Feb 9, 6:30 PM", type: "expense" },
    { id: 17, name: "coffee shop", amount: -getRandomAmount(), date: "Feb 9, 9:00 AM", type: "expense" },
    { id: 18, name: "electronics store", amount: -getRandomAmount(), date: "Feb 8, 3:20 PM", type: "expense" },
    { id: 19, name: "Swapnil Kasar", amount: getRandomAmount(), date: "Feb 8, 11:45 AM", type: "income" },
    { id: 20, name: "cinema", amount: -getRandomAmount(), date: "Feb 7, 8:00 PM", type: "expense" },
  ], []);

  const filteredTransactions = allTransactions.filter(transaction =>
    transaction.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={darkMode ? "h-full bg-[#10192B] flex flex-col overflow-hidden" : "h-full bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col overflow-hidden"}>
      {/* Header */}
      <div className={darkMode ? "bg-[#181F32] text-white px-6 pt-8 py-6 shadow-lg flex-shrink-0" : "bg-white text-gray-900 px-6 pt-8 py-6 shadow-lg flex-shrink-0 border-b border-gray-200"}>
        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={() => navigate("/")}
            className={darkMode ? "p-2 hover:bg-white/20 rounded-xl transition-colors" : "p-2 hover:bg-gray-100 rounded-xl transition-colors"}
          >
            <ArrowLeft className={darkMode ? "w-6 h-6" : "w-6 h-6 text-gray-900"} />
          </button>
          <h1 className={darkMode ? "text-xl" : "text-xl text-gray-900"}>Transaction History</h1>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className={darkMode ? "absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#A3B1CC]" : "absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"} />
          <input
            type="text"
            placeholder="Search transactions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={darkMode ? "w-full pl-12 pr-4 py-3 rounded-xl bg-[#1A233A] border border-[#2C3A6A] text-white placeholder-[#A3B1CC] focus:outline-none focus:ring-2 focus:ring-[#3AC7B1]" : "w-full pl-12 pr-4 py-3 rounded-xl bg-gray-50 border border-gray-300 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"}
          />
        </div>
      </div>

      {/* Transactions List */}
      <div className="flex-1 p-6 overflow-y-auto overscroll-contain">
        <div className={darkMode ? "bg-[#181F32] rounded-2xl shadow-md overflow-hidden" : "bg-white rounded-2xl shadow-md overflow-hidden border border-gray-200"}>
          {filteredTransactions.length > 0 ? (
            filteredTransactions.map((transaction) => (
              <div
                key={transaction.id}
                className={darkMode ? "flex items-center justify-between p-4 border-b border-[#2C3A6A] last:border-b-0 hover:bg-[#1A233A] transition-colors" : "flex items-center justify-between p-4 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors"}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`p-3 rounded-full flex-shrink-0 ${
                      transaction.type === "expense"
                        ? darkMode ? "bg-red-900/40" : "bg-red-100"
                        : darkMode ? "bg-green-900/40" : "bg-green-100"
                    }`}
                  >
                    {transaction.type === "expense" ? (
                      <ArrowUpRight className={darkMode ? "w-5 h-5 text-red-400" : "w-5 h-5 text-red-600"} />
                    ) : (
                      <ArrowDownLeft className={darkMode ? "w-5 h-5 text-green-400" : "w-5 h-5 text-green-600"} />
                    )}
                  </div>
                  <div>
                    <p className={darkMode ? "text-white" : "text-gray-900"}>{transaction.name}</p>
                    <p className={darkMode ? "text-sm text-[#A3B1CC]" : "text-sm text-gray-500"}>{transaction.date}</p>
                  </div>
                </div>
                <p
                  className={`flex-shrink-0 font-semibold ${
                    transaction.type === "expense"
                      ? darkMode ? "text-red-400" : "text-red-600"
                      : darkMode ? "text-green-400" : "text-green-600"
                  }`}
                >
                  {transaction.amount > 0 ? "+" : ""}€{Math.abs(transaction.amount).toFixed(2)}
                </p>
              </div>
            ))
          ) : (
            <div className={darkMode ? "p-8 text-center text-[#A3B1CC]" : "p-8 text-center text-gray-500"}>
              No transactions found
            </div>
          )}
        </div>
      </div>

      {/* Navigation Bar */}
      <div className={darkMode ? "flex-shrink-0 flex justify-between items-center bg-[#181F32] rounded-b-3xl px-4 py-2" : "flex-shrink-0 flex justify-between items-center bg-white rounded-b-3xl px-4 py-2 border-t border-gray-200"}>
        <button onClick={() => navigate("/")} className="flex flex-col items-center hover:opacity-80 transition-opacity">
          <svg width="28" height="28" fill="none" viewBox="0 0 24 24"><path d="M3 12l9-9 9 9M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" stroke={darkMode ? "#A3B1CC" : "#6b7280"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          <span className={darkMode ? "text-[#A3B1CC] text-xs mt-1" : "text-gray-600 text-xs mt-1"}>Home</span>
        </button>
        <button onClick={() => navigate("/scan")} className="flex flex-col items-center hover:opacity-80 transition-opacity">
          <svg width="28" height="28" fill="none" viewBox="0 0 24 24"><rect x="3" y="3" width="8" height="8" rx="1" stroke={darkMode ? "#A3B1CC" : "#6b7280"} strokeWidth="2"/><rect x="13" y="3" width="8" height="8" rx="1" stroke={darkMode ? "#A3B1CC" : "#6b7280"} strokeWidth="2"/><rect x="3" y="13" width="8" height="8" rx="1" stroke={darkMode ? "#A3B1CC" : "#6b7280"} strokeWidth="2"/><rect x="13" y="13" width="8" height="8" rx="1" stroke={darkMode ? "#A3B1CC" : "#6b7280"} strokeWidth="2"/><circle cx="7" cy="7" r="1" fill={darkMode ? "#A3B1CC" : "#6b7280"}/><circle cx="17" cy="7" r="1" fill={darkMode ? "#A3B1CC" : "#6b7280"}/><circle cx="7" cy="17" r="1" fill={darkMode ? "#A3B1CC" : "#6b7280"}/><circle cx="17" cy="17" r="1" fill={darkMode ? "#A3B1CC" : "#6b7280"}/></svg>
          <span className={darkMode ? "text-[#A3B1CC] text-xs mt-1" : "text-gray-600 text-xs mt-1"}>Scan</span>
        </button>
        <button onClick={() => navigate("/history")} className="flex flex-col items-center hover:opacity-80 transition-opacity">
          <svg width="28" height="28" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" stroke="#3AC7B1" strokeWidth="2"/><path d="M12 6v6l4 2" stroke="#3AC7B1" strokeWidth="2" strokeLinecap="round"/></svg>
          <span className="text-[#3AC7B1] text-xs mt-1">History</span>
        </button>
        <button onClick={() => navigate("/profile")} className="flex flex-col items-center hover:opacity-80 transition-opacity">
          <svg width="28" height="28" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="8" r="4" stroke={darkMode ? "#A3B1CC" : "#6b7280"} strokeWidth="2"/><path d="M6 20c0-3.314 2.686-6 6-6s6 2.686 6 6" stroke={darkMode ? "#A3B1CC" : "#6b7280"} strokeWidth="2" strokeLinecap="round"/></svg>
          <span className={darkMode ? "text-[#A3B1CC] text-xs mt-1" : "text-gray-600 text-xs mt-1"}>Profile</span>
        </button>
      </div>
    </div>
  );
}
