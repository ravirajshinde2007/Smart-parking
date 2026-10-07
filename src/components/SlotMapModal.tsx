"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ParkingLot, ParkingSlot } from "@/types";
import { X, Car, Bike, Zap, Check, AlertCircle, RefreshCw } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface SlotMapModalProps {
  lot: ParkingLot | null;
  onClose: () => void;
  onSelectSlot: (slot: ParkingSlot) => void;
}

export const SlotMapModal: React.FC<SlotMapModalProps> = ({ lot, onClose, onSelectSlot }) => {
  const [slots, setSlots] = useState<ParkingSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [vehicleFilter, setVehicleFilter] = useState<"ALL" | "CAR" | "BIKE" | "EV">("ALL");

  useEffect(() => {
    if (!lot) return;

    const fetchSlots = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`/api/parking/${lot.id}/slots`);
        if (!res.ok) throw new Error("Failed to load slots");
        const data = await res.json();
        setSlots(data.slots || []);
      } catch (err: any) {
        setError(err.message || "Failed to load parking slots");
      } finally {
        setLoading(false);
      }
    };

    fetchSlots();
  }, [lot]);

  if (!lot) return null;

  const filteredSlots = slots.filter((s) => {
    if (vehicleFilter === "ALL") return true;
    return s.vehicleType === vehicleFilter || s.vehicleType === "ANY";
  });

  const vacantCount = slots.filter((s) => s.slotStatus === "VACANT").length;
  const reservedCount = slots.filter((s) => s.slotStatus === "RESERVED").length;
  const occupiedCount = slots.filter((s) => s.slotStatus === "OCCUPIED").length;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-md"
        />

        {/* Modal Box */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-3xl border border-white/10 bg-slate-900 p-5 sm:p-8 shadow-2xl flex flex-col z-10"
        >
          {/* Header */}
          <div className="flex items-start justify-between border-b border-white/10 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-bold text-emerald-400 border border-emerald-500/20">
                  Live 2D Bay Visualizer
                </span>
                <span className="text-xs text-slate-400 font-medium">{lot.city}</span>
              </div>
              <h2 className="mt-1 text-xl sm:text-2xl font-black text-white">{lot.name}</h2>
              <p className="text-xs text-slate-400">
                Rate: <strong className="text-emerald-400">{formatCurrency(lot.rate)}/hr</strong> • Click an available slot to book
              </p>
            </div>

            <button
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Vehicle Type Filters & Status Legend */}
          <div className="my-4 flex flex-wrap items-center justify-between gap-3 text-xs">
            {/* Filter pills */}
            <div className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-slate-950/60 p-1">
              <button
                onClick={() => setVehicleFilter("ALL")}
                className={`rounded-lg px-2.5 py-1 font-semibold transition-all ${
                  vehicleFilter === "ALL" ? "bg-white/15 text-white" : "text-slate-400 hover:text-white"
                }`}
              >
                All Bays ({slots.length})
              </button>
              <button
                onClick={() => setVehicleFilter("CAR")}
                className={`flex items-center gap-1 rounded-lg px-2.5 py-1 font-semibold transition-all ${
                  vehicleFilter === "CAR" ? "bg-white/15 text-white" : "text-slate-400 hover:text-white"
                }`}
              >
                <Car className="h-3 w-3" /> Cars
              </button>
              <button
                onClick={() => setVehicleFilter("BIKE")}
                className={`flex items-center gap-1 rounded-lg px-2.5 py-1 font-semibold transition-all ${
                  vehicleFilter === "BIKE" ? "bg-white/15 text-white" : "text-slate-400 hover:text-white"
                }`}
              >
                <Bike className="h-3 w-3" /> Bikes
              </button>
              <button
                onClick={() => setVehicleFilter("EV")}
                className={`flex items-center gap-1 rounded-lg px-2.5 py-1 font-semibold transition-all ${
                  vehicleFilter === "EV" ? "bg-emerald-500/20 text-emerald-400" : "text-slate-400 hover:text-white"
                }`}
              >
                <Zap className="h-3 w-3" /> EV Charging
              </button>
            </div>

            {/* Legend tags */}
            <div className="flex items-center gap-3 text-[11px] font-medium text-slate-400">
              <span className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-md bg-emerald-500 shadow-sm shadow-emerald-500/50" />
                Vacant ({vacantCount})
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-md bg-amber-500" />
                Reserved ({reservedCount})
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-md bg-rose-500" />
                Occupied ({occupiedCount})
              </span>
            </div>
          </div>

          {/* Grid Area */}
          <div className="flex-1 overflow-y-auto pr-1">
            {loading ? (
              <div className="flex h-64 flex-col items-center justify-center gap-3 text-slate-400">
                <RefreshCw className="h-8 w-8 animate-spin text-emerald-400" />
                <p className="text-xs font-medium">Synchronizing live slot sensors from TiDB Cloud...</p>
              </div>
            ) : error ? (
              <div className="flex h-64 items-center justify-center text-rose-400 gap-2">
                <AlertCircle className="h-5 w-5" />
                <p className="text-xs">{error}</p>
              </div>
            ) : (
              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2.5 py-2">
                {filteredSlots.map((slot) => {
                  const isVacant = slot.slotStatus === "VACANT";
                  const isReserved = slot.slotStatus === "RESERVED";
                  const isOccupied = slot.slotStatus === "OCCUPIED";

                  return (
                    <motion.button
                      key={slot.id}
                      whileHover={isVacant ? { scale: 1.06, y: -2 } : {}}
                      whileTap={isVacant ? { scale: 0.95 } : {}}
                      disabled={!isVacant}
                      onClick={() => onSelectSlot(slot)}
                      className={`relative flex flex-col items-center justify-center rounded-2xl p-3 border transition-all ${
                        isVacant
                          ? "cursor-pointer border-emerald-500/40 bg-emerald-500/10 text-emerald-300 shadow-md shadow-emerald-500/10 hover:border-emerald-400 hover:bg-emerald-500/25 hover:shadow-emerald-500/30"
                          : isReserved
                          ? "cursor-not-allowed border-amber-500/30 bg-amber-500/5 text-amber-400/80 opacity-70"
                          : isOccupied
                          ? "cursor-not-allowed border-rose-500/30 bg-rose-500/5 text-rose-400/80 opacity-70"
                          : "cursor-not-allowed border-white/5 bg-slate-950/40 text-slate-600 opacity-40"
                      }`}
                    >
                      <span className="text-xs font-black tracking-wider">{slot.slotCode}</span>
                      <span className="mt-1 text-[9px] font-semibold tracking-tight uppercase">
                        {slot.slotStatus}
                      </span>

                      {/* Icon for vehicle/EV */}
                      {slot.vehicleType === "EV" && (
                        <Zap className="absolute top-1.5 right-1.5 h-2.5 w-2.5 text-emerald-400" />
                      )}
                      {slot.vehicleType === "BIKE" && (
                        <Bike className="absolute top-1.5 right-1.5 h-2.5 w-2.5 text-slate-400" />
                      )}
                    </motion.button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer notice */}
          <div className="mt-4 border-t border-white/10 pt-3 text-center text-[11px] text-slate-400">
            Protected by Cloud Double-Booking Locks • Real-time OCR Gate verification on arrival
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
