import React from "react";
import { useEffect } from "react";
import { CheckCircle } from "lucide-react";
import { useNavigate, useLocation } from "react-router";

export function MoneyAdded(): React.ReactNode {
  const navigate = useNavigate();
  const location = useLocation();
  const amount = location.state?.amount || "0";

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/");
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="h-full bg-gradient-to-br from-[#3AC7B1] to-[#2a9f8f] flex flex-col items-center justify-center p-6 overflow-hidden">
      <div className="bg-white/20 p-6 rounded-full mb-6">
        <CheckCircle className="w-24 h-24 text-white" />
      </div>
      
      <h2 className="text-white text-2xl mb-4">Money Added Successfully!</h2>
      
      <div className="bg-white/20 backdrop-blur-md rounded-2xl p-6 w-full max-w-sm text-center">
        <p className="text-white/80 text-sm mb-2">Amount Added</p>
        <p className="text-white text-4xl">€{amount}</p>
      </div>
      
      <p className="text-white text-sm mt-6 opacity-80">Redirecting to home...</p>
    </div>
  );
}
