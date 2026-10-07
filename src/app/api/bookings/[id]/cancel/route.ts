import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { getAuthUser } from "@/lib/auth";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const conn = await pool.getConnection();
  try {
    const auth = getAuthUser(req);
    if (!auth) {
      return NextResponse.json({ message: "Authentication required" }, { status: 401 });
    }

    const { id } = await params;
    const bookingId = parseInt(id, 10);

    await conn.beginTransaction();

    const [rows]: any = await conn.query(
      "SELECT id, parking_slot_id, status FROM bookings WHERE id = ? AND user_id = ? FOR UPDATE",
      [bookingId, auth.id]
    );

    if (rows.length === 0) {
      await conn.rollback();
      return NextResponse.json({ message: "Booking not found" }, { status: 404 });
    }

    const booking = rows[0];
    if (booking.status !== "RESERVED") {
      await conn.rollback();
      return NextResponse.json(
        { message: "Only reserved bookings can be cancelled." },
        { status: 400 }
      );
    }

    // Update booking status
    await conn.query("UPDATE bookings SET status = 'CANCELLED' WHERE id = ?", [bookingId]);

    // Free slot back to VACANT
    await conn.query("UPDATE parking_slots SET slot_status = 'VACANT' WHERE id = ?", [
      booking.parking_slot_id,
    ]);

    await conn.commit();

    return NextResponse.json({ message: "Booking cancelled and slot released." });
  } catch (error: any) {
    await conn.rollback();
    console.error("Cancel booking error:", error);
    return NextResponse.json(
      { message: error.message || "Failed to cancel booking" },
      { status: 500 }
    );
  } finally {
    conn.release();
  }
}
