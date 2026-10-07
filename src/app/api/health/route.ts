import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET() {
  try {
    await pool.query("SELECT 1");
    return NextResponse.json({
      ok: true,
      service: "ParkSmart Next.js API",
      database: "TiDB Cloud Connected",
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Health check error:", error);
    return NextResponse.json(
      {
        ok: false,
        service: "ParkSmart Next.js API",
        database: "Unavailable",
        error: error.message || "Connection failed",
      },
      { status: 503 }
    );
  }
}
