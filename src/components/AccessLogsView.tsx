"use client";

import React, { useState, useEffect } from "react";
import { AccessLog } from "@/types";
import { formatDate } from "@/lib/utils";
import { ShieldCheck, ShieldAlert, RefreshCw, AlertCircle, Camera } from "lucide-react";

interface AccessLogsViewProps {
  token: string | null;
  onRequireAuth: () => void;
}

export const AccessLogsView: React.FC<AccessLogsViewProps> = ({ token, onRequireAuth }) => {
  const [logs, setLogs] = useState<AccessLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchLogs = async () => {
    if (!token) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/access/logs", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to load access logs");
      const data = await res.json();
      setLogs(data);
    } catch (err: any) {
      setError(err.message || "Failed to load logs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchLogs();
    else setLoading(false);
  }, [token]);

  if (!token) {
    return (
      <div className="mx-auto max-w-lg py-16 text-center">
        <ShieldCheck className="mx-auto h-12 w-12 text-slate-500" />
        <h3 className="mt-4 text-xl font-bold text-white">Sign In to View Gate Logs</h3>
        <p className="mt-2 text-xs text-slate-400">
          Track automated vehicle check-ins, exits, and camera OCR verification timestamps.
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
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div>
          <h2 className="text-2xl font-black text-white">Entry & Exit Activity</h2>
          <p className="text-xs text-slate-400">
            Real-time optical plate scanner events at automated boom barriers
          </p>
        </div>
        <button
          onClick={fetchLogs}
          className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-slate-900 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh</span>
        </button>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center text-slate-400 gap-2">
          <RefreshCw className="h-6 w-6 animate-spin text-emerald-400" />
          <span className="text-xs">Loading barrier logs...</span>
        </div>
      ) : error ? (
        <div className="my-8 rounded-2xl border border-rose-500/20 bg-rose-500/10 p-4 text-xs text-rose-300 flex items-center gap-2">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      ) : logs.length === 0 ? (
        <div className="my-16 text-center text-slate-400 text-xs">
          No gate entry or exit events recorded for your vehicle yet.
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {logs.map((log) => (
            <div
              key={log.id}
              className="glass-panel flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl p-4"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                    log.plateMatch
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                      : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                  }`}
                >
                  {log.plateMatch ? <ShieldCheck className="h-5 w-5" /> : <ShieldAlert className="h-5 w-5" />}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-md bg-white/10 px-2 py-0.5 font-bold text-[10px] text-white uppercase">
                      {log.eventType}
                    </span>
                    <span className="font-bold text-sm text-white">{log.parkingName}</span>
                    <span className="text-xs text-emerald-400">Bay {log.slotCode}</span>
                  </div>
                  <p className="mt-0.5 text-xs text-slate-400">
                    Expected: <span className="font-mono font-bold text-white">{log.expectedPlate}</span>
                    {log.detectedPlate && (
                      <> • Camera Read: <span className="font-mono text-emerald-300">{log.detectedPlate}</span></>
                    )}
                  </p>
                </div>
              </div>

              <div className="text-right text-xs">
                <span
                  className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold ${
                    log.plateMatch
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                      : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                  }`}
                >
                  {log.plateMatch ? "MATCH VERIFIED" : "MANUAL REVIEW"}
                </span>
                <p className="mt-1 text-[11px] text-slate-400">{formatDate(log.eventTime)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
