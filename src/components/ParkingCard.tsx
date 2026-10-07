"use client";

import React from "react";
import { motion } from "framer-motion";
import { ParkingLot } from "@/types";
import { MapPin, Navigation, Eye, CheckCircle2, ShieldAlert } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface ParkingCardProps {
  lot: ParkingLot;
  onSelectLot: (lot: ParkingLot) => void;
}

export const ParkingCard: React.FC<ParkingCardProps> = ({ lot, onSelectLot }) => {
  const vacant = lot.vacant ?? 0;
  const total = lot.capacity || lot.totalSlots || 50;
  const occupancyPercent = Math.min(100, Math.round(((total - vacant) / total) * 100));

  const isLimited = vacant > 0 && vacant <= 5;
  const isFull = vacant === 0;

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="glass-panel glass-panel-hover group flex flex-col justify-between overflow-hidden rounded-3xl p-5"
    >
      <div>
        {/* Header Badges */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] text-slate-300">
            <MapPin className="h-3 w-3 text-emerald-400" />
            <span className="font-medium">{lot.city}</span>
          </div>

          <div
            className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${
              isFull
                ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                : isLimited
                ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
            }`}
          >
            {isFull ? "Lot Full" : isLimited ? `Only ${vacant} Left` : `${vacant} Available`}
          </div>
        </div>

        {/* Title & Location */}
        <h3 className="mt-3.5 text-lg font-bold text-white transition-colors group-hover:text-emerald-300">
          {lot.name}
        </h3>
        <p className="mt-1 flex items-center gap-1 text-xs text-slate-400">
          <Navigation className="h-3 w-3 shrink-0 text-slate-500" />
          <span>{lot.area}{lot.locality ? `, ${lot.locality}` : ""}</span>
        </p>

        {/* Occupancy Indicator Bar */}
        <div className="mt-5 space-y-1.5">
          <div className="flex justify-between text-[11px] font-medium text-slate-400">
            <span>Slot Availability</span>
            <span className={isFull ? "text-rose-400" : "text-emerald-400"}>
              {vacant} of {total} slots vacant
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${occupancyPercent}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className={`h-full rounded-full ${
                isFull
                  ? "bg-rose-500"
                  : occupancyPercent > 80
                  ? "bg-amber-500"
                  : "bg-gradient-to-r from-emerald-500 to-teal-400"
              }`}
            />
          </div>
        </div>
      </div>

      {/* Footer & Action */}
      <div className="mt-6 flex items-center justify-between border-t border-white/5 pt-4">
        <div>
          <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold block">
            Parking Fee
          </span>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-extrabold text-white">{formatCurrency(lot.rate)}</span>
            <span className="text-xs text-slate-400 font-medium">/ hr</span>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onSelectLot(lot)}
          className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 px-4 py-2 text-xs font-bold text-slate-950 shadow-md shadow-emerald-500/20 hover:brightness-110"
        >
          <Eye className="h-3.5 w-3.5" />
          <span>Select Slot</span>
        </motion.button>
      </div>
    </motion.div>
  );
};
