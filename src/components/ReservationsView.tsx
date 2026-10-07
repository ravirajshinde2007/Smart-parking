"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Booking } from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  Calendar,
  Clock,
  MapPin,
  Car,
  QrCode,
  XCircle,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

interface ReservationsViewProps {
  token: string | null;
  onRequireAuth: () => void;
  onExplore: () => void;
}

export const ReservationsView: React.FC<ReservationsViewProps> = ({
  token,
  onRequireAuth,
  onExplore,
}) => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedTicket, setSelectedTicket] = useState<Booking | null>(null);

  const fetchBookings = async () => {
    if (!token) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/bookings", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to load your reservations");
      const data = await res.json();
      setBookings(data);
    } catch (err: any) {
      setError(err.message || "Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchBookings();
    } else {
      setLoading(false);
    }
  }, [token]);

  const handleCancelBooking = async (id: number) => {
    if (!confirm("Are you sure you want to cancel this reservation? The slot will be released.")) {
      return;
    }

    try {
      const res = await fetch(`/api/bookings/${id}/cancel`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Cancellation failed");
      alert(data.message);
      fetchBookings();
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (!token) {
    return (
      <div className="mx-auto max-w-lg py-16 text-center">
        <Calendar className="mx-auto h-12 w-12 text-slate-500" />
        <h3 className="mt-4 text-xl font-bold text-white">Sign In to View Bookings</h3>
        <p className="mt-2 text-xs text-slate-400">
          Your active parking passes, QR digital keys, and reservation receipts will appear here.
        </p>
        <button
          onClick={onRequireAuth}
          className="mt-6 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 px-6 py-2.5 text-xs font-bold text-slate-950"
        >
          Sign In Now
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div>
          <h2 className="text-2xl font-black text-white">My Reservations</h2>
          <p className="text-xs text-slate-400">
            Digital parking passes, assigned bays, and gate check-in status
          </p>
        </div>
        <button
          onClick={fetchBookings}
          className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-slate-900 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh</span>
        </button>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center text-slate-400 gap-2">
          <RefreshCw className="h-6 w-6 animate-spin text-emerald-400" />
          <span className="text-xs">Loading reservations...</span>
        </div>
      ) : error ? (
        <div className="my-8 rounded-2xl border border-rose-500/20 bg-rose-500/10 p-4 text-xs text-rose-300 flex items-center gap-2">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      ) : bookings.length === 0 ? (
        <div className="my-16 text-center">
          <Car className="mx-auto h-12 w-12 text-slate-600" />
          <h3 className="mt-4 text-lg font-bold text-white">No Bookings Yet</h3>
          <p className="mt-1 text-xs text-slate-400">
            You do not have any active or previous parking reservations.
          </p>
          <button
            onClick={onExplore}
            className="mt-5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 px-5 py-2 text-xs font-bold text-slate-950"
          >
            Explore Parking Locations
          </button>
        </div>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {bookings.map((b) => {
            const isReserved = b.status === "RESERVED";
            const isParked = b.status === "PARKED";
            const isCompleted = b.status === "COMPLETED";

            return (
              <motion.div
                key={b.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-panel relative flex flex-col justify-between rounded-3xl p-5"
              >
                <div>
                  {/* Top Bar */}
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-mono text-[11px] font-bold text-emerald-400 tracking-wider">
                        {b.bookingCode}
                      </span>
                      <h4 className="mt-0.5 text-base font-bold text-white">{b.parkingName}</h4>
                    </div>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                        isReserved
                          ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                          : isParked
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : isCompleted
                          ? "bg-slate-500/10 text-slate-400 border border-slate-500/20"
                          : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                      }`}
                    >
                      {b.status}
                    </span>
                  </div>

                  {/* Bay Details Card */}
                  <div className="my-4 rounded-2xl border border-white/5 bg-slate-950/60 p-3 space-y-2 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Assigned Bay:</span>
                      <span className="rounded-md bg-emerald-500/10 px-2 py-0.5 font-black text-emerald-300 border border-emerald-500/20">
                        {b.slotCode || "Slot Assigned"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Vehicle:</span>
                      <span className="font-mono font-bold text-white tracking-wider">{b.carNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Model / Type:</span>
                      <span className="text-slate-300">{b.carType} ({b.vehicleType})</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Duration:</span>
                      <span className="text-slate-300">{b.durationHours} Hours</span>
                    </div>
                    <div className="flex justify-between border-t border-white/5 pt-1.5">
                      <span className="text-slate-400">Amount:</span>
                      <span className="font-bold text-white">{formatCurrency(b.amount)}</span>
                    </div>
                  </div>

                  <p className="text-[10px] text-slate-400">
                    Booked on: {formatDate(b.createdAt)}
                  </p>
                </div>

                {/* Actions */}
                <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-3">
                  <button
                    onClick={() => setSelectedTicket(b)}
                    className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 hover:text-emerald-300"
                  >
                    <QrCode className="h-4 w-4" />
                    <span>View Digital Pass</span>
                  </button>

                  {isReserved && (
                    <button
                      onClick={() => handleCancelBooking(b.id)}
                      className="text-xs font-medium text-rose-400 hover:text-rose-300"
                    >
                      Cancel Booking
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* QR Ticket Pass Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            onClick={() => setSelectedTicket(null)}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-md"
          />
          <div className="relative w-full max-w-sm rounded-3xl border border-white/10 bg-slate-900 p-6 shadow-2xl z-10 text-center">
            <div className="flex justify-between items-start mb-4">
              <span className="text-xs font-bold text-emerald-400">ParkSmart Gate Pass</span>
              <button onClick={() => setSelectedTicket(null)} className="text-slate-400 hover:text-white">
                <XCircle className="h-5 w-5" />
              </button>
            </div>

            {/* Simulated QR Code Graphic */}
            <div className="mx-auto flex h-44 w-44 items-center justify-center rounded-2xl border-2 border-dashed border-emerald-500/40 bg-slate-950 p-4">
              <div className="flex flex-col items-center gap-2">
                <QrCode className="h-28 w-28 text-emerald-400" />
                <span className="font-mono text-[10px] tracking-wider text-slate-400">
                  {selectedTicket.bookingCode}
                </span>
              </div>
            </div>

            <h4 className="mt-4 text-lg font-bold text-white">{selectedTicket.parkingName}</h4>
            <div className="mt-2 inline-block rounded-xl bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 text-sm font-black text-emerald-300">
              BAY {selectedTicket.slotCode}
            </div>

            <p className="mt-3 text-xs text-slate-300">
              Show this code or pull up to the boom barrier for automated OCR license plate scanning.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
