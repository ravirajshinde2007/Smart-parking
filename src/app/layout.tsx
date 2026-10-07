import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ParkSmart — Smart Cloud Parking System",
  description: "Next-Gen AI-Powered Smart Parking with real-time bay visualizer and TiDB Cloud integration",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-slate-950 text-slate-100 antialiased selection:bg-emerald-500 selection:text-slate-950">
        {children}
      </body>
    </html>
  );
}
