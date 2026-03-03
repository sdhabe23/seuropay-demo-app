import React from "react";
import { Outlet } from "react-router";

export function RootLayout(): React.ReactNode {
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-[400px] h-[844px] bg-white rounded-[3rem] shadow-2xl overflow-hidden relative">
        {/* Phone notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-7 bg-black rounded-b-3xl z-50"></div>
        
        {/* App content */}
        <div className="h-full overflow-hidden">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
