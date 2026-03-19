"use client";

import { useState } from "react";
import { Search, Bell, CalendarDays } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";

const CalendarPanel = dynamic(() => import("./CalendarPanel"), { ssr: false });

export default function Header() {
  const [calOpen, setCalOpen] = useState(false);

  return (
    <>
      <header className="h-[60px] bg-white border-b border-gray-100 flex items-center justify-between sticky top-0 z-50 shrink-0">
        <div className="flex-1 max-w-lg mx-6 relative ml-6">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[16px] h-[16px] text-gray-400" />
          <input
            type="text"
            placeholder="Search anything in CASFOS..."
            className="w-full h-9 bg-white border border-gray-200 rounded-full pl-[38px] pr-4 text-[13px] font-medium focus:outline-none focus:border-[#163e27] focus:ring-1 focus:ring-[#163e27] transition-all placeholder:text-gray-400 shadow-[0_2px_10px_rgba(0,0,0,0.01)]"
          />
        </div>

        <div className="flex items-center gap-2 pr-6 ml-auto border-l border-gray-100 h-full pl-5">
          {/* Calendar icon */}
          <button
            onClick={() => setCalOpen(true)}
            title="Course Calendar"
            className="relative p-1.5 text-gray-500 hover:text-[#163e27] hover:bg-[#f0f8f3] rounded-lg transition-all"
          >
            <CalendarDays className="w-4 h-4" />
          </button>

          {/* Bell icon */}
          <button className="relative p-1.5 text-gray-500 hover:text-gray-900 transition-colors">
            <Bell className="w-4 h-4" />
            <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 border-2 border-white rounded-full"></span>
          </button>
        </div>
      </header>

      {/* Calendar overlay */}
      <AnimatePresence>
        {calOpen && <CalendarPanel onClose={() => setCalOpen(false)} />}
      </AnimatePresence>
    </>
  );
}
