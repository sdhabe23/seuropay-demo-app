import React from "react";
import { useState } from "react";
import { ArrowLeft, QrCode, Nfc, Search, User } from "lucide-react";
import { useNavigate, useLocation } from "react-router";
import { useTheme } from "../context/ThemeContext";

export function SelectRecipient(): React.ReactNode {
  const navigate = useNavigate();
  const location = useLocation();
  const { darkMode } = useTheme();
  const amount = location.state?.amount || "0";
  const description = location.state?.description || "";
  const fromContact = location.state?.fromContact || false;
  const [searchQuery, setSearchQuery] = useState("");

  // Mock contact list
  const contacts = [
    { id: 1, name: "Angelika Dhabe", phone: "+372 501 2341", avatar: "AD" },
    { id: 2, name: "Eve Tõnissoo", phone: "+372 502 5678", avatar: "ET" },
    { id: 3, name: "Aadu Raudsepp", phone: "+372 503 9012", avatar: "AR" },
    { id: 4, name: "Swapnil Kasar", phone: "+372 504 3456", avatar: "SK" },
    { id: 5, name: "Vishal Jotshi", phone: "+372 505 7890", avatar: "VJ" },
  ];

  const filteredContacts = contacts.filter(
    (contact) =>
      contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.phone.includes(searchQuery)
  );

  const handleContactSelect = (contact: typeof contacts[0]) => {
    navigate("/payment-confirm", { state: { amount, contact, description, fromContact } });
  };

  return (
    <div className={darkMode ? "h-full bg-[#10192B] flex flex-col overflow-hidden" : "h-full bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col overflow-hidden"}>
      {/* Header */}
      <div className={darkMode ? "bg-[#181F32] text-white px-6 pt-8 pb-6 shadow-lg flex-shrink-0" : "bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-6 pt-8 pb-6 shadow-lg flex-shrink-0"}>
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate(fromContact ? "/payment-contact" : "/send")}
            className={darkMode ? "p-2 hover:bg-white/20 rounded-xl transition-colors" : "p-2 hover:bg-white/30 rounded-xl transition-colors"}
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl">Select Recipient</h1>
        </div>

        {/* Amount Display */}
        <div className={darkMode ? "bg-[#1A233A] rounded-2xl p-4 text-center" : "bg-white/20 rounded-2xl p-4 text-center"}>
          <p className={darkMode ? "text-[#A3B1CC] text-sm mb-1" : "text-white/80 text-sm mb-1"}>Sending</p>
          <p className={darkMode ? "text-white text-3xl" : "text-white text-3xl"}>€{amount}</p>
          {description && <p className={darkMode ? "text-[#A3B1CC] text-xs mt-2" : "text-white/80 text-xs mt-2"}>{description}</p>}
        </div>
      </div>

      <div className="flex-1 p-6 overflow-hidden flex flex-col">
        {/* Quick Send Options */}
        {!fromContact && (
          <div className="grid grid-cols-2 gap-4 mb-6 flex-shrink-0">
            <button
              onClick={() => navigate("/payment", { state: { amount } })}
              className={darkMode ? "bg-[#181F32] rounded-2xl shadow-md p-6 hover:shadow-lg transition-all active:scale-95 flex flex-col items-center gap-3" : "bg-white rounded-2xl shadow-md p-6 hover:shadow-lg transition-all active:scale-95 flex flex-col items-center gap-3"}
            >
              <div className="bg-[#3AC7B1] p-4 rounded-full">
                <QrCode className={darkMode ? "w-8 h-8 text-[#10192B]" : "w-8 h-8 text-white"} />
              </div>
              <span className={darkMode ? "text-white" : "text-gray-900"}>Send via QR</span>
            </button>

            <button
              onClick={() => navigate("/payment", { state: { amount, method: "nfc" } })}
              className={darkMode ? "bg-[#181F32] rounded-2xl shadow-md p-6 hover:shadow-lg transition-all active:scale-95 flex flex-col items-center gap-3" : "bg-white rounded-2xl shadow-md p-6 hover:shadow-lg transition-all active:scale-95 flex flex-col items-center gap-3"}
            >
              <div className={darkMode ? "bg-[#6C7A9C] p-4 rounded-full" : "bg-blue-500 p-4 rounded-full"}>
                <Nfc className="w-8 h-8 text-white" />
              </div>
              <span className={darkMode ? "text-white" : "text-gray-900"}>Send via NFC</span>
            </button>
          </div>
        )}

        {/* Contact List Section */}
        <div className={darkMode ? "bg-[#181F32] rounded-2xl shadow-md overflow-hidden flex-1 min-h-0 flex flex-col" : "bg-white rounded-2xl shadow-md overflow-hidden flex-1 min-h-0 flex flex-col"}>
          {/* Search Bar */}
          <div className={darkMode ? "p-4 border-b border-[#2C3A6A] flex-shrink-0" : "p-4 border-b border-gray-200 flex-shrink-0"}>
            <div className="relative">
              <Search className={darkMode ? "absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#A3B1CC]" : "absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"} />
              <input
                type="text"
                placeholder="Search contacts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={darkMode ? "w-full pl-10 pr-4 py-3 bg-[#1A233A] rounded-xl border-none text-white placeholder-[#A3B1CC] focus:outline-none focus:ring-2 focus:ring-[#3AC7B1]" : "w-full pl-10 pr-4 py-3 bg-gray-50 rounded-xl border-none text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600"}
              />
            </div>
          </div>

          {/* Contacts List */}
          <div className="flex-1 overflow-y-auto">
            {filteredContacts.length > 0 ? (
              filteredContacts.map((contact) => (
                <button
                  key={contact.id}
                  onClick={() => handleContactSelect(contact)}
                  className={darkMode ? "w-full p-4 hover:bg-[#1A233A] transition-colors flex items-center gap-4 border-b border-[#2C3A6A] last:border-b-0" : "w-full p-4 hover:bg-gray-50 transition-colors flex items-center gap-4 border-b border-gray-100 last:border-b-0"}
                >
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#3AC7B1] to-[#6C7A9C] flex items-center justify-center text-white text-sm flex-shrink-0">
                    {contact.avatar}
                  </div>
                  <div className="text-left">
                    <p className={darkMode ? "text-white" : "text-gray-900"}>{contact.name}</p>
                    <p className={darkMode ? "text-sm text-[#A3B1CC]" : "text-sm text-gray-500"}>{contact.phone}</p>
                  </div>
                </button>
              ))
            ) : (
              <div className={darkMode ? "p-8 text-center text-[#A3B1CC]" : "p-8 text-center text-gray-400"}>
                No contacts found
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
