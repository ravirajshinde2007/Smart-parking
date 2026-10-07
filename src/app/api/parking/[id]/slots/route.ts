import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const lotId = parseInt(id, 10);

    if (isNaN(lotId)) {
      return NextResponse.json({ message: "Invalid parking lot ID" }, { status: 400 });
    }

    const [slots]: any = await pool.query(
      `SELECT id, parking_lot_id AS parkingLotId, slot_code AS slotCode,
              slot_status AS slotStatus, vehicle_type AS vehicleType,
              updated_at AS updatedAt
       FROM parking_slots
       WHERE parking_lot_id = ?
       ORDER BY slot_code ASC`,
      [lotId]
    );

    const [lot]: any = await pool.query(
      "SELECT id, name, rate_per_hour AS rate, city, area FROM parking_lots WHERE id = ? LIMIT 1",
      [lotId]
    );

    if (lot.length === 0) {
      return NextResponse.json({ message: "Parking lot not found" }, { status: 404 });
    }

    return NextResponse.json({
      lot: {
        id: lot[0].id,
        name: lot[0].name,
        rate: Number(lot[0].rate),
        city: lot[0].city,
        area: lot[0].area,
      },
      slots,
    });
  } catch (error: any) {
    console.error("Fetch slots error:", error);
    return NextResponse.json(
      { message: error.message || "Failed to fetch parking slots" },
      { status: 500 }
    );
  }
}
