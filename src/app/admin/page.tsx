"use client";

import React, { useEffect, useState } from "react";
import { AdminDashboard } from "@/components/AdminDashboard";
import { Navbar } from "@/components/Navbar";
import { AuthModal } from "@/components/AuthModal";
import { User } from "@/types";

export default function AdminPage() {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

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

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between">
      <div>
        <Navbar
          user={user}
          activeTab="admin"
          setActiveTab={(tab) => {
            if (tab !== "admin") {
              window.location.href = "/";
            }
          }}
          onOpenAuth={() => setIsAuthOpen(true)}
          onLogout={() => {
            localStorage.removeItem("parksmart_token");
            localStorage.removeItem("parksmart_user");
            setToken(null);
            setUser(null);
          }}
          unreadNotifications={0}
          onOpenNotifications={() => {}}
        />

        <main className="py-6">
          <AdminDashboard token={token} />
        </main>
      </div>

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={(data) => {
          setToken(data.token);
          setUser(data.user);
          try {
            localStorage.setItem("parksmart_token", data.token);
            localStorage.setItem("parksmart_user", JSON.stringify(data.user));
          } catch (e) {}
        }}
      />
    </div>
  );
}
