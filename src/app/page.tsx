"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, TreePine } from "lucide-react";

export default function Splash() {
  return (
    <div 
      className="min-h-screen flex flex-col items-center relative overflow-hidden font-sans bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('/mountain_forest_bg.jpg')" }}
    >
      {/* Dark overlay to make text readable over the misty forest */}
      <div className="absolute inset-0 bg-black/40 z-0 pointer-events-none" />
      
      {/* Top Navbar */}
      <nav className="w-full absolute top-0 left-0 px-8 py-6 flex justify-between items-center z-50">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 flex items-center justify-center bg-white/20 backdrop-blur-md rounded-md shadow-sm border border-white/20">
            <img 
              src="https://upload.wikimedia.org/wikipedia/commons/5/55/Emblem_of_India.svg" 
              alt="Emblem of India" 
              className="w-[18px] opacity-100" 
              style={{ filter: 'brightness(0) invert(1)' }}
            />
          </div>
          <div className="flex items-baseline gap-2.5 mt-0.5">
            <span className="font-bold text-[20px] tracking-widest text-white serif-font drop-shadow-md">
              CASFOS
            </span>
            <span className="text-[11px] text-white/70 font-bold tracking-widest uppercase drop-shadow-md">
              Est. 1984
            </span>
          </div>
        </div>

        <Link href="/login" className="group flex items-center gap-3 bg-white hover:bg-gray-100 text-[#163e27] px-5 py-3 rounded-full text-[13px] font-bold transition-all shadow-lg hover:shadow-xl">
          <img 
            src="https://upload.wikimedia.org/wikipedia/commons/5/55/Emblem_of_India.svg" 
            alt="Emblem of India" 
            className="w-[18px] opacity-100" 
          />
          Proceed to Login
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </nav>

      {/* Main Content */}
      <main className="flex-1 w-full flex flex-col items-center justify-center relative z-10 px-6 text-center">
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="flex flex-col items-center w-full max-w-[900px] z-20 relative px-4 py-10 rounded-2xl backdrop-blur-sm bg-black/10 border border-white/10 shadow-2xl"
        >
           <span className="text-[10px] sm:text-[11px] font-bold text-gray-300 tracking-[0.2em] uppercase mb-4 drop-shadow-md">
            Government of India &bull; Ministry of Environment, Forest and Climate Change
          </span>
          
          <h1 className="text-[40px] md:text-[54px] leading-[1.1] font-bold text-white serif-font max-w-[800px] mb-6 tracking-tight drop-shadow-xl">
            Central Academy for <br/> State Forest Service
          </h1>

          <div className="h-[1px] w-16 bg-white/30 mb-6" />

          <p className="text-[12px] font-bold text-white tracking-widest uppercase mb-3 text-center max-w-[600px] leading-relaxed drop-shadow-md">
            An institution of national importance for forest service training
          </p>
          <p className="text-[15px] text-gray-200 max-w-[640px] text-center leading-relaxed drop-shadow-md">
            Empowering India's forest leadership with secure, structured and future-ready digital training infrastructure.
          </p>
        </motion.div>
      </main>
      
      {/* Decorative Bottom Fade */}
      <div className="absolute bottom-0 left-0 w-full h-40 bg-gradient-to-t from-black/60 via-black/20 to-transparent pointer-events-none z-20" />

    </div>
  );
}
