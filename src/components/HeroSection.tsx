"use client";

import React from "react";
import { motion } from "framer-motion";
import { Search, Sparkles, MapPin, Zap, ShieldCheck } from "lucide-react";

interface HeroSectionProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedCity: string;
  setSelectedCity: (c: string) => void;
  cities: string[];
  totalSlots: number;
  vacantSlots: number;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  searchQuery,
  setSearchQuery,
  selectedCity,
  setSelectedCity,
  cities,
  totalSlots,
  vacantSlots,
}) => {
  return (
    <div className="relative overflow-hidden pt-8 pb-12 sm:pt-14 sm:pb-16">
      {/* 21st.dev background radial glow */}
      <div className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-gradient-to-b from-emerald-500/15 via-teal-500/5 to-transparent blur-3xl" />

      <div className="mx-auto max-w-5xl px-4 text-center sm:px-6">
        {/* Top announcement pill */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1 text-xs font-semibold text-emerald-400 shadow-sm"
        >
          <Sparkles className="h-3.5 w-3.5 animate-pulse" />
          <span>Next-Gen Smart Parking System • Live TiDB Cloud</span>
        </motion.div>

        {/* Hero headline */}
        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mt-6 text-3xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl"
        >
          Find & Reserve Your Parking Space{" "}
          <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
            In Seconds
          </span>
        </motion.h1>

        {/* Hero Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mx-auto mt-4 max-w-2xl text-sm text-slate-300 sm:text-base"
        >
          Real-time slot availability, double-booking prevention, automated cloud license plate OCR,
          and instant digital gate access across premier mall and metro hubs.
        </motion.p>

        {/* Interactive Search Bar (21st.dev style glass glowing bar) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mx-auto mt-8 max-w-2xl"
        >
          <div className="relative flex items-center rounded-2xl border border-white/15 bg-slate-900/90 p-2 shadow-2xl backdrop-blur-xl focus-within:border-emerald-500/50 focus-within:ring-2 focus-within:ring-emerald-500/20">
            <Search className="ml-3 h-5 w-5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by parking mall, area, or road..."
              className="w-full bg-transparent px-3 py-2 text-sm text-white placeholder-slate-400 focus:outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="mr-2 rounded-lg bg-white/10 px-2 py-1 text-xs text-slate-400 hover:text-white"
              >
                Clear
              </button>
            )}
          </div>

          {/* City Quick Filter Pills */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-1.5">
            <span className="text-xs text-slate-400 font-medium mr-1 flex items-center gap-1">
              <MapPin className="h-3 w-3" /> Quick Cities:
            </span>
            {["All", ...cities].map((city) => (
              <button
                key={city}
                onClick={() => setSelectedCity(city)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-all ${
                  selectedCity === city
                    ? "bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/25"
                    : "bg-white/5 text-slate-300 border border-white/5 hover:bg-white/10 hover:text-white"
                }`}
              >
                {city}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Live Metrics Row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-10 grid grid-cols-3 gap-3 sm:gap-6 max-w-xl mx-auto"
        >
          <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-3.5 backdrop-blur-md">
            <div className="flex items-center justify-center gap-1.5 text-emerald-400">
              <Zap className="h-4 w-4" />
              <span className="text-lg font-black sm:text-2xl">{vacantSlots}</span>
            </div>
            <p className="mt-1 text-[11px] font-medium text-slate-400">Live Vacant Slots</p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-3.5 backdrop-blur-md">
            <div className="flex items-center justify-center gap-1.5 text-cyan-400">
              <MapPin className="h-4 w-4" />
              <span className="text-lg font-black sm:text-2xl">{cities.length || 5}</span>
            </div>
            <p className="mt-1 text-[11px] font-medium text-slate-400">Active Cities</p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-3.5 backdrop-blur-md">
            <div className="flex items-center justify-center gap-1.5 text-teal-400">
              <ShieldCheck className="h-4 w-4" />
              <span className="text-lg font-black sm:text-2xl">100%</span>
            </div>
            <p className="mt-1 text-[11px] font-medium text-slate-400">OCR & Lock Protected</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
