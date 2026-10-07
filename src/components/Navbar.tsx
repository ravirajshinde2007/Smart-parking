"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User } from "@/types";
import {
  Car,
  Calendar,
  CreditCard,
  Shield,
  Bell,
  LogIn,
  LogOut,
  User as UserIcon,
  LayoutDashboard,
  Menu,
  X,
} from "lucide-react";

interface NavbarProps {
  user: User | null;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenAuth: () => void;
  onLogout: () => void;
  unreadNotifications: number;
  onOpenNotifications: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  activeTab,
  setActiveTab,
  onOpenAuth,
  onLogout,
  unreadNotifications,
  onOpenNotifications,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: "find", label: "Find Parking", icon: Car },
    { id: "bookings", label: "Reservations", icon: Calendar, requiresAuth: true },
    { id: "payments", label: "Payments", icon: CreditCard, requiresAuth: true },
    { id: "logs", label: "Entry/Exit", icon: Shield, requiresAuth: true },
  ];

  if (user && (user.role === "ADMIN" || user.role === "OPERATOR")) {
    navItems.push({ id: "admin", label: "Admin Console", icon: LayoutDashboard, requiresAuth: true });
  }

  return (
    <header className="sticky top-0 z-40 w-full px-4 py-3 sm:px-6">
      <div className="mx-auto flex max-w-7xl items-center justify-between rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 shadow-2xl backdrop-blur-xl sm:px-6">
        {/* Brand Logo */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setActiveTab("find")}
          className="flex cursor-pointer items-center gap-3"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 shadow-lg shadow-emerald-500/25">
            <Car className="h-5 w-5 text-slate-950 font-bold" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-lg font-black tracking-tight text-white">ParkSmart</span>
              <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-400 border border-emerald-500/20">
                PRO
              </span>
            </div>
            <p className="hidden text-[10px] text-slate-400 sm:block">Cloud AI Parking Platform</p>
          </div>
        </motion.div>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => {
            if (item.requiresAuth && !user) return null;
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <motion.button
                key={item.id}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setActiveTab(item.id)}
                className={`relative flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-medium transition-all ${
                  isActive
                    ? "text-emerald-400"
                    : "text-slate-300 hover:bg-white/5 hover:text-white"
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? "text-emerald-400" : "text-slate-400"}`} />
                <span>{item.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="activeTabBadge"
                    className="absolute inset-0 rounded-xl bg-emerald-500/10 border border-emerald-500/30 -z-10"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
              </motion.button>
            );
          })}
        </nav>

        {/* Actions / Profile */}
        <div className="flex items-center gap-2.5">
          {user && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onOpenNotifications}
              className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-slate-800/80 text-slate-300 transition-colors hover:border-emerald-500/30 hover:text-white"
            >
              <Bell className="h-4 w-4" />
              {unreadNotifications > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-bold text-slate-950 ring-2 ring-slate-900">
                  {unreadNotifications}
                </span>
              )}
            </motion.button>
          )}

          {user ? (
            <div className="flex items-center gap-2">
              <div className="hidden text-right sm:block">
                <p className="text-xs font-semibold text-white leading-tight">
                  {user.firstName} {user.lastName}
                </p>
                <p className="text-[10px] text-emerald-400 font-medium capitalize">
                  {user.role.toLowerCase()}
                </p>
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onLogout}
                title="Logout"
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-rose-500/20 bg-rose-500/10 text-rose-400 transition-colors hover:bg-rose-500/20"
              >
                <LogOut className="h-4 w-4" />
              </motion.button>
            </div>
          ) : (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onOpenAuth}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-2 text-sm font-semibold text-slate-950 shadow-lg shadow-emerald-500/20 transition-all hover:brightness-110"
            >
              <LogIn className="h-4 w-4" />
              <span>Sign In</span>
            </motion.button>
          )}

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 text-slate-300 md:hidden"
          >
            {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-2 rounded-2xl border border-white/10 bg-slate-900/95 p-4 shadow-xl backdrop-blur-xl md:hidden"
          >
            <div className="flex flex-col gap-1.5">
              {navItems.map((item) => {
                if (item.requiresAuth && !user) return null;
                const Icon = item.icon;
                const isActive = activeTab === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium ${
                      isActive
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        : "text-slate-300 hover:bg-white/5"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
