"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ParkingLot, ParkingSlot } from "@/types";
import { X, Car, Clock, ShieldCheck, CheckCircle2, AlertCircle, Sparkles } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface BookingModalProps {
  isOpen: boolean;
  lot: ParkingLot | null;
  slot: ParkingSlot | null;
  token: string | null;
  onClose: () => void;
  onSuccess: () => void;
  onRequireAuth: () => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  lot,
  slot,
  token,
  onClose,
  onSuccess,
  onRequireAuth,
}) => {
  const [vehicleType, setVehicleType] = useState("CAR");
  const [carType, setCarType] = useState("Sedan");
  const [carNumber, setCarNumber] = useState("");
  const [durationHours, setDurationHours] = useState(2);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successData, setSuccessData] = useState<any>(null);

  if (!isOpen || !lot || !slot) return null;

  const totalAmount = lot.rate * durationHours;

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      onRequireAuth();
      return;
    }

    if (!carNumber.trim()) {
      setError("Please enter your vehicle registration plate number.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          parkingLotId: lot.id,
          parkingSlotId: slot.id,
          vehicleType,
          carType,
          carNumber: carNumber.trim().toUpperCase(),
          durationHours,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to complete reservation");
      }

      setSuccessData(data.booking);



      onSuccess();
    } catch (err: any) {
      setError(err.message || "Could not reserve slot.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => {
            if (!loading) {
              setSuccessData(null);
              onClose();
            }
          }}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-md"
        />

        {/* Modal Content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-white/10 bg-slate-900 p-6 shadow-2xl z-10"
        >
          {/* Close button */}
          <button
            onClick={() => {
              setSuccessData(null);
              onClose();
            }}
            className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-xl text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>

          {successData ? (
            /* Success confirmation card */
            <div className="text-center py-4">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <h3 className="mt-4 text-2xl font-black text-white">Booking Confirmed!</h3>
              <p className="mt-1 text-xs text-slate-300">
                Your parking bay is reserved and locked in TiDB Cloud.
              </p>

              <div className="my-6 rounded-2xl border border-white/10 bg-slate-950/60 p-4 text-left space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Booking Code:</span>
                  <span className="font-bold text-emerald-400 tracking-wider">
                    {successData.bookingCode}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Assigned Slot:</span>
                  <span className="font-bold text-white">Bay {successData.slotCode}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Location:</span>
                  <span className="font-medium text-white">{lot.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Amount Paid:</span>
                  <span className="font-bold text-white">{formatCurrency(successData.amount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Transaction ID:</span>
                  <span className="font-mono text-[11px] text-slate-300">{successData.transactionId}</span>
                </div>
              </div>

              <button
                onClick={() => {
                  setSuccessData(null);
                  onClose();
                }}
                className="w-full rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 py-2.5 text-xs font-bold text-slate-950 shadow-lg shadow-emerald-500/20"
              >
                Go to Reservations
              </button>
            </div>
          ) : (
            /* Booking Form */
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-bold text-emerald-400 border border-emerald-500/20">
                  Bay {slot.slotCode}
                </span>
                <span className="text-xs text-slate-400 font-medium">{lot.name}</span>
              </div>
              <h3 className="mt-2 text-xl font-black text-white">Complete Your Reservation</h3>

              {error && (
                <div className="mt-3 flex items-center gap-2 rounded-xl border border-rose-500/20 bg-rose-500/10 p-2.5 text-xs text-rose-300">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleBooking} className="mt-4 space-y-4">
                {/* Vehicle Plate */}
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-300">
                    Vehicle License Plate Number <span className="text-emerald-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={carNumber}
                    onChange={(e) => setCarNumber(e.target.value.toUpperCase())}
                    placeholder="e.g. MH 15 AB 1234"
                    className="w-full rounded-xl border border-white/10 bg-slate-950/80 px-3.5 py-2 text-xs font-mono uppercase text-white placeholder-slate-500 tracking-wider focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
                  />
                  <p className="mt-1 text-[10px] text-slate-400">
                    Must match your physical plate for the gate camera OCR scanner.
                  </p>
                </div>

                {/* Vehicle Type & Model */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-300">Vehicle Type</label>
                    <select
                      value={vehicleType}
                      onChange={(e) => setVehicleType(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-slate-950/80 px-3 py-2 text-xs text-white focus:outline-none"
                    >
                      <option value="CAR">Car</option>
                      <option value="BIKE">Two Wheeler / Bike</option>
                      <option value="EV">Electric Vehicle (EV)</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-300">Vehicle Model</label>
                    <select
                      value={carType}
                      onChange={(e) => setCarType(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-slate-950/80 px-3 py-2 text-xs text-white focus:outline-none"
                    >
                      <option value="Sedan">Sedan</option>
                      <option value="SUV">Compact / Mid SUV</option>
                      <option value="Hatchback">Hatchback</option>
                      <option value="Luxury">Luxury / Large</option>
                    </select>
                  </div>
                </div>

                {/* Duration Slider */}
                <div>
                  <div className="flex justify-between text-xs font-medium text-slate-300 mb-1">
                    <span>Parking Duration</span>
                    <span className="font-bold text-emerald-400">{durationHours} Hours</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="12"
                    step="1"
                    value={durationHours}
                    onChange={(e) => setDurationHours(parseInt(e.target.value, 10))}
                    className="w-full accent-emerald-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 mt-0.5">
                    <span>1 hr</span>
                    <span>6 hrs</span>
                    <span>12 hrs</span>
                  </div>
                </div>

                {/* Cost Breakdown */}
                <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-3.5 space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>Hourly Rate:</span>
                    <span>{formatCurrency(lot.rate)} / hr</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Duration:</span>
                    <span>{durationHours} Hours</span>
                  </div>
                  <div className="border-t border-white/10 pt-1.5 flex justify-between font-bold text-white text-sm">
                    <span>Total Amount Payable:</span>
                    <span className="text-emerald-400 text-base">{formatCurrency(totalAmount)}</span>
                  </div>
                </div>

                {/* Submit button */}
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 py-3 text-xs font-bold text-slate-950 shadow-lg shadow-emerald-500/20 hover:brightness-110 disabled:opacity-50"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-slate-950 border-t-transparent" />
                      Securing Slot Lock in TiDB Cloud...
                    </span>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      <span>Confirm & Pay {formatCurrency(totalAmount)}</span>
                    </>
                  )}
                </motion.button>
              </form>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
