"use client";

import React, { useState, useEffect } from "react";
import { Payment } from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import { CreditCard, CheckCircle2, Clock, AlertCircle, RefreshCw } from "lucide-react";

interface PaymentsViewProps {
  token: string | null;
  onRequireAuth: () => void;
}

export const PaymentsView: React.FC<PaymentsViewProps> = ({ token, onRequireAuth }) => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchPayments = async () => {
    if (!token) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/payments", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to load payment history");
      const data = await res.json();
      setPayments(data);
    } catch (err: any) {
      setError(err.message || "Could not load payments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchPayments();
    else setLoading(false);
  }, [token]);

  if (!token) {
    return (
      <div className="mx-auto max-w-lg py-16 text-center">
        <CreditCard className="mx-auto h-12 w-12 text-slate-500" />
        <h3 className="mt-4 text-xl font-bold text-white">Sign In to View Payments</h3>
        <p className="mt-2 text-xs text-slate-400">
          Track transaction IDs, payment receipts, and billing summaries.
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

  const totalSpent = payments
    .filter((p) => p.status === "PAID")
    .reduce((sum, p) => sum + Number(p.amount), 0);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div>
          <h2 className="text-2xl font-black text-white">Billing & Payments</h2>
          <p className="text-xs text-slate-400">
            Total lifetime spent: <strong className="text-emerald-400">{formatCurrency(totalSpent)}</strong>
          </p>
        </div>
        <button
          onClick={fetchPayments}
          className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-slate-900 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh</span>
        </button>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center text-slate-400 gap-2">
          <RefreshCw className="h-6 w-6 animate-spin text-emerald-400" />
          <span className="text-xs">Loading payment transactions...</span>
        </div>
      ) : error ? (
        <div className="my-8 rounded-2xl border border-rose-500/20 bg-rose-500/10 p-4 text-xs text-rose-300 flex items-center gap-2">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      ) : payments.length === 0 ? (
        <div className="my-16 text-center text-slate-400 text-xs">
          No payment transactions found.
        </div>
      ) : (
        <div className="mt-6 overflow-hidden rounded-2xl border border-white/10 bg-slate-900/60 shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-white/10 bg-slate-950/60 text-slate-400 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-4 py-3">Transaction ID</th>
                  <th className="px-4 py-3">Booking Code</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Method</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-300">
                {payments.map((p) => (
                  <tr key={p.id} className="hover:bg-white/5">
                    <td className="px-4 py-3 font-mono text-[11px] text-slate-300">
                      {p.transactionId}
                    </td>
                    <td className="px-4 py-3 font-bold text-emerald-400">
                      {p.bookingCode}
                    </td>
                    <td className="px-4 py-3 font-bold text-white">
                      {formatCurrency(p.amount)}
                    </td>
                    <td className="px-4 py-3 text-slate-400">
                      {p.paymentMethod || "UPI / Card"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          p.status === "PAID"
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                        }`}
                      >
                        {p.status === "PAID" ? <CheckCircle2 className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                        {p.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-400">{formatDate(p.paidAt || p.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
