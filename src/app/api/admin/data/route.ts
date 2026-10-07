import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { getAuthUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const auth = getAuthUser(req);
    if (!auth || !["ADMIN", "OPERATOR"].includes(auth.role)) {
      return NextResponse.json({ message: "Admin access required" }, { status: 403 });
    }

    const [users]: any = await pool.query(
      "SELECT id, first_name AS firstName, last_name AS lastName, email, phone, role, created_at AS createdAt FROM users ORDER BY created_at DESC"
    );

    const [parking]: any = await pool.query(`
      SELECT p.id, p.name, p.state, p.city, p.area, p.capacity, p.rate_per_hour AS rate, p.active,
             COUNT(s.id) AS slotCount,
             COALESCE(SUM(s.slot_status = 'VACANT'), 0) AS vacant,
             COALESCE(SUM(s.slot_status = 'RESERVED'), 0) AS reserved,
             COALESCE(SUM(s.slot_status = 'OCCUPIED'), 0) AS occupied,
             COALESCE(SUM(s.slot_status = 'MAINTENANCE'), 0) AS maintenance
      FROM parking_lots p
      LEFT JOIN parking_slots s ON s.parking_lot_id = p.id
      GROUP BY p.id
      ORDER BY p.name ASC
    `);

    const [slots]: any = await pool.query(`
      SELECT s.id, s.slot_code AS slotCode, s.slot_status AS status, s.vehicle_type AS vehicleType,
             s.updated_at AS updatedAt, p.id AS parkingId, p.name AS parkingName, p.city, p.area
      FROM parking_slots s
      JOIN parking_lots p ON p.id = s.parking_lot_id
      ORDER BY p.name, s.slot_code
    `);

    const [bookings]: any = await pool.query(`
      SELECT b.id, b.booking_code AS bookingCode, b.status, b.vehicle_type AS vehicleType,
             b.car_type AS carType, b.car_number AS carNumber, b.duration_hours AS hours,
             b.start_time AS startTime, b.end_time AS endTime, b.amount, b.created_at AS createdAt,
             u.first_name AS firstName, u.last_name AS lastName, u.email, u.phone,
             p.name AS parkingName, s.slot_code AS slotCode,
             pay.status AS paymentStatus
      FROM bookings b
      JOIN users u ON u.id = b.user_id
      JOIN parking_lots p ON p.id = b.parking_lot_id
      JOIN parking_slots s ON s.id = b.parking_slot_id
      LEFT JOIN payments pay ON pay.booking_id = b.id
      ORDER BY b.created_at DESC
      LIMIT 100
    `);

    const [payments]: any = await pool.query(`
      SELECT pay.id, pay.transaction_id AS transactionId, pay.amount, pay.payment_method AS method,
             pay.status, pay.paid_at AS paidAt, pay.created_at AS createdAt,
             b.booking_code AS bookingCode, u.first_name AS firstName, u.last_name AS lastName
      FROM payments pay
      JOIN bookings b ON b.id = pay.booking_id
      JOIN users u ON u.id = b.user_id
      ORDER BY pay.created_at DESC
      LIMIT 100
    `);

    const [accessLogs]: any = await pool.query(`
      SELECT a.id, a.event_time AS eventTime, a.event_type AS eventType,
             a.detected_plate AS detectedPlate, a.expected_plate AS expectedPlate,
             a.plate_match AS plateMatch, a.ocr_confidence AS ocrConfidence,
             b.booking_code AS bookingCode, u.first_name AS firstName, u.last_name AS lastName,
             p.name AS parkingName, s.slot_code AS slotCode
      FROM access_logs a
      JOIN bookings b ON b.id = a.booking_id
      JOIN users u ON u.id = b.user_id
      JOIN parking_lots p ON p.id = b.parking_lot_id
      JOIN parking_slots s ON s.id = b.parking_slot_id
      ORDER BY a.event_time DESC
      LIMIT 100
    `);

    return NextResponse.json({
      users,
      parking,
      slots,
      bookings,
      payments,
      accessLogs,
    });
  } catch (error: any) {
    console.error("Admin data error:", error);
    return NextResponse.json(
      { message: error.message || "Failed to load admin data" },
      { status: 500 }
    );
  }
}
