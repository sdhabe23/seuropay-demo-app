import React from "react";
import { Outlet } from "react-router";

// Detect if running as an installed PWA (standalone/fullscreen) or on a mobile browser
const isPWA =
  window.matchMedia("(display-mode: fullscreen)").matches ||
  window.matchMedia("(display-mode: standalone)").matches ||
  (window.navigator as Navigator & { standalone?: boolean }).standalone === true;

const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

export function RootLayout(): React.ReactNode {
  // On mobile browser or installed PWA: render full screen with no fake frame
  if (isPWA || isMobile) {
    return (
      <div className="h-screen w-screen overflow-hidden">
        <Outlet />
      </div>
    );
  }

  // On desktop browser: show the phone frame preview
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
