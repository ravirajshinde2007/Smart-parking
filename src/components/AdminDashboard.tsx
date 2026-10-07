"use client";

import React, { useState, useEffect } from "react";
import { AdminSummary } from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  Users,
  Building2,
  Layers,
  CalendarCheck,
  TrendingUp,
  AlertTriangle,
  RefreshCw,
  Search,
  CheckCircle,
  Clock,
  Car,
} from "lucide-react";

interface AdminDashboardProps {
  token: string | null;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ token }) => {
  const [summary, setSummary] = useState<AdminSummary | null>(null);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"overview" | "users" | "lots" | "bookings" | "payments">("overview");
  const [filterQuery, setFilterQuery] = useState("");

  const fetchData = async () => {
    if (!token) return;
    setLoading(true);
    setError("");
    try {
      const [sumRes, dataRes] = await Promise.all([
        fetch("/api/admin/summary", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("/api/admin/data", { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      if (!sumRes.ok || !dataRes.ok) throw new Error("Failed to load admin management data");

      const [sumJson, dataJson] = await Promise.all([sumRes.json(), dataRes.json()]);
      setSummary(sumJson);
      setData(dataJson);
    } catch (err: any) {
      setError(err.message || "Failed to load admin suite");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token]);

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center text-slate-400 gap-3">
        <RefreshCw className="h-8 w-8 animate-spin text-emerald-400" />
        <span className="text-sm font-medium">Synchronizing live admin analytics from TiDB Cloud...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-xl my-16 rounded-2xl border border-rose-500/20 bg-rose-500/10 p-6 text-center text-rose-300">
        <AlertTriangle className="mx-auto h-10 w-10 text-rose-400" />
        <h3 className="mt-3 text-lg font-bold">Admin Console Restricted</h3>
        <p className="mt-1 text-xs text-rose-300/80">{error}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-bold text-emerald-400 border border-emerald-500/20">
              OPERATOR LEVEL ACCESS
            </span>
          </div>
          <h2 className="mt-1 text-2xl sm:text-3xl font-black text-white">Central Operations Center</h2>
          <p className="text-xs text-slate-400">
            Monitor real-time bays, financial collections, user registrations, and barrier logs
          </p>
        </div>

        <button
          onClick={fetchData}
          className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-slate-900 px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Refresh All Datasets</span>
        </button>
      </div>

      {/* KPI Cards Row */}
      {summary && (
        <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="glass-panel rounded-2xl p-4">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span>Paid Revenue</span>
              <TrendingUp className="h-4 w-4 text-emerald-400" />
            </div>
            <p className="mt-2 text-2xl font-black text-white">{formatCurrency(summary.revenue)}</p>
            <p className="mt-1 text-[11px] text-emerald-400">Total verified collections</p>
          </div>

          <div className="glass-panel rounded-2xl p-4">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span>Active Bookings</span>
              <CalendarCheck className="h-4 w-4 text-teal-400" />
            </div>
            <p className="mt-2 text-2xl font-black text-white">{summary.activeBookings}</p>
            <p className="mt-1 text-[11px] text-slate-400">of {summary.bookings} all-time reservations</p>
          </div>

          <div className="glass-panel rounded-2xl p-4">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span>Slot Occupancy</span>
              <Layers className="h-4 w-4 text-cyan-400" />
            </div>
            <p className="mt-2 text-2xl font-black text-white">
              {summary.vacant} <span className="text-sm font-normal text-slate-400">/ {summary.slots}</span>
            </p>
            <p className="mt-1 text-[11px] text-emerald-400">Available bays across hubs</p>
          </div>

          <div className="glass-panel rounded-2xl p-4">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span>Total Customers</span>
              <Users className="h-4 w-4 text-violet-400" />
            </div>
            <p className="mt-2 text-2xl font-black text-white">{summary.users}</p>
            <p className="mt-1 text-[11px] text-slate-400">Across {summary.lots} parking malls</p>
          </div>
        </div>
      )}

      {/* Tabs Switcher */}
      <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3">
        <div className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-slate-900/60 p-1 text-xs">
          {[
            { id: "overview", label: "Overview & Lots" },
            { id: "bookings", label: `Bookings (${data?.bookings?.length || 0})` },
            { id: "payments", label: `Payments (${data?.payments?.length || 0})` },
            { id: "users", label: `Drivers (${data?.users?.length || 0})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as any);
                setFilterQuery("");
              }}
              className={`rounded-lg px-3 py-1.5 font-semibold transition-all ${
                activeTab === tab.id ? "bg-emerald-500 text-slate-950 font-bold" : "text-slate-400 hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search inside table */}
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
          <input
            type="text"
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            placeholder="Search records..."
            className="rounded-xl border border-white/10 bg-slate-900/80 pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Active Tab Table Content */}
      <div className="mt-4 overflow-hidden rounded-2xl border border-white/10 bg-slate-900/70 shadow-xl">
        {activeTab === "overview" && data?.parking && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-white/10 bg-slate-950/60 text-slate-400 uppercase text-[10px]">
                <tr>
                  <th className="px-4 py-3">Parking Hub</th>
                  <th className="px-4 py-3">City / Area</th>
                  <th className="px-4 py-3">Capacity</th>
                  <th className="px-4 py-3">Vacant</th>
                  <th className="px-4 py-3">Reserved</th>
                  <th className="px-4 py-3">Occupied</th>
                  <th className="px-4 py-3">Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-300">
                {data.parking
                  .filter((l: any) =>
                    !filterQuery ||
                    l.name.toLowerCase().includes(filterQuery.toLowerCase()) ||
                    l.city.toLowerCase().includes(filterQuery.toLowerCase())
                  )
                  .map((lot: any) => (
                    <tr key={lot.id} className="hover:bg-white/5">
                      <td className="px-4 py-3 font-bold text-white">{lot.name}</td>
                      <td className="px-4 py-3 text-slate-400">{lot.city}, {lot.area}</td>
                      <td className="px-4 py-3 font-semibold">{lot.capacity}</td>
                      <td className="px-4 py-3 font-bold text-emerald-400">{lot.vacant}</td>
                      <td className="px-4 py-3 text-amber-400">{lot.reserved}</td>
                      <td className="px-4 py-3 text-rose-400">{lot.occupied}</td>
                      <td className="px-4 py-3 font-bold text-white">{formatCurrency(lot.rate)}/hr</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === "bookings" && data?.bookings && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-white/10 bg-slate-950/60 text-slate-400 uppercase text-[10px]">
                <tr>
                  <th className="px-4 py-3">Code</th>
                  <th className="px-4 py-3">Driver</th>
                  <th className="px-4 py-3">Plate No</th>
                  <th className="px-4 py-3">Hub & Bay</th>
                  <th className="px-4 py-3">Duration</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-300">
                {data.bookings
                  .filter((b: any) =>
                    !filterQuery ||
                    b.bookingCode.toLowerCase().includes(filterQuery.toLowerCase()) ||
                    b.carNumber.toLowerCase().includes(filterQuery.toLowerCase())
                  )
                  .map((b: any) => (
                    <tr key={b.id} className="hover:bg-white/5">
                      <td className="px-4 py-3 font-mono font-bold text-emerald-400">{b.bookingCode}</td>
                      <td className="px-4 py-3">{b.firstName} {b.lastName}</td>
                      <td className="px-4 py-3 font-mono font-bold text-white">{b.carNumber}</td>
                      <td className="px-4 py-3 text-slate-300">{b.parkingName} • Bay {b.slotCode}</td>
                      <td className="px-4 py-3">{b.hours} hrs</td>
                      <td className="px-4 py-3">
                        <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/20">
                          {b.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-400">{formatDate(b.createdAt)}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === "payments" && data?.payments && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-white/10 bg-slate-950/60 text-slate-400 uppercase text-[10px]">
                <tr>
                  <th className="px-4 py-3">Txn ID</th>
                  <th className="px-4 py-3">Booking Code</th>
                  <th className="px-4 py-3">Driver</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Method</th>
                  <th className="px-4 py-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-300">
                {data.payments.map((p: any) => (
                  <tr key={p.id} className="hover:bg-white/5">
                    <td className="px-4 py-3 font-mono text-slate-300">{p.transactionId}</td>
                    <td className="px-4 py-3 font-bold text-emerald-400">{p.bookingCode}</td>
                    <td className="px-4 py-3">{p.firstName} {p.lastName}</td>
                    <td className="px-4 py-3 font-bold text-white">{formatCurrency(p.amount)}</td>
                    <td className="px-4 py-3 text-slate-400">{p.method}</td>
                    <td className="px-4 py-3 text-slate-400">{formatDate(p.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === "users" && data?.users && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-white/10 bg-slate-950/60 text-slate-400 uppercase text-[10px]">
                <tr>
                  <th className="px-4 py-3">Full Name</th>
                  <th className="px-4 py-3">Email Address</th>
                  <th className="px-4 py-3">Phone</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-300">
                {data.users.map((u: any) => (
                  <tr key={u.id} className="hover:bg-white/5">
                    <td className="px-4 py-3 font-bold text-white">{u.firstName} {u.lastName}</td>
                    <td className="px-4 py-3 text-slate-300">{u.email}</td>
                    <td className="px-4 py-3 text-slate-400">{u.phone}</td>
                    <td className="px-4 py-3 font-bold text-emerald-400">{u.role}</td>
                    <td className="px-4 py-3 text-slate-400">{formatDate(u.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
