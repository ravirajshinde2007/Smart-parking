import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { getAuthUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const auth = getAuthUser(req);
    if (!auth || !["ADMIN", "OPERATOR"].includes(auth.role)) {
      return NextResponse.json({ message: "Admin access required" }, { status: 403 });
    }

    const [[users]]: any = await pool.query(
      "SELECT COUNT(*) AS total FROM users WHERE role = 'USER'"
    );
    const [[lots]]: any = await pool.query("SELECT COUNT(*) AS total FROM parking_lots");
    const [[slots]]: any = await pool.query("SELECT COUNT(*) AS total FROM parking_slots");
    const [[vacant]]: any = await pool.query(
      "SELECT COUNT(*) AS total FROM parking_slots WHERE slot_status = 'VACANT'"
    );
    const [[occupied]]: any = await pool.query(
      "SELECT COUNT(*) AS total FROM parking_slots WHERE slot_status = 'OCCUPIED'"
    );
    const [[reserved]]: any = await pool.query(
      "SELECT COUNT(*) AS total FROM parking_slots WHERE slot_status = 'RESERVED'"
    );
    const [[maintenance]]: any = await pool.query(
      "SELECT COUNT(*) AS total FROM parking_slots WHERE slot_status = 'MAINTENANCE'"
    );
    const [[bookings]]: any = await pool.query("SELECT COUNT(*) AS total FROM bookings");
    const [[activeBookings]]: any = await pool.query(
      "SELECT COUNT(*) AS total FROM bookings WHERE status IN ('RESERVED', 'PARKED', 'ENTRY_REVIEW', 'EXIT_REVIEW')"
    );
    const [[completed]]: any = await pool.query(
      "SELECT COUNT(*) AS total FROM bookings WHERE status = 'COMPLETED'"
    );
    const [[revenue]]: any = await pool.query(
      "SELECT COALESCE(SUM(amount), 0) AS total FROM payments WHERE status = 'PAID'"
    );
    const [[pendingPayments]]: any = await pool.query(
      "SELECT COALESCE(SUM(amount), 0) AS total FROM payments WHERE status = 'PENDING'"
    );

    return NextResponse.json({
      users: Number(users.total),
      lots: Number(lots.total),
      slots: Number(slots.total),
      vacant: Number(vacant.total),
      occupied: Number(occupied.total),
      reserved: Number(reserved.total),
      maintenance: Number(maintenance.total),
      bookings: Number(bookings.total),
      activeBookings: Number(activeBookings.total),
      completed: Number(completed.total),
      revenue: Number(revenue.total),
      pendingPayments: Number(pendingPayments.total),
    });
  } catch (error: any) {
    console.error("Admin summary error:", error);
    return NextResponse.json(
      { message: error.message || "Failed to load admin summary" },
      { status: 500 }
    );
  }
}
