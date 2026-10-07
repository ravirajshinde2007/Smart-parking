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
      `SELECT a.id, a.booking_id AS bookingId, b.booking_code AS bookingCode,
              a.event_type AS eventType, a.detected_plate AS detectedPlate,
              a.expected_plate AS expectedPlate, a.plate_match AS plateMatch,
              a.ocr_confidence AS ocrConfidence, a.event_time AS eventTime,
              a.notes, p.name AS parkingName, s.slot_code AS slotCode
       FROM access_logs a
       JOIN bookings b ON b.id = a.booking_id
       JOIN parking_lots p ON p.id = b.parking_lot_id
       JOIN parking_slots s ON s.id = b.parking_slot_id
       WHERE b.user_id = ?
       ORDER BY a.event_time DESC`,
      [auth.id]
    );

    return NextResponse.json(rows);
  } catch (error: any) {
    console.error("Fetch access logs error:", error);
    return NextResponse.json(
      { message: error.message || "Failed to fetch access logs" },
      { status: 500 }
    );
  }
}
