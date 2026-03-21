import React from "react";
import { Outlet } from "react-router";

export function RootLayout(): React.ReactNode {
  return (
    <>
      {/* Desktop / tablet: phone frame centred on dark background */}
      <div className="hidden sm:flex min-h-screen bg-gray-900 items-center justify-center p-4">
        <div className="w-full max-w-[400px] h-[844px] bg-white rounded-[3rem] shadow-2xl overflow-hidden relative">
          {/* Phone notch */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-7 bg-black rounded-b-3xl z-50" />
          {/* App content */}
          <div className="h-full overflow-hidden">
            <Outlet />
          </div>
        </div>
      </div>

      {/* Mobile: true full-screen, fits any phone */}
      <div className="flex sm:hidden w-screen h-[100dvh] overflow-hidden">
        <div className="w-full h-full overflow-hidden">
          <Outlet />
        </div>
      </div>
    </>
  );
}
