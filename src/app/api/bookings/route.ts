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
      `SELECT b.id, b.booking_code AS bookingCode, b.user_id AS userId,
              b.parking_lot_id AS parkingLotId, b.parking_slot_id AS parkingSlotId,
              p.name AS parkingName, p.city, p.area, s.slot_code AS slotCode,
              b.vehicle_type AS vehicleType, b.car_type AS carType, b.car_number AS carNumber,
              b.duration_hours AS durationHours, b.start_time AS startTime, b.end_time AS endTime,
              b.amount, b.status, b.created_at AS createdAt,
              pay.status AS paymentStatus, pay.transaction_id AS transactionId
       FROM bookings b
       JOIN parking_lots p ON p.id = b.parking_lot_id
       JOIN parking_slots s ON s.id = b.parking_slot_id
       LEFT JOIN payments pay ON pay.booking_id = b.id
       WHERE b.user_id = ?
       ORDER BY b.created_at DESC`,
      [auth.id]
    );

    return NextResponse.json(rows);
  } catch (error: any) {
    console.error("Fetch bookings error:", error);
    return NextResponse.json(
      { message: error.message || "Failed to fetch bookings" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const conn = await pool.getConnection();
  try {
    const auth = getAuthUser(req);
    if (!auth) {
      return NextResponse.json({ message: "Please log in to book a slot" }, { status: 401 });
    }

    const body = await req.json();
    const { parkingLotId, parkingSlotId, vehicleType, carType, carNumber, durationHours } = body;

    if (!parkingLotId || !parkingSlotId || !carNumber) {
      return NextResponse.json(
        { message: "Please fill all required booking details." },
        { status: 400 }
      );
    }

    const duration = Math.max(1, parseInt(durationHours || "2", 10));

    await conn.beginTransaction();

    // Lock the slot row to prevent double-booking
    const [slots]: any = await conn.query(
      "SELECT id, slot_status, slot_code FROM parking_slots WHERE id = ? AND parking_lot_id = ? FOR UPDATE",
      [parkingSlotId, parkingLotId]
    );

    if (slots.length === 0) {
      await conn.rollback();
      return NextResponse.json({ message: "Slot not found" }, { status: 404 });
    }

    const slot = slots[0];
    if (slot.slot_status !== "VACANT") {
      await conn.rollback();
      return NextResponse.json(
        { message: `Slot ${slot.slot_code} was just taken by another user. Please choose another slot.` },
        { status: 409 }
      );
    }

    // Get lot rate
    const [lots]: any = await conn.query(
      "SELECT rate_per_hour FROM parking_lots WHERE id = ?",
      [parkingLotId]
    );
    const rate = lots[0] ? Number(lots[0].rate_per_hour) : 20;
    const totalAmount = rate * duration;

    // Generate unique booking code
    const bookingCode = "PS-" + Math.random().toString(36).substring(2, 8).toUpperCase();
    const startTime = new Date();
    const endTime = new Date(startTime.getTime() + duration * 3600 * 1000);

    // Insert booking
    const [bookingResult]: any = await conn.query(
      `INSERT INTO bookings
       (booking_code, user_id, parking_lot_id, parking_slot_id, vehicle_type, car_type, car_number, duration_hours, start_time, end_time, amount, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'RESERVED')`,
      [
        bookingCode,
        auth.id,
        parkingLotId,
        parkingSlotId,
        vehicleType || "CAR",
        carType || "Standard Sedan",
        carNumber.trim().toUpperCase(),
        duration,
        startTime,
        endTime,
        totalAmount,
      ]
    );

    const bookingId = bookingResult.insertId;

    // Update slot status to RESERVED
    await conn.query(
      "UPDATE parking_slots SET slot_status = 'RESERVED' WHERE id = ?",
      [parkingSlotId]
    );

    // Create payment entry as PAID
    const txnId = "TXN-" + Math.random().toString(36).substring(2, 10).toUpperCase();
    await conn.query(
      `INSERT INTO payments (booking_id, amount, currency, status, payment_method, transaction_id, paid_at)
       VALUES (?, ?, 'INR', 'PAID', 'UPI/Card', ?, NOW())`,
      [bookingId, totalAmount, txnId]
    );

    // Create user notification
    await conn.query(
      `INSERT INTO notifications (user_id, title, message)
       VALUES (?, 'Booking Confirmed!', ?)`,
      [
        auth.id,
        `Your reservation ${bookingCode} for Slot ${slot.slot_code} is confirmed. Amount paid: ₹${totalAmount}.`,
      ]
    );

    await conn.commit();

    return NextResponse.json(
      {
        message: "Slot reserved successfully!",
        booking: {
          id: bookingId,
          bookingCode,
          slotCode: slot.slot_code,
          amount: totalAmount,
          startTime,
          endTime,
          transactionId: txnId,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    await conn.rollback();
    console.error("Booking creation error:", error);
    return NextResponse.json(
      { message: error.message || "Failed to reserve slot." },
      { status: 500 }
    );
  } finally {
    conn.release();
  }
}
