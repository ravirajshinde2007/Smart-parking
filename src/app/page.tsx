"use client";

import React, { useState, useEffect, useRef } from "react";
import { User, ParkingLot, ParkingSlot, Booking, Payment, AccessLog } from "@/types";

declare global {
  interface Window {
    L: any;
  }
}

export default function OriginalParkSmartApp() {
  // Navigation & View State
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string>("");
  const [activePage, setActivePage] = useState<"dashboard" | "reservations" | "payments" | "logs">("dashboard");
  const [isSlotsOpen, setIsSlotsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Profile Modal State
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [editFirstName, setEditFirstName] = useState("");
  const [editLastName, setEditLastName] = useState("");
  const [editPhone, setEditPhone] = useState("");

  // Settings Modal State
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [settingsTab, setSettingsTab] = useState<"pref" | "sec">("pref");
  const [settingBrowserNotif, setSettingBrowserNotif] = useState(false);
  const [settingBookingAlerts, setSettingBookingAlerts] = useState(true);
  const [settingSoundEffects, setSettingSoundEffects] = useState(true);
  const [settingVehicleNumber, setSettingVehicleNumber] = useState("");
  const [settingVehicleType, setSettingVehicleType] = useState("Car");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  // Notifications State
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);

  // Auth Form State
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPass, setShowLoginPass] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const [regFirstName, setRegFirstName] = useState("");
  const [regLastName, setRegLastName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirmPassword, setRegConfirmPassword] = useState("");
  const [showRegPass, setShowRegPass] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  // Parking & Slots State
  const [parkingList, setParkingList] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedParking, setSelectedParking] = useState<any | null>(null);
  const [slots, setSlots] = useState<any[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<any | null>(null);

  // Booking Modal State
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [bookingVehicleType, setBookingVehicleType] = useState("Car");
  const [bookingCarType, setBookingCarType] = useState("Sedan");
  const [bookingCarNumber, setBookingCarNumber] = useState("");
  const [bookingDuration, setBookingDuration] = useState(2);
  const [bookingStep, setBookingStep] = useState<1 | 2>(1);
  const [paymentMethod, setPaymentMethod] = useState("UPI");
  const [activeReceipt, setActiveReceipt] = useState<any | null>(null);

  // User Data State
  const [bookings, setBookings] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [accessLogs, setAccessLogs] = useState<any[]>([]);

  // Toast State
  const [toastText, setToastText] = useState("");
  const [toastVisible, setToastVisible] = useState(false);

  // Leaflet Map Refs
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const userMarkerRef = useRef<any>(null);

  const showToast = (msg: string) => {
    setToastText(msg);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 3500);
  };

  // Restore Session & Preferences
  useEffect(() => {
    try {
      const savedToken = localStorage.getItem("parksmart_token") || sessionStorage.getItem("parksmart_token");
      const savedUser = localStorage.getItem("parksmart_user") || sessionStorage.getItem("parksmart_user");
      if (savedToken && savedUser) {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      }
      const savedSettings = localStorage.getItem("parksmart_settings");
      if (savedSettings) {
        const s = JSON.parse(savedSettings);
        if (s.browserNotif !== undefined) setSettingBrowserNotif(s.browserNotif);
        if (s.bookingAlerts !== undefined) setSettingBookingAlerts(s.bookingAlerts);
        if (s.soundEffects !== undefined) setSettingSoundEffects(s.soundEffects);
        if (s.vehicleNumber) {
          setSettingVehicleNumber(s.vehicleNumber);
          setBookingCarNumber(s.vehicleNumber);
        }
        if (s.vehicleType) {
          setSettingVehicleType(s.vehicleType);
          setBookingVehicleType(s.vehicleType);
        }
      }
    } catch (e) {}
  }, []);

  // Fetch Parking Lots
  const loadParkingLots = async () => {
    try {
      const res = await fetch("/api/parking");
      if (res.ok) {
        const data = await res.json();
        const mapped = data.map((p: any) => ({
          ...p,
          lat: Number(p.latitude),
          lng: Number(p.longitude),
          available: p.vacant ?? 0,
        }));
        setParkingList(mapped);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadParkingLots();
  }, []);

  // Fetch Bookings, Payments, Logs, Notifications when token changes
  const loadUserData = async () => {
    if (!token) return;
    try {
      const [bRes, pRes, lRes, nRes] = await Promise.all([
        fetch("/api/bookings", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("/api/payments", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("/api/access/logs", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("/api/notifications", { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      if (bRes.ok) setBookings(await bRes.json());
      if (pRes.ok) setPayments(await pRes.json());
      if (lRes.ok) setAccessLogs(await lRes.json());
      if (nRes.ok) {
        const notifs = await nRes.json();
        setNotifications(Array.isArray(notifs) ? notifs : []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (token) loadUserData();
  }, [token]);

  const handleMarkNotificationsRead = async () => {
    if (!token) return;
    try {
      await fetch("/api/notifications", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true, is_read: 1 })));
    } catch (e) {}
  };

  const handleClearNotifications = async () => {
    if (!token) return;
    try {
      await fetch("/api/notifications", {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications([]);
      showToast("Notifications cleared.");
    } catch (e) {}
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editFirstName.trim() || !editLastName.trim() || !editPhone.trim()) {
      showToast("Please fill in all profile fields.");
      return;
    }
    try {
      const res = await fetch("/api/auth/me", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName: editFirstName.trim(),
          lastName: editLastName.trim(),
          phone: editPhone.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update profile");

      const updatedUser = { ...user, ...data.user };
      setUser(updatedUser);
      localStorage.setItem("parksmart_user", JSON.stringify(updatedUser));
      setIsProfileModalOpen(false);
      showToast("Profile updated successfully!");
    } catch (err: any) {
      showToast(err.message || "Failed to update profile");
    }
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    const settings = {
      browserNotif: settingBrowserNotif,
      bookingAlerts: settingBookingAlerts,
      soundEffects: settingSoundEffects,
      vehicleNumber: settingVehicleNumber.trim().toUpperCase(),
      vehicleType: settingVehicleType,
    };
    localStorage.setItem("parksmart_settings", JSON.stringify(settings));
    if (settingVehicleNumber) setBookingCarNumber(settingVehicleNumber.trim().toUpperCase());
    if (settingVehicleType) setBookingVehicleType(settingVehicleType);
    setIsSettingsModalOpen(false);
    showToast("Preferences saved successfully!");
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      showToast("Please enter current and new password.");
      return;
    }
    if (newPassword.length < 6) {
      showToast("New password must contain at least 6 characters.");
      return;
    }
    if (newPassword !== confirmNewPassword) {
      showToast("New passwords do not match.");
      return;
    }
    try {
      const res = await fetch("/api/auth/password", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to change password");

      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
      setIsSettingsModalOpen(false);
      showToast("Password updated successfully!");
    } catch (err: any) {
      showToast(err.message || "Failed to change password");
    }
  };

  // Leaflet Map Initialization
  useEffect(() => {
    if (!user || activePage !== "dashboard" || isSlotsOpen) return;

    const timer = setTimeout(() => {
      if (typeof window === "undefined" || !window.L || !mapContainerRef.current) return;

      if (!mapInstanceRef.current) {
        const map = window.L.map(mapContainerRef.current, { preferCanvas: true }).setView([22.9734, 78.6569], 5);
        window.L.tileLayer(
          "https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}",
          {
            attribution: "&copy; Esri, OpenStreetMap contributors",
            maxZoom: 19,
            crossOrigin: true,
          }
        ).addTo(map);
        mapInstanceRef.current = map;
      }

      const map = mapInstanceRef.current;
      map.invalidateSize();

      // Clear existing markers
      markersRef.current.forEach((m) => map.removeLayer(m));
      markersRef.current = [];

      // Add parking markers
      const displayed = parkingList.filter((p) => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return (
          p.name.toLowerCase().includes(q) ||
          p.city.toLowerCase().includes(q) ||
          p.area.toLowerCase().includes(q)
        );
      });

      displayed.forEach((p) => {
        const available = p.available ?? p.vacant ?? 0;
        const color = available === 0 ? "#ef4444" : available <= 10 ? "#f59e0b" : "#22c55e";
        const icon = window.L.divIcon({
          className: "",
          html: `<div style="width:18px;height:18px;border-radius:50%;background:${color};border:3px solid white;box-shadow:0 3px 12px rgba(0,0,0,.5)"></div>`,
          iconSize: [18, 18],
          iconAnchor: [9, 9],
        });

        const marker = window.L.marker([p.lat, p.lng], { icon }).addTo(map);
        marker.bindPopup(
          `<strong>${p.name}</strong><br>📍 ${p.area}, ${p.city}<br>🅿️ ${available} spaces available<br><br><button type="button" class="view-slots-btn" style="background:#19e58b;color:#03131d;border:none;border-radius:6px;padding:6px 12px;font-weight:700;cursor:pointer;">View Slots</button>`
        );

        marker.on("popupopen", () => {
          const btn = document.querySelector(".view-slots-btn");
          if (btn) {
            btn.addEventListener("click", () => handleOpenSlots(p), { once: true });
          }
        });

        markersRef.current.push(marker);
      });

      if (displayed.length === 1) {
        map.setView([displayed[0].lat, displayed[0].lng], 14);
      } else if (displayed.length > 1) {
        const bounds = window.L.latLngBounds(displayed.map((p) => [p.lat, p.lng]));
        map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [user, activePage, isSlotsOpen, parkingList, searchQuery]);

  // Auth Handlers
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail) return showToast("Please enter your email.");
    if (!loginPassword) return showToast("Please enter your password.");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Invalid credentials");

      setToken(data.token);
      setUser(data.user);
      const storage = rememberMe ? localStorage : sessionStorage;
      storage.setItem("parksmart_token", data.token);
      storage.setItem("parksmart_user", JSON.stringify(data.user));
      showToast("Login successful! Welcome to ParkSmart.");
    } catch (err: any) {
      showToast(err.message);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regFirstName) return showToast("Enter your first name.");
    if (!regLastName) return showToast("Enter your last name.");
    if (!regEmail) return showToast("Enter your email address.");
    if (!regPhone) return showToast("Enter your mobile number.");
    if (regPassword.length < 6) return showToast("Password must contain at least 6 characters.");
    if (regPassword !== regConfirmPassword) return showToast("Passwords do not match.");
    if (!termsAccepted) return showToast("Please accept the Terms & Conditions.");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: regFirstName,
          lastName: regLastName,
          email: regEmail,
          phone: regPhone,
          password: regPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Registration failed");

      showToast("Account created successfully. Please login.");
      setLoginEmail(regEmail);
      setAuthMode("login");
    } catch (err: any) {
      showToast(err.message);
    }
  };

  const handleLogout = () => {
    if (!confirm("Do you want to logout?")) return;
    setToken("");
    setUser(null);
    localStorage.removeItem("parksmart_token");
    localStorage.removeItem("parksmart_user");
    sessionStorage.removeItem("parksmart_token");
    sessionStorage.removeItem("parksmart_user");
    setIsProfileOpen(false);
    showToast("You have been logged out.");
  };

  const fillAdminCredentials = () => {
    setLoginEmail("admin@gmail.com");
    setLoginPassword("raviraj@2007");
    showToast("Admin credentials filled. Click Sign in!");
  };

  // Open Slots for a Parking Lot
  const handleOpenSlots = async (parking: any) => {
    setSelectedParking(parking);
    setSelectedSlot(null);
    setIsSlotsOpen(true);

    try {
      const res = await fetch(`/api/parking/${parking.id}/slots`);
      if (res.ok) {
        const data = await res.json();
        setSlots(data.slots || []);
      }
    } catch (e) {
      showToast("Failed to load slots");
    }
  };

  // Use Current Location
  const handleCurrentLocation = () => {
    if (!navigator.geolocation) return showToast("Geolocation is not supported by your browser.");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        if (mapInstanceRef.current && window.L) {
          mapInstanceRef.current.setView([lat, lng], 14);
          if (userMarkerRef.current) mapInstanceRef.current.removeLayer(userMarkerRef.current);
          userMarkerRef.current = window.L.marker([lat, lng])
            .addTo(mapInstanceRef.current)
            .bindPopup("<strong>📍 You are here</strong>")
            .openPopup();
        }
        showToast("Centered on your current location.");
      },
      () => showToast("Could not access your location.")
    );
  };

  // Start Booking Flow
  const handleStartBooking = () => {
    if (!selectedSlot || !selectedParking) return;
    setBookingStep(1);
    setIsBookingModalOpen(true);
  };

  // Confirm Reservation & Payment
  const handleConfirmPayment = async () => {
    if (!bookingCarNumber.trim()) return showToast("Please enter your vehicle registration plate number.");
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          parkingLotId: selectedParking.id,
          parkingSlotId: selectedSlot.id,
          vehicleType: bookingVehicleType,
          carType: bookingCarType,
          carNumber: bookingCarNumber.trim().toUpperCase(),
          durationHours: bookingDuration,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to reserve slot");

      const receipt = {
        bookingCode: data.booking.bookingCode,
        amount: data.booking.amount,
        txnId: data.booking.transactionId,
        date: new Date().toLocaleString(),
        method: paymentMethod,
        vehicleType: bookingVehicleType,
        carType: bookingCarType,
        carNumber: bookingCarNumber.trim().toUpperCase(),
        slot: selectedSlot.slotCode,
        duration: `${bookingDuration} Hours`,
        parkingName: selectedParking.name,
      };

      setActiveReceipt(receipt);
      setIsBookingModalOpen(false);
      setIsSlotsOpen(false);
      loadParkingLots();
      loadUserData();
      showToast("Booking Confirmed! Slot successfully locked.");
    } catch (err: any) {
      showToast(err.message);
    }
  };

  // Cancel Booking
  const handleCancelBooking = async (id: number) => {
    if (!confirm("Are you sure you want to cancel this reservation? The slot will be released.")) return;
    try {
      const res = await fetch(`/api/bookings/${id}/cancel`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Cancellation failed");
      showToast(data.message);
      loadUserData();
      loadParkingLots();
    } catch (err: any) {
      showToast(err.message);
    }
  };

  // Filtered Parking
  const filteredParking = parkingList.filter((p) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      p.city.toLowerCase().includes(q) ||
      p.area.toLowerCase().includes(q)
    );
  });

  const totalPaidAmount = payments
    .filter((p) => p.status === "PAID")
    .reduce((sum, p) => sum + Number(p.amount), 0);

  return (
    <>
      {/* =====================================================
           ANIMATED BACKGROUND
      ====================================================== */}
      <div className="background">
        <div className="background-overlay"></div>
        <div className="light light-one"></div>
        <div className="light light-two"></div>
        <div className="light light-three"></div>
        <div className="particle particle-one"></div>
        <div className="particle particle-two"></div>
        <div className="particle particle-three"></div>
        <div className="particle particle-four"></div>
        <div className="particle particle-five"></div>
      </div>

      {/* =====================================================
           TOAST MESSAGE
      ====================================================== */}
      <div id="toast" className={`toast ${toastVisible ? "show" : ""}`}>
        <span id="toastIcon">✓</span>
        <span id="toastMessage">{toastText}</span>
      </div>

      {/* =====================================================
           AUTHENTICATION PAGE (When not logged in)
      ====================================================== */}
      {!user ? (
        <main id="authPage" className="auth-page">
          <div className="auth-wrapper">
            {/* BRAND */}
            <div className="brand">
              <div className="brand-logo">P</div>
              <div className="brand-text">
                <strong>ParkSmart</strong>
                <span>SMART PARKING SYSTEM</span>
              </div>
            </div>

            {/* AUTH CARD */}
            <div className="auth-card">
              {/* LOGIN FORM */}
              <div id="loginFormBox" className={`form-box ${authMode === "login" ? "active" : ""}`}>
                <div className="auth-heading">
                  <span className="welcome">WELCOME BACK</span>
                  <h1>Login to ParkSmart</h1>
                  <p>Find your parking space faster and park smarter.</p>
                </div>

                <form id="loginForm" onSubmit={handleLogin}>
                  <div className="input-group">
                    <label>Email Address</label>
                    <div className="input-box">
                      <span className="input-icon">✉</span>
                      <input
                        type="email"
                        id="loginEmail"
                        placeholder="Enter your email"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="input-group">
                    <label>Password</label>
                    <div className="input-box">
                      <span className="input-icon">🔒</span>
                      <input
                        type={showLoginPass ? "text" : "password"}
                        id="loginPassword"
                        placeholder="Enter your password"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        required
                      />
                      <button
                        type="button"
                        className="show-password"
                        onClick={() => setShowLoginPass(!showLoginPass)}
                      >
                        {showLoginPass ? "Hide" : "Show"}
                      </button>
                    </div>
                  </div>

                  <div className="form-options">
                    <label className="checkbox-container">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                      />
                      Remember Me
                    </label>
                    <button
                      type="button"
                      className="forgot-link"
                      onClick={fillAdminCredentials}
                    >
                      Autofill Admin Demo
                    </button>
                  </div>

                  <button type="submit" className="main-button">
                    <span>Sign In</span>
                    <span className="button-arrow">→</span>
                  </button>
                </form>

                <div className="switch-text">
                  Don't have an account?{" "}
                  <button type="button" onClick={() => setAuthMode("register")}>
                    Create Account
                  </button>
                </div>
              </div>

              {/* REGISTER FORM */}
              <div id="registerFormBox" className={`form-box ${authMode === "register" ? "active" : ""}`}>
                <div className="auth-heading">
                  <span className="welcome">GET STARTED</span>
                  <h1>Create Account</h1>
                  <p>Register today and experience smarter parking.</p>
                </div>

                <form id="registerForm" onSubmit={handleRegister}>
                  <div className="two-column">
                    <div className="input-group">
                      <label>First Name</label>
                      <div className="input-box">
                        <span className="input-icon">👤</span>
                        <input
                          type="text"
                          placeholder="First name"
                          value={regFirstName}
                          onChange={(e) => setRegFirstName(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    <div className="input-group">
                      <label>Last Name</label>
                      <div className="input-box">
                        <input
                          type="text"
                          placeholder="Last name"
                          value={regLastName}
                          onChange={(e) => setRegLastName(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="input-group">
                    <label>Email Address</label>
                    <div className="input-box">
                      <span className="input-icon">✉</span>
                      <input
                        type="email"
                        placeholder="Enter your email"
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="input-group">
                    <label>Mobile Number</label>
                    <div className="input-box">
                      <span className="input-icon">☎</span>
                      <input
                        type="tel"
                        placeholder="+91 98765 43210"
                        value={regPhone}
                        onChange={(e) => setRegPhone(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="input-group">
                    <label>Password</label>
                    <div className="input-box">
                      <span className="input-icon">🔒</span>
                      <input
                        type={showRegPass ? "text" : "password"}
                        placeholder="Create password"
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        minLength={6}
                        required
                      />
                      <button
                        type="button"
                        className="show-password"
                        onClick={() => setShowRegPass(!showRegPass)}
                      >
                        {showRegPass ? "Hide" : "Show"}
                      </button>
                    </div>
                  </div>

                  <div className="input-group">
                    <label>Confirm Password</label>
                    <div className="input-box">
                      <span className="input-icon">🔐</span>
                      <input
                        type="password"
                        placeholder="Confirm password"
                        value={regConfirmPassword}
                        onChange={(e) => setRegConfirmPassword(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="terms-row">
                    <label className="checkbox-container">
                      <input
                        type="checkbox"
                        checked={termsAccepted}
                        onChange={(e) => setTermsAccepted(e.target.checked)}
                        required
                      />
                      I agree to the Terms & Conditions
                    </label>
                  </div>

                  <button type="submit" className="main-button">
                    <span>Create Account</span>
                    <span className="button-arrow">→</span>
                  </button>
                </form>

                <div className="switch-text">
                  Already have an account?{" "}
                  <button type="button" onClick={() => setAuthMode("login")}>
                    Login
                  </button>
                </div>
              </div>
            </div>

            <div className="security-text">
              <span className="security-icon">🔐</span>
              Your information is protected with secure authentication.
            </div>
          </div>
        </main>
      ) : (
        /* =====================================================
             PARKSMART DASHBOARD VIEW (When logged in)
        ====================================================== */
        <section id="dashboardView" className="dashboard-view">
          {/* SIDEBAR */}
          <aside className="sidebar">
            <div className="sidebar-brand">
              <span className="brand-logo">P</span>
              <strong>ParkSmart</strong>
            </div>
            <nav className="sidebar-nav">
              <button
                type="button"
                className={`sidebar-link ${activePage === "dashboard" ? "active" : ""}`}
                onClick={() => {
                  setActivePage("dashboard");
                  setIsSlotsOpen(false);
                }}
              >
                🏠 <span>Dashboard</span>
              </button>
              <button
                type="button"
                className={`sidebar-link ${activePage === "reservations" ? "active" : ""}`}
                onClick={() => {
                  setActivePage("reservations");
                  setIsSlotsOpen(false);
                }}
              >
                📅 <span>Reservations</span>
              </button>
              <button
                type="button"
                className={`sidebar-link ${activePage === "payments" ? "active" : ""}`}
                onClick={() => {
                  setActivePage("payments");
                  setIsSlotsOpen(false);
                }}
              >
                💳 <span>Payments</span>
              </button>
              <button
                type="button"
                className={`sidebar-link ${activePage === "logs" ? "active" : ""}`}
                onClick={() => {
                  setActivePage("logs");
                  setIsSlotsOpen(false);
                }}
              >
                🚗 <span>Entry &amp; Exit</span>
              </button>
            </nav>
            <button
              type="button"
              id="sidebarLogout"
              className="sidebar-link sidebar-logout"
              onClick={handleLogout}
            >
              🚪 <span>Logout</span>
            </button>
          </aside>

          {/* MAIN APP CONTENT */}
          <div className="app-content">
            {/* HEADER */}
            <header className="dashboard-header">
              <div className="dashboard-title">
                <h1>Find Parking</h1>
                <p>Find available parking near your destination.</p>
              </div>

              <div className="dashboard-header-actions" style={{ position: "relative" }}>
                <button
                  type="button"
                  className="dashboard-notification"
                  onClick={() => {
                    const next = !isNotifOpen;
                    setIsNotifOpen(next);
                    if (next) handleMarkNotificationsRead();
                  }}
                  title="Notifications"
                >
                  🔔
                  {notifications.some((n) => !n.isRead && !n.is_read) && (
                    <span style={{ display: "block" }}></span>
                  )}
                </button>

                {isNotifOpen && (
                  <div className="notif-panel show" style={{ display: "block" }}>
                    <div className="notif-head">
                      <strong>Notifications</strong>
                      <button type="button" onClick={handleClearNotifications}>
                        Clear
                      </button>
                    </div>
                    {notifications.length > 0 ? (
                      notifications.map((n, idx) => (
                        <div
                          key={n.id || idx}
                          className={`notif-item ${!n.isRead && !n.is_read ? "unread" : ""}`}
                        >
                          <strong>{n.title || "Notification"}</strong>
                          <p style={{ margin: "4px 0 2px", fontSize: "12px", color: "#cbd5e1" }}>
                            {n.message}
                          </p>
                          <small style={{ color: "#64748b", fontSize: "10px" }}>
                            {n.createdAt || n.created_at
                              ? new Date(n.createdAt || n.created_at).toLocaleString()
                              : "Recent"}
                          </small>
                        </div>
                      ))
                    ) : (
                      <div className="notif-item" style={{ textAlign: "center", padding: "16px 10px", color: "#64748b" }}>
                        No notifications yet
                      </div>
                    )}
                  </div>
                )}

                <div className="dashboard-profile">
                  <button
                    type="button"
                    className="profile-button"
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                  >
                    <div className="profile-avatar">
                      {(user.firstName || "D").charAt(0).toUpperCase()}
                    </div>
                    <div className="profile-name">
                      <strong>{user.firstName || "Driver"}</strong>
                      <small>{user.role || "Driver"}</small>
                    </div>
                    <span>⌄</span>
                  </button>

                  {isProfileOpen && (
                    <div className="profile-dropdown active" id="profileDropdown">
                      <div className="profile-user">
                        <div className="large-profile-avatar">
                          {(user.firstName || "D").charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <strong>{user.firstName} {user.lastName}</strong>
                          <small>{user.email}</small>
                        </div>
                      </div>
                      <div className="profile-divider"></div>
                      <button
                        type="button"
                        onClick={() => {
                          setIsProfileOpen(false);
                          setEditFirstName(user.firstName || "");
                          setEditLastName(user.lastName || "");
                          setEditPhone(user.phone || "");
                          setIsProfileModalOpen(true);
                        }}
                      >
                        👤 My Profile
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsProfileOpen(false);
                          setIsSettingsModalOpen(true);
                        }}
                      >
                        ⚙️ Settings
                      </button>
                      <button type="button" onClick={handleLogout} className="logout-button">
                        🚪 Logout
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </header>

            {/* VIEW 1: DASHBOARD (SEARCH + MAP + LIST) */}
            {activePage === "dashboard" && !isSlotsOpen && (
              <div id="dashboardSection" className="page">
                {/* PARKING SEARCH */}
                <section className="dashboard-search-card">
                  <div className="dashboard-search-heading">
                    <div>
                      <span className="dashboard-label">PARKING SEARCH</span>
                      <h2>Where do you want to park?</h2>
                    </div>
                    <button
                      id="currentLocationBtn"
                      className="current-location-btn"
                      type="button"
                      onClick={handleCurrentLocation}
                    >
                      📍 Use My Current Location
                    </button>
                  </div>

                  <div className="location-search">
                    <span>🔍</span>
                    <input
                      type="text"
                      id="parkingSearch"
                      placeholder="Search city, area, place or colony..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    {searchQuery && (
                      <button id="clearSearch" type="button" onClick={() => setSearchQuery("")}>
                        ×
                      </button>
                    )}
                  </div>
                </section>

                {/* MAIN GRID: MAP + PARKING LIST */}
                <section className="dashboard-main-grid">
                  {/* MAP CARD */}
                  <div className="dashboard-map-card">
                    <div className="dashboard-card-header">
                      <div>
                        <span className="dashboard-label">LIVE MAP</span>
                        <h2>Parking Map</h2>
                        <p id="selectedLocationText">
                          {searchQuery ? `Showing results for "${searchQuery}"` : "Showing parking across India"}
                        </p>
                      </div>

                      <div className="map-legend">
                        <span><i className="available-dot"></i> Available</span>
                        <span><i className="limited-dot"></i> Limited</span>
                        <span><i className="full-dot"></i> Full</span>
                      </div>
                    </div>

                    <div
                      id="parkingMap"
                      ref={mapContainerRef}
                      className="dashboard-map"
                      style={{ height: "470px", width: "100%" }}
                    ></div>
                  </div>

                  {/* PARKING LIST CARD */}
                  <div className="dashboard-parking-card">
                    <div className="dashboard-card-header">
                      <div>
                        <span className="dashboard-label">AVAILABLE PARKING</span>
                        <h2 id="parkingHeading">Parking near you</h2>
                      </div>
                      <span id="parkingCount" className="parking-count">
                        {filteredParking.length} locations
                      </span>
                    </div>

                    <div id="parkingList" className="parking-list">
                      {filteredParking.length === 0 ? (
                        <div className="no-parking">
                          <h3>No parking found</h3>
                          <p>Try another city, area, place or colony.</p>
                        </div>
                      ) : (
                        filteredParking.map((p) => {
                          const available = p.available ?? p.vacant ?? 0;
                          const status = available === 0 ? "full" : available <= 10 ? "limited" : "available";
                          const statusText = status === "available" ? "Available" : status === "limited" ? "Limited" : "Full";

                          return (
                            <div key={p.id} className="parking-result">
                              <div className="parking-result-top">
                                <div>
                                  <strong>{p.name}</strong>
                                  <small>📍 {p.area}, {p.city}</small>
                                </div>
                                <span className={`parking-status ${status}`}>{statusText}</span>
                              </div>
                              <div className="parking-result-bottom">
                                <span className="spaces">🅿️ {available}/{p.capacity} spaces available</span>
                              </div>
                              <button
                                className="parking-book-btn"
                                type="button"
                                onClick={() => handleOpenSlots(p)}
                              >
                                View Slots
                              </button>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                </section>
              </div>
            )}

            {/* VIEW 2: PARKING SLOTS SCREEN */}
            {isSlotsOpen && selectedParking && (
              <section id="parkingSlotsPage" className="parking-slots-page">
                <div className="slots-page-header">
                  <div>
                    <h2 id="slotParkingName">{selectedParking.name}</h2>
                    <p id="slotParkingLocation">📍 {selectedParking.area}, {selectedParking.city} • ₹{selectedParking.rate}/hr</p>
                  </div>
                  <button
                    id="backToDashboard"
                    className="back-dashboard-btn"
                    type="button"
                    onClick={() => {
                      setIsSlotsOpen(false);
                      setSelectedSlot(null);
                    }}
                  >
                    ← Back
                  </button>
                </div>

                <div className="slots-availability">
                  <span id="slotAvailabilityText">Select a vacant slot to proceed</span>
                </div>

                <div className="slot-legend">
                  <span><i className="legend-box vacant"></i> Vacant</span>
                  <span><i className="legend-box occupied"></i> Occupied</span>
                  <span><i className="legend-box reserved"></i> Reserved</span>
                  <span><i className="legend-box selected"></i> Selected</span>
                </div>

                <div className="parking-entry">🚗 ENTRY</div>

                <div id="parkingSlotGrid" className="parking-slot-grid">
                  {slots.map((s) => {
                    const isSelected = selectedSlot?.id === s.id;
                    const statusClass = isSelected ? "selected" : s.slotStatus.toLowerCase();
                    const isVacant = s.slotStatus === "VACANT";

                    return (
                      <button
                        key={s.id}
                        type="button"
                        disabled={!isVacant}
                        className={`slot-box ${statusClass}`}
                        onClick={() => setSelectedSlot(s)}
                      >
                        <strong>{s.slotCode}</strong>
                        <small>{isSelected ? "Selected" : s.slotStatus}</small>
                      </button>
                    );
                  })}
                </div>

                <div className="selected-slot-box">
                  <p>Selected Slot: <strong id="selectedSlotName">{selectedSlot ? selectedSlot.slotCode : "None"}</strong></p>
                  <button
                    id="bookSelectedSlot"
                    className="book-slot-btn"
                    type="button"
                    disabled={!selectedSlot}
                    onClick={handleStartBooking}
                  >
                    Book Selected Slot
                  </button>
                </div>
              </section>
            )}

            {/* VIEW 3: RESERVATIONS PAGE */}
            {activePage === "reservations" && (
              <div id="page-reservations" className="page">
                <section id="myBookingsSection" className="dashboard-bookings-card">
                  <div className="dashboard-card-header">
                    <div>
                      <span className="dashboard-label">MY BOOKINGS</span>
                      <h2>Reserved Parking Slots</h2>
                    </div>
                    <span id="bookingCount" className="parking-count">
                      {bookings.length} {bookings.length === 1 ? "booking" : "bookings"}
                    </span>
                  </div>

                  <div id="myBookingsList" className="my-bookings-list">
                    {bookings.length === 0 ? (
                      <div className="no-bookings">
                        <div className="no-bookings-icon">🅿️</div>
                        <p>You don't have any reserved parking slots.</p>
                        <small>Select a parking location and book a vacant slot.</small>
                      </div>
                    ) : (
                      bookings.map((b) => (
                        <div key={b.id} className="booking-card">
                          <div className="booking-card-header">
                            <div>
                              <strong>{b.parkingName}</strong>
                              <small>📍 {b.area}, {b.city}</small>
                            </div>
                            <span className="booking-status">
                              {b.status === "COMPLETED" ? "🟢 Completed" : b.status === "PARKED" ? "🔵 Parked" : b.status === "CANCELLED" ? "⚪ Cancelled" : "🟡 Reserved"}
                            </span>
                          </div>
                          <div className="booking-card-details">
                            <div><span>Parking Slot</span><strong>{b.slotCode}</strong></div>
                            <div><span>Booking ID</span><strong>{b.bookingCode}</strong></div>
                            <div><span>Vehicle</span><strong>{b.carNumber}</strong></div>
                            <div><span>Duration</span><strong>{b.durationHours} Hours</strong></div>
                          </div>
                          {b.status === "RESERVED" && (
                            <button
                              type="button"
                              className="cancel-booking-btn"
                              onClick={() => handleCancelBooking(b.id)}
                            >
                              Cancel Reservation
                            </button>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </section>
              </div>
            )}

            {/* VIEW 4: PAYMENTS PAGE */}
            {activePage === "payments" && (
              <div id="page-payments" className="page">
                <section className="dashboard-bookings-card">
                  <div className="dashboard-card-header">
                    <div>
                      <span className="dashboard-label">PAYMENT DETAILS</span>
                      <h2>Payments</h2>
                    </div>
                    <span id="totalPaid" className="parking-count">
                      Total paid: ₹{totalPaidAmount}
                    </span>
                  </div>
                  <div className="table-wrap">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Booking</th>
                          <th>Amount</th>
                          <th>Method</th>
                          <th>Status</th>
                          <th>Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {payments.length === 0 ? (
                          <tr><td colSpan={5} style={{ textAlign: "center", padding: "20px" }}>No payment records found.</td></tr>
                        ) : (
                          payments.map((p) => (
                            <tr key={p.id}>
                              <td><strong>{p.bookingCode}</strong></td>
                              <td><strong>₹{p.amount}</strong></td>
                              <td>{p.paymentMethod || "UPI / Card"}</td>
                              <td><span className="badge-paid">{p.status}</span></td>
                              <td>{new Date(p.createdAt).toLocaleDateString()}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </section>
              </div>
            )}

            {/* VIEW 5: ENTRY & EXIT LOGS PAGE */}
            {activePage === "logs" && (
              <div id="page-logs" className="page">
                <section className="dashboard-bookings-card">
                  <div className="dashboard-card-header">
                    <div>
                      <span className="dashboard-label">INCOMING / OUTGOING</span>
                      <h2>Entry &amp; Exit Log</h2>
                    </div>
                  </div>
                  <div id="logsList" className="my-bookings-list">
                    {accessLogs.length === 0 ? (
                      <div className="no-bookings">
                        <div className="no-bookings-icon">🚗</div>
                        <p>No gate barrier logs recorded yet.</p>
                      </div>
                    ) : (
                      accessLogs.map((log) => (
                        <div key={log.id} className="booking-card">
                          <div className="booking-card-header">
                            <div>
                              <strong>{log.parkingName}</strong>
                              <small>Bay {log.slotCode}</small>
                            </div>
                            <span className="booking-status">
                              {log.plateMatch ? "🟢 Plate Match" : "🟡 Review"}
                            </span>
                          </div>
                          <div className="booking-card-details">
                            <div><span>Event</span><strong>{log.eventType}</strong></div>
                            <div><span>Plate</span><strong>{log.expectedPlate}</strong></div>
                            <div><span>Camera Read</span><strong>{log.detectedPlate || "—"}</strong></div>
                            <div><span>Time</span><strong>{new Date(log.eventTime).toLocaleString()}</strong></div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </section>
              </div>
            )}
          </div>
        </section>
      )}

      {/* =====================================================
           BOOKING DETAILS & PAYMENT MODAL
      ====================================================== */}
      {isBookingModalOpen && selectedParking && selectedSlot && (
        <div id="demoModal" className="dashboard-modal active">
          <div className="success-box">
            <button
              type="button"
              className="parksmart-receipt-close"
              onClick={() => setIsBookingModalOpen(false)}
            >
              ×
            </button>

            {bookingStep === 1 ? (
              <div className="parksmart-booking-form">
                <div className="parksmart-step-head">
                  <span className="parksmart-step-badge">1</span>
                  <div>
                    <h2>🅿️ Booking Details</h2>
                    <p>Check your parking details before continuing to payment.</p>
                  </div>
                </div>

                <div className="parksmart-location-card">
                  <div className="parksmart-location-icon">📍</div>
                  <div>
                    <strong>{selectedParking.name}</strong>
                    <span>{selectedParking.area}, {selectedParking.city}</span>
                  </div>
                </div>

                <div className="parksmart-slot-banner">
                  <span>Selected Parking Slot</span>
                  <strong>{selectedSlot.slotCode}</strong>
                </div>

                <div className="parksmart-form-grid">
                  <div className="parksmart-form-field">
                    <label>Vehicle Type</label>
                    <select
                      className="pay-input"
                      value={bookingVehicleType}
                      onChange={(e) => setBookingVehicleType(e.target.value)}
                    >
                      <option value="Car">🚗 Car</option>
                      <option value="SUV">🚙 SUV</option>
                      <option value="Bike">🏍️ Bike</option>
                      <option value="EV">⚡ EV</option>
                    </select>
                  </div>

                  <div className="parksmart-form-field">
                    <label>Car Model</label>
                    <input
                      className="pay-input"
                      placeholder="e.g. Swift, Creta, Nexon"
                      value={bookingCarType}
                      onChange={(e) => setBookingCarType(e.target.value)}
                    />
                  </div>

                  <div className="parksmart-form-field full-width">
                    <label>Car Number *</label>
                    <input
                      className="pay-input"
                      placeholder="e.g. MH 15 AB 1234"
                      value={bookingCarNumber}
                      onChange={(e) => setBookingCarNumber(e.target.value.toUpperCase())}
                      required
                    />
                  </div>

                  <div className="parksmart-form-field full-width">
                    <label>Time Duration</label>
                    <select
                      className="pay-input"
                      value={bookingDuration}
                      onChange={(e) => setBookingDuration(Number(e.target.value))}
                    >
                      <option value={1}>1 Hour</option>
                      <option value={2}>2 Hours</option>
                      <option value={3}>3 Hours</option>
                      <option value={4}>4 Hours</option>
                      <option value={8}>8 Hours</option>
                    </select>
                  </div>
                </div>

                <div className="parksmart-confirmation-card">
                  <div className="parksmart-confirmation-row">
                    <span>Parking Slot</span>
                    <strong>{selectedSlot.slotCode}</strong>
                  </div>
                  <div className="parksmart-confirmation-row">
                    <span>Hourly Rate</span>
                    <strong>₹{selectedParking.rate}/hr</strong>
                  </div>
                  <div className="parksmart-confirmation-row">
                    <span>Duration</span>
                    <strong>{bookingDuration} Hours</strong>
                  </div>
                  <div className="parksmart-confirmation-row total">
                    <span>Total Amount</span>
                    <strong>₹{selectedParking.rate * bookingDuration}</strong>
                  </div>
                </div>

                <button
                  type="button"
                  className="confirm-booking"
                  onClick={() => {
                    if (!bookingCarNumber.trim()) return showToast("Enter car number");
                    setBookingStep(2);
                  }}
                >
                  Proceed to Payment (₹{selectedParking.rate * bookingDuration})
                </button>
              </div>
            ) : (
              <div className="parksmart-booking-form">
                <div className="parksmart-step-head">
                  <span className="parksmart-step-badge">2</span>
                  <div>
                    <h2>💳 Select Payment Method</h2>
                    <p>Total Amount: ₹{selectedParking.rate * bookingDuration}</p>
                  </div>
                </div>

                <div style={{ display: "flex", gap: "10px", margin: "20px 0" }}>
                  <button
                    type="button"
                    style={{
                      flex: 1,
                      padding: "12px",
                      borderRadius: "8px",
                      border: paymentMethod === "UPI" ? "2px solid #19e58b" : "1px solid rgba(255,255,255,0.2)",
                      background: paymentMethod === "UPI" ? "rgba(25,229,139,0.15)" : "transparent",
                      color: "white",
                      cursor: "pointer",
                    }}
                    onClick={() => setPaymentMethod("UPI")}
                  >
                    📱 UPI
                  </button>
                  <button
                    type="button"
                    style={{
                      flex: 1,
                      padding: "12px",
                      borderRadius: "8px",
                      border: paymentMethod === "Card" ? "2px solid #19e58b" : "1px solid rgba(255,255,255,0.2)",
                      background: paymentMethod === "Card" ? "rgba(25,229,139,0.15)" : "transparent",
                      color: "white",
                      cursor: "pointer",
                    }}
                    onClick={() => setPaymentMethod("Card")}
                  >
                    💳 Card
                  </button>
                  <button
                    type="button"
                    style={{
                      flex: 1,
                      padding: "12px",
                      borderRadius: "8px",
                      border: paymentMethod === "NetBanking" ? "2px solid #19e58b" : "1px solid rgba(255,255,255,0.2)",
                      background: paymentMethod === "NetBanking" ? "rgba(25,229,139,0.15)" : "transparent",
                      color: "white",
                      cursor: "pointer",
                    }}
                    onClick={() => setPaymentMethod("NetBanking")}
                  >
                    🏦 Net Banking
                  </button>
                </div>

                <button
                  type="button"
                  className="confirm-booking"
                  onClick={handleConfirmPayment}
                >
                  Pay ₹{selectedParking.rate * bookingDuration} &amp; Confirm
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =====================================================
           PAYMENT RECEIPT MODAL
      ====================================================== */}
      {activeReceipt && (
        <div id="parkSmartReceiptModal" className="parksmart-receipt-modal active">
          <div className="parksmart-receipt-card">
            <button
              type="button"
              id="closeParkSmartReceipt"
              className="parksmart-receipt-close"
              onClick={() => setActiveReceipt(null)}
            >
              ×
            </button>
            <div className="parksmart-receipt-success">
              <div className="parksmart-receipt-check">✓</div>
              <h2>Payment Successful</h2>
              <p>{activeReceipt.parkingName}</p>
              <strong id="receiptAmountLarge">₹{activeReceipt.amount}</strong>
            </div>
            <div className="parksmart-receipt-line"></div>
            <div className="parksmart-receipt-row"><span>Transaction ID</span><strong>{activeReceipt.txnId}</strong></div>
            <div className="parksmart-receipt-row"><span>Date &amp; Time</span><strong>{activeReceipt.date}</strong></div>
            <div className="parksmart-receipt-row"><span>Payment Method</span><strong>{activeReceipt.method}</strong></div>
            <div className="parksmart-receipt-row"><span>Vehicle Type</span><strong>{activeReceipt.vehicleType}</strong></div>
            <div className="parksmart-receipt-row"><span>Car Number</span><strong>{activeReceipt.carNumber}</strong></div>
            <div className="parksmart-receipt-row"><span>Parking Slot</span><strong>{activeReceipt.slot}</strong></div>
            <div className="parksmart-receipt-row"><span>Duration</span><strong>{activeReceipt.duration}</strong></div>
            <div className="parksmart-receipt-line"></div>
            <div className="parksmart-receipt-total"><span>Total Paid</span><strong>₹{activeReceipt.amount}</strong></div>
            <div className="parksmart-receipt-brand"><strong>ParkSmart</strong><span>Smart Parking System</span></div>
            <button
              type="button"
              className="parksmart-print-receipt"
              onClick={() => window.print()}
            >
              🖨 Print Receipt
            </button>
          </div>
        </div>
      )}

      {/* =====================================================
           PROFILE MODAL
      ====================================================== */}
      {isProfileModalOpen && user && (
        <div id="profileModal" className="dashboard-modal show" style={{ display: "flex" }}>
          <div className="booking-box" style={{ maxWidth: "500px" }}>
            <button
              type="button"
              className="modal-close"
              onClick={() => setIsProfileModalOpen(false)}
            >
              &times;
            </button>
            <div className="booking-title" style={{ marginBottom: "20px" }}>
              <div className="booking-icon" style={{ background: "rgba(0, 217, 166, 0.15)", color: "#00d9a6" }}>
                👤
              </div>
              <div>
                <h2>My Profile</h2>
                <p style={{ color: "#94a3b8", fontSize: "13px" }}>Manage your ParkSmart personal details</p>
              </div>
            </div>

            <form onSubmit={handleUpdateProfile} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "16px",
                  padding: "14px",
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "14px",
                }}
              >
                <div
                  className="large-profile-avatar"
                  style={{
                    width: "54px",
                    height: "54px",
                    fontSize: "22px",
                    borderRadius: "50%",
                    display: "grid",
                    placeItems: "center",
                    background: "linear-gradient(135deg, #00d9a6, #00a8ff)",
                    color: "#02151a",
                    fontWeight: 800,
                  }}
                >
                  {(user.firstName || "D").charAt(0).toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: "16px", color: "#fff" }}>
                    {user.firstName} {user.lastName}
                  </div>
                  <div
                    style={{
                      display: "inline-block",
                      fontSize: "11px",
                      padding: "2px 8px",
                      borderRadius: "20px",
                      background: "rgba(0, 217, 166, 0.15)",
                      color: "#00d9a6",
                      border: "1px solid rgba(0, 217, 166, 0.3)",
                      marginTop: "4px",
                      textTransform: "uppercase",
                    }}
                  >
                    {user.role || "DRIVER"}
                  </div>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label style={{ fontSize: "12px", color: "#94a3b8", fontWeight: 600 }}>First Name</label>
                  <input
                    type="text"
                    value={editFirstName}
                    onChange={(e) => setEditFirstName(e.target.value)}
                    className="pay-input"
                    required
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "10px",
                      color: "#fff",
                      fontSize: "14px",
                    }}
                  />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label style={{ fontSize: "12px", color: "#94a3b8", fontWeight: 600 }}>Last Name</label>
                  <input
                    type="text"
                    value={editLastName}
                    onChange={(e) => setEditLastName(e.target.value)}
                    className="pay-input"
                    required
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "10px",
                      color: "#fff",
                      fontSize: "14px",
                    }}
                  />
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "12px", color: "#94a3b8", fontWeight: 600 }}>Email Address (Account ID)</label>
                <input
                  type="email"
                  value={user.email}
                  disabled
                  className="pay-input"
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    background: "rgba(255,255,255,0.02)",
                    border: "1px solid rgba(255,255,255,0.06)",
                    borderRadius: "10px",
                    color: "#64748b",
                    fontSize: "14px",
                    cursor: "not-allowed",
                  }}
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "12px", color: "#94a3b8", fontWeight: 600 }}>Phone Number</label>
                <input
                  type="tel"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="pay-input"
                  required
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "10px",
                    color: "#fff",
                    fontSize: "14px",
                  }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px" }}>
                <button
                  type="button"
                  onClick={() => setIsProfileModalOpen(false)}
                  style={{
                    padding: "10px 18px",
                    borderRadius: "10px",
                    background: "rgba(255,255,255,0.05)",
                    color: "#94a3b8",
                    border: "1px solid rgba(255,255,255,0.1)",
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="confirm-booking"
                  style={{
                    padding: "10px 22px",
                    borderRadius: "10px",
                    background: "linear-gradient(135deg, #00d9a6, #00a8ff)",
                    color: "#02151a",
                    fontWeight: 700,
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================
           SETTINGS MODAL
      ====================================================== */}
      {isSettingsModalOpen && (
        <div id="settingsModal" className="dashboard-modal show" style={{ display: "flex" }}>
          <div className="booking-box" style={{ maxWidth: "520px", maxHeight: "90vh", overflowY: "auto" }}>
            <button
              type="button"
              className="modal-close"
              onClick={() => setIsSettingsModalOpen(false)}
            >
              &times;
            </button>
            <div className="booking-title" style={{ marginBottom: "20px" }}>
              <div className="booking-icon" style={{ background: "rgba(0, 168, 255, 0.15)", color: "#00a8ff" }}>
                ⚙️
              </div>
              <div>
                <h2>Settings &amp; Preferences</h2>
                <p style={{ color: "#94a3b8", fontSize: "13px" }}>Customize your ParkSmart experience</p>
              </div>
            </div>

            {/* Tab Buttons */}
            <div style={{ display: "flex", gap: "8px", marginBottom: "18px", borderBottom: "1px solid rgba(255,255,255,0.08)", paddingBottom: "10px" }}>
              <button
                type="button"
                className={`settings-tab-btn ${settingsTab === "pref" ? "active" : ""}`}
                onClick={() => setSettingsTab("pref")}
                style={{
                  padding: "7px 16px",
                  borderRadius: "8px",
                  background: settingsTab === "pref" ? "rgba(0, 217, 166, 0.2)" : "rgba(255,255,255,0.05)",
                  color: settingsTab === "pref" ? "#00d9a6" : "#94a3b8",
                  border: settingsTab === "pref" ? "1px solid rgba(0, 217, 166, 0.3)" : "1px solid rgba(255,255,255,0.08)",
                  fontSize: "13px",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Preferences
              </button>
              <button
                type="button"
                className={`settings-tab-btn ${settingsTab === "sec" ? "active" : ""}`}
                onClick={() => setSettingsTab("sec")}
                style={{
                  padding: "7px 16px",
                  borderRadius: "8px",
                  background: settingsTab === "sec" ? "rgba(0, 217, 166, 0.2)" : "rgba(255,255,255,0.05)",
                  color: settingsTab === "sec" ? "#00d9a6" : "#94a3b8",
                  border: settingsTab === "sec" ? "1px solid rgba(0, 217, 166, 0.3)" : "1px solid rgba(255,255,255,0.08)",
                  fontSize: "13px",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Security &amp; Password
              </button>
            </div>

            {/* TAB 1: Preferences */}
            {settingsTab === "pref" && (
              <form onSubmit={handleSaveSettings} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "12px", padding: "14px", display: "flex", flexDirection: "column", gap: "12px" }}>
                  <strong style={{ fontSize: "13px", color: "#cbd5e1", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    Notifications
                  </strong>
                  <label style={{ display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer" }}>
                    <span style={{ fontSize: "13px", color: "#fff" }}>Browser Push Notifications</span>
                    <input
                      type="checkbox"
                      checked={settingBrowserNotif}
                      onChange={(e) => {
                        setSettingBrowserNotif(e.target.checked);
                        if (e.target.checked && typeof window !== "undefined" && "Notification" in window && Notification.permission === "default") {
                          Notification.requestPermission();
                        }
                      }}
                      style={{ accentColor: "#00d9a6", width: "18px", height: "18px", cursor: "pointer" }}
                    />
                  </label>
                  <label style={{ display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer" }}>
                    <span style={{ fontSize: "13px", color: "#fff" }}>Booking Confirmations &amp; Alerts</span>
                    <input
                      type="checkbox"
                      checked={settingBookingAlerts}
                      onChange={(e) => setSettingBookingAlerts(e.target.checked)}
                      style={{ accentColor: "#00d9a6", width: "18px", height: "18px", cursor: "pointer" }}
                    />
                  </label>
                  <label style={{ display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer" }}>
                    <span style={{ fontSize: "13px", color: "#fff" }}>Sound Effects</span>
                    <input
                      type="checkbox"
                      checked={settingSoundEffects}
                      onChange={(e) => setSettingSoundEffects(e.target.checked)}
                      style={{ accentColor: "#00d9a6", width: "18px", height: "18px", cursor: "pointer" }}
                    />
                  </label>
                </div>

                <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "12px", padding: "14px", display: "flex", flexDirection: "column", gap: "12px" }}>
                  <strong style={{ fontSize: "13px", color: "#cbd5e1", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    Default Vehicle
                  </strong>
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <label style={{ fontSize: "12px", color: "#94a3b8" }}>Default Vehicle Number</label>
                    <input
                      type="text"
                      value={settingVehicleNumber}
                      onChange={(e) => setSettingVehicleNumber(e.target.value.toUpperCase())}
                      placeholder="e.g. MH12AB1234"
                      className="pay-input"
                      style={{
                        width: "100%",
                        padding: "10px 14px",
                        background: "rgba(255,255,255,0.05)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: "10px",
                        color: "#fff",
                        fontSize: "14px",
                        textTransform: "uppercase",
                      }}
                    />
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <label style={{ fontSize: "12px", color: "#94a3b8" }}>Default Vehicle Type</label>
                    <select
                      value={settingVehicleType}
                      onChange={(e) => setSettingVehicleType(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "10px 14px",
                        background: "#0c1d2e",
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: "10px",
                        color: "#fff",
                        fontSize: "14px",
                      }}
                    >
                      <option value="Car">Car</option>
                      <option value="Bike">Bike</option>
                      <option value="EV">Electric Vehicle (EV)</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "6px" }}>
                  <button
                    type="submit"
                    className="confirm-booking"
                    style={{
                      padding: "10px 22px",
                      borderRadius: "10px",
                      background: "linear-gradient(135deg, #00d9a6, #00a8ff)",
                      color: "#02151a",
                      fontWeight: 700,
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    Save Preferences
                  </button>
                </div>
              </form>
            )}

            {/* TAB 2: Security & Password */}
            {settingsTab === "sec" && (
              <form onSubmit={handleChangePassword} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label style={{ fontSize: "12px", color: "#94a3b8", fontWeight: 600 }}>Current Password</label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                    required
                    className="pay-input"
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "10px",
                      color: "#fff",
                      fontSize: "14px",
                    }}
                  />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label style={{ fontSize: "12px", color: "#94a3b8", fontWeight: 600 }}>New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Minimum 6 characters"
                    required
                    className="pay-input"
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "10px",
                      color: "#fff",
                      fontSize: "14px",
                    }}
                  />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label style={{ fontSize: "12px", color: "#94a3b8", fontWeight: 600 }}>Confirm New Password</label>
                  <input
                    type="password"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    placeholder="Repeat new password"
                    required
                    className="pay-input"
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "10px",
                      color: "#fff",
                      fontSize: "14px",
                    }}
                  />
                </div>
                <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px" }}>
                  <button
                    type="submit"
                    className="confirm-booking"
                    style={{
                      padding: "10px 22px",
                      borderRadius: "10px",
                      background: "linear-gradient(135deg, #00d9a6, #00a8ff)",
                      color: "#02151a",
                      fontWeight: 700,
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    Change Password
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
