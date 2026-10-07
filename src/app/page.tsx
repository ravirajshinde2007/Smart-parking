"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, ParkingLot, ParkingSlot, NotificationItem } from "@/types";
import { Navbar } from "@/components/Navbar";
import { HeroSection } from "@/components/HeroSection";
import { ParkingCard } from "@/components/ParkingCard";
import { SlotMapModal } from "@/components/SlotMapModal";
import { BookingModal } from "@/components/BookingModal";
import { AuthModal } from "@/components/AuthModal";
import { ReservationsView } from "@/components/ReservationsView";
import { PaymentsView } from "@/components/PaymentsView";
import { AccessLogsView } from "@/components/AccessLogsView";
import { AdminDashboard } from "@/components/AdminDashboard";
import { RefreshCw, Bell, Check, X } from "lucide-react";

export default function HomePage() {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("find");

  const [parkingLots, setParkingLots] = useState<ParkingLot[]>([]);
  const [loadingLots, setLoadingLots] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState("All");

  const [selectedLot, setSelectedLot] = useState<ParkingLot | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<ParkingSlot | null>(null);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  // Restore session from localStorage on mount
  useEffect(() => {
    try {
      const savedToken = localStorage.getItem("parksmart_token");
      const savedUser = localStorage.getItem("parksmart_user");
      if (savedToken && savedUser) {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      }
    } catch (e) {}
  }, []);

  // Fetch parking lots from API
  const fetchParkingLots = async () => {
    setLoadingLots(true);
    try {
      const res = await fetch("/api/parking");
      if (!res.ok) throw new Error("Failed to load parking lots");
      const data = await res.json();
      setParkingLots(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingLots(false);
    }
  };

  useEffect(() => {
    fetchParkingLots();
  }, []);

  // Fetch notifications if logged in
  const fetchNotifications = async () => {
    if (!token) return;
    try {
      const res = await fetch("/api/notifications", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
    } catch (e) {}
  };

  useEffect(() => {
    if (token) {
      fetchNotifications();
    }
  }, [token]);

  const handleLoginSuccess = (data: { token: string; user: User }) => {
    setToken(data.token);
    setUser(data.user);
    try {
      localStorage.setItem("parksmart_token", data.token);
      localStorage.setItem("parksmart_user", JSON.stringify(data.user));
    } catch (e) {}
  };

  const handleLogout = () => {
    setToken(null);
    setUser(null);
    try {
      localStorage.removeItem("parksmart_token");
      localStorage.removeItem("parksmart_user");
    } catch (e) {}
    setActiveTab("find");
  };

  // Filter parking lots by search and city
  const cities = Array.from(new Set(parkingLots.map((l) => l.city)));

  const filteredLots = parkingLots.filter((lot) => {
    const matchesCity = selectedCity === "All" || lot.city.toLowerCase() === selectedCity.toLowerCase();
    const matchesQuery =
      !searchQuery ||
      lot.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lot.area.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lot.city.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCity && matchesQuery;
  });

  const totalSlots = parkingLots.reduce((sum, l) => sum + (l.capacity || 0), 0);
  const vacantSlots = parkingLots.reduce((sum, l) => sum + (l.vacant || 0), 0);
  const unreadNotifications = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-emerald-500 selection:text-slate-950">
      <div>
        {/* Modern Top Navbar */}
        <Navbar
          user={user}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onOpenAuth={() => setIsAuthOpen(true)}
          onLogout={handleLogout}
          unreadNotifications={unreadNotifications}
          onOpenNotifications={() => setIsNotificationsOpen(true)}
        />

        {/* Main Tab Content */}
        <main>
          {activeTab === "find" && (
            <div>
              {/* Hero & Quick Search */}
              <HeroSection
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                selectedCity={selectedCity}
                setSelectedCity={setSelectedCity}
                cities={cities}
                totalSlots={totalSlots}
                vacantSlots={vacantSlots}
              />

              {/* Parking Lots Grid */}
              <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div>
                    <h2 className="text-2xl font-black text-white">Parking Hubs & Malls</h2>
                    <p className="text-xs text-slate-400">
                      Showing {filteredLots.length} locations with real-time bay sensor status
                    </p>
                  </div>
                  <button
                    onClick={fetchParkingLots}
                    className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-slate-900 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white"
                  >
                    <RefreshCw className={`h-3.5 w-3.5 ${loadingLots ? "animate-spin" : ""}`} />
                    <span>Sync</span>
                  </button>
                </div>

                {loadingLots ? (
                  <div className="flex h-64 items-center justify-center text-slate-400 gap-3">
                    <RefreshCw className="h-6 w-6 animate-spin text-emerald-400" />
                    <span className="text-xs">Loading live locations from TiDB Cloud...</span>
                  </div>
                ) : filteredLots.length === 0 ? (
                  <div className="my-16 text-center text-slate-400 text-xs">
                    No parking locations match your search criteria.
                  </div>
                ) : (
                  <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {filteredLots.map((lot) => (
                      <ParkingCard
                        key={lot.id}
                        lot={lot}
                        onSelectLot={(selected) => setSelectedLot(selected)}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "bookings" && (
            <ReservationsView
              token={token}
              onRequireAuth={() => setIsAuthOpen(true)}
              onExplore={() => setActiveTab("find")}
            />
          )}

          {activeTab === "payments" && (
            <PaymentsView token={token} onRequireAuth={() => setIsAuthOpen(true)} />
          )}

          {activeTab === "logs" && (
            <AccessLogsView token={token} onRequireAuth={() => setIsAuthOpen(true)} />
          )}

          {activeTab === "admin" && <AdminDashboard token={token} />}
        </main>
      </div>

      {/* Footer */}
      <footer className="mt-20 border-t border-white/5 bg-slate-950/80 py-8 text-center text-xs text-slate-500">
        <p>© 2026 ParkSmart Technologies • Powered by Next.js 15, React 19, TypeScript & TiDB Cloud</p>
      </footer>

      {/* Interactive 2D Slot Visualizer Modal */}
      {selectedLot && (
        <SlotMapModal
          lot={selectedLot}
          onClose={() => setSelectedLot(null)}
          onSelectSlot={(slot) => {
            setSelectedSlot(slot);
            setIsBookingOpen(true);
          }}
        />
      )}

      {/* Booking Checkout Modal */}
      {selectedLot && selectedSlot && (
        <BookingModal
          isOpen={isBookingOpen}
          lot={selectedLot}
          slot={selectedSlot}
          token={token}
          onClose={() => {
            setIsBookingOpen(false);
            setSelectedSlot(null);
          }}
          onSuccess={() => {
            fetchParkingLots();
            fetchNotifications();
            setActiveTab("bookings");
          }}
          onRequireAuth={() => setIsAuthOpen(true)}
        />
      )}

      {/* Auth Modal (Sign In / Register) */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={handleLoginSuccess}
      />

      {/* Notifications Drawer */}
      <AnimatePresence>
        {isNotificationsOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-end p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsNotificationsOpen(false)}
              className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="relative h-full max-h-[85vh] w-full max-w-sm rounded-3xl border border-white/10 bg-slate-900 p-6 shadow-2xl z-10 flex flex-col"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <Bell className="h-4 w-4 text-emerald-400" />
                  <h3 className="font-bold text-white text-sm">Notifications</h3>
                </div>
                <button
                  onClick={() => setIsNotificationsOpen(false)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto divide-y divide-white/5 py-2">
                {notifications.length === 0 ? (
                  <p className="py-12 text-center text-xs text-slate-500">No notifications yet.</p>
                ) : (
                  notifications.map((n) => (
                    <div key={n.id} className="py-3">
                      <p className="text-xs font-bold text-white">{n.title}</p>
                      <p className="mt-1 text-[11px] text-slate-400">{n.message}</p>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
