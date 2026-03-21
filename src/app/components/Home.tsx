import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { Eye, EyeOff } from "lucide-react";
import { getRandomAmount } from "../utils/currency";
import { useTheme } from "../context/ThemeContext";

export function Home(): React.ReactNode {
  const navigate = useNavigate();
  const { darkMode } = useTheme();
  const [balanceVisible, setBalanceVisible] = useState(() => {
    const saved = localStorage.getItem('balanceVisible');
    return saved !== null ? JSON.parse(saved) : true;
  });
  const [balance, setBalance] = useState(12513.26);
  const randomAmounts = useMemo(() => [
    { time: 'Feb 28, 10:55 PM', amount: `-€${getRandomAmount().toFixed(2)}` },
    { time: 'Feb 28, 10:53 PM', amount: `-€${getRandomAmount().toFixed(2)}` },
    { time: 'Feb 28, 10:45 PM', amount: `-€${getRandomAmount().toFixed(2)}` },
    { time: 'Feb 28, 10:30 PM', amount: `-€${getRandomAmount().toFixed(2)}` }
  ], []);

  // Update balance when coming back from payment or receive
  React.useEffect(() => {
    const handleBalanceUpdate = () => {
      const stored = sessionStorage.getItem('balanceUpdate');
      if (stored) {
        const { type, amount } = JSON.parse(stored);
        if (type === 'payment') {
          setBalance(prev => Math.max(0, prev - amount));
        } else if (type === 'receive') {
          setBalance(prev => prev + amount);
        }
        sessionStorage.removeItem('balanceUpdate');
      }
    };
    
    handleBalanceUpdate();
  }, []);

  // Save balance visibility to localStorage
  React.useEffect(() => {
    localStorage.setItem('balanceVisible', JSON.stringify(balanceVisible));
  }, [balanceVisible]);

  return (
    <div className={darkMode ? "bg-[#10192B] h-full w-full rounded-3xl p-6 flex flex-col justify-between shadow-xl overflow-y-auto" : "bg-gradient-to-br from-blue-50 to-indigo-100 h-full w-full rounded-3xl p-6 flex flex-col justify-between shadow-xl overflow-y-auto"}>
      <div>
        <div className={darkMode ? "text-[#3AC7B1] text-2xl font-bold mb-8" : "text-blue-600 text-2xl font-bold mb-8"}>SeuroPay</div>
        <div className="flex items-center justify-between mb-2">
          <div className={darkMode ? "text-[#A3B1CC] text-lg" : "text-gray-600 text-lg"}>Available Balance</div>
          <button
            onClick={() => setBalanceVisible(!balanceVisible)}
            className={darkMode ? "p-2 hover:bg-[#1A233A] rounded-lg transition-colors" : "p-2 hover:bg-blue-100 rounded-lg transition-colors"}
          >
            {balanceVisible ? (
              <Eye width="20" height="20" color={darkMode ? "#3AC7B1" : "#1e40af"} />
            ) : (
              <EyeOff width="20" height="20" color={darkMode ? "#3AC7B1" : "#1e40af"} />
            )}
          </button>
        </div>
        <div className={darkMode ? "text-white text-4xl font-bold mb-6" : "text-gray-900 text-4xl font-bold mb-6"}>
          {balanceVisible ? `€${balance.toFixed(2)}` : '••••••'}
        </div>
        <div className="flex gap-4 mb-8">
          <button onClick={() => navigate("/payment-method")} className="bg-gradient-to-r from-[#3AC7B1] to-[#6C7A9C] rounded-2xl flex-1 flex items-center justify-between px-6 py-4 cursor-pointer hover:shadow-lg transition-all">
            <div className="flex items-center">
              <div>
                <div className="text-white font-semibold text-lg">Pay</div>
                <div className="text-white text-sm opacity-90">Tap to pay or Scan QR</div>
              </div>
            </div>
            <div>
              <svg width="24" height="24" fill="none"><path d="M7 17L17 7M17 7H7M17 7V17" stroke="white" strokeWidth="2" strokeLinecap="round"/></svg>
            </div>
          </button>
          <button onClick={() => navigate("/receive-amount")} className="bg-gradient-to-r from-[#3AC7B1] to-[#2A9E8A] rounded-2xl flex-1 flex items-center justify-between px-6 py-4 cursor-pointer hover:shadow-lg transition-all">
            <div className="flex items-center">
              <div>
                <div className="text-white font-semibold text-lg">Receive</div>
                <div className="text-white text-sm opacity-90">Get paid instantly</div>
              </div>
            </div>
            <div className="ml-4">
              <svg width="24" height="24" fill="none"><path d="M17 7L7 17M7 17H17M7 17V7" stroke="white" strokeWidth="2" strokeLinecap="round"/></svg>
            </div>
          </button>
        </div>
        <div className="flex justify-between items-center mb-4">
          <div className={darkMode ? "text-white text-xl font-semibold" : "text-gray-900 text-xl font-semibold"}>Recent Activity</div>
          <button onClick={() => navigate("/history")} className={darkMode ? "text-[#3AC7B1] text-base font-medium cursor-pointer hover:underline" : "text-blue-600 text-base font-medium cursor-pointer hover:underline"}>See All</button>
        </div>
        <div className="space-y-4">
          {randomAmounts.map((item, idx) => (
            <div key={idx} className={darkMode ? "bg-[#1A233A] rounded-2xl flex items-center justify-between px-6 py-4" : "bg-white rounded-2xl flex items-center justify-between px-6 py-4"}>
              <div className="flex items-center">
                <div className={darkMode ? "bg-[#2C3A6A] rounded-full p-2 mr-4" : "bg-blue-100 rounded-full p-2 mr-4"}>
                  <svg width="20" height="20" fill="none"><path d="M5 15L15 5M15 5H5M15 5V15" stroke={darkMode ? "#A3B1CC" : "#1e40af"} strokeWidth="2" strokeLinecap="round"/></svg>
                </div>
                <div>
                  <div className={darkMode ? "text-white font-medium" : "text-gray-900 font-medium"}>Merchant Store QR</div>
                  <div className={darkMode ? "text-[#A3B1CC] text-xs" : "text-gray-500 text-xs"}>{item.time}</div>
                </div>
              </div>
              <div className={darkMode ? "text-[#A3B1CC] text-lg font-bold" : "text-gray-600 text-lg font-bold"}>{item.amount}</div>
            </div>
          ))}
        </div>
      </div>
      <div className={darkMode ? "flex justify-between items-center mt-8 bg-[#181F32] rounded-3xl px-4 py-2" : "flex justify-between items-center mt-8 bg-white rounded-3xl px-4 py-2 border border-gray-200"}>
        <button onClick={() => navigate("/")} className="flex flex-col items-center hover:opacity-80 transition-opacity">
          <svg width="28" height="28" fill="none" viewBox="0 0 24 24"><path d="M3 12l9-9 9 9M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" stroke="#3AC7B1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          <span className="text-[#3AC7B1] text-xs mt-1">Home</span>
        </button>
        <button onClick={() => navigate("/scan")} className="flex flex-col items-center hover:opacity-80 transition-opacity">
          <svg width="28" height="28" fill="none" viewBox="0 0 24 24"><rect x="3" y="3" width="8" height="8" rx="1" stroke={darkMode ? "#A3B1CC" : "#6b7280"} strokeWidth="2"/><rect x="13" y="3" width="8" height="8" rx="1" stroke={darkMode ? "#A3B1CC" : "#6b7280"} strokeWidth="2"/><rect x="3" y="13" width="8" height="8" rx="1" stroke={darkMode ? "#A3B1CC" : "#6b7280"} strokeWidth="2"/><rect x="13" y="13" width="8" height="8" rx="1" stroke={darkMode ? "#A3B1CC" : "#6b7280"} strokeWidth="2"/><circle cx="7" cy="7" r="1" fill={darkMode ? "#A3B1CC" : "#6b7280"}/><circle cx="17" cy="7" r="1" fill={darkMode ? "#A3B1CC" : "#6b7280"}/><circle cx="7" cy="17" r="1" fill={darkMode ? "#A3B1CC" : "#6b7280"}/><circle cx="17" cy="17" r="1" fill={darkMode ? "#A3B1CC" : "#6b7280"}/></svg>
          <span className={darkMode ? "text-[#A3B1CC] text-xs mt-1" : "text-gray-600 text-xs mt-1"}>Scan</span>
        </button>
        <button onClick={() => navigate("/history")} className="flex flex-col items-center hover:opacity-80 transition-opacity">
          <svg width="28" height="28" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" stroke={darkMode ? "#A3B1CC" : "#6b7280"} strokeWidth="2"/><path d="M12 6v6l4 2" stroke={darkMode ? "#A3B1CC" : "#6b7280"} strokeWidth="2" strokeLinecap="round"/></svg>
          <span className={darkMode ? "text-[#A3B1CC] text-xs mt-1" : "text-gray-600 text-xs mt-1"}>History</span>
        </button>
        <button onClick={() => navigate("/profile")} className="flex flex-col items-center hover:opacity-80 transition-opacity">
          <svg width="28" height="28" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="8" r="4" stroke={darkMode ? "#A3B1CC" : "#6b7280"} strokeWidth="2"/><path d="M6 20c0-3.314 2.686-6 6-6s6 2.686 6 6" stroke={darkMode ? "#A3B1CC" : "#6b7280"} strokeWidth="2" strokeLinecap="round"/></svg>
          <span className={darkMode ? "text-[#A3B1CC] text-xs mt-1" : "text-gray-600 text-xs mt-1"}>Profile</span>
        </button>
      </div>
    </div>
  );
}
