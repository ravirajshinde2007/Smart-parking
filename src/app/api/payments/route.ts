import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { getAuthUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const auth = getAuthUser(req);
    if (!auth) {
      return NextResponse.json({ message: "Authentication required" }, { status: 401 });
    }

    const [rows]: any = await pool.query(
      `SELECT p.id, p.booking_id AS bookingId, b.booking_code AS bookingCode,
              p.amount, p.currency, p.status, p.payment_method AS paymentMethod,
              p.transaction_id AS transactionId, p.paid_at AS paidAt,
              p.created_at AS createdAt
       FROM payments p
       JOIN bookings b ON b.id = p.booking_id
       WHERE b.user_id = ?
       ORDER BY p.created_at DESC`,
      [auth.id]
    );

    return NextResponse.json(rows);
  } catch (error: any) {
    console.error("Fetch payments error:", error);
    return NextResponse.json(
      { message: error.message || "Failed to fetch payments" },
      { status: 500 }
    );
  }
}
