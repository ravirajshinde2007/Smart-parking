import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const city = searchParams.get("city");
    const query = searchParams.get("q");

    let sql = `
      SELECT p.id, p.name, p.state, p.city, p.area, p.locality,
             p.latitude, p.longitude, p.capacity, p.rate_per_hour AS rate,
             p.active,
             COUNT(s.id) AS totalSlots,
             COALESCE(SUM(s.slot_status = 'VACANT'), 0) AS vacant,
             COALESCE(SUM(s.slot_status = 'RESERVED'), 0) AS reserved,
             COALESCE(SUM(s.slot_status = 'OCCUPIED'), 0) AS occupied,
             COALESCE(SUM(s.slot_status = 'MAINTENANCE'), 0) AS maintenance
      FROM parking_lots p
      LEFT JOIN parking_slots s ON s.parking_lot_id = p.id
      WHERE p.active = 1
    `;
    const params: any[] = [];

    if (city && city.toLowerCase() !== "all") {
      sql += " AND LOWER(p.city) = ?";
      params.push(city.toLowerCase());
    }

    if (query) {
      sql += " AND (LOWER(p.name) LIKE ? OR LOWER(p.area) LIKE ? OR LOWER(p.city) LIKE ?)";
      const pattern = `%${query.toLowerCase()}%`;
      params.push(pattern, pattern, pattern);
    }

    sql += " GROUP BY p.id ORDER BY p.name ASC";

    const [rows]: any = await pool.query(sql, params);

    const formatted = rows.map((r: any) => ({
      id: r.id,
      name: r.name,
      state: r.state,
      city: r.city,
      area: r.area,
      locality: r.locality,
      latitude: Number(r.latitude),
      longitude: Number(r.longitude),
      capacity: Number(r.capacity),
      rate: Number(r.rate),
      active: Boolean(r.active),
      totalSlots: Number(r.totalSlots),
      vacant: Number(r.vacant),
      reserved: Number(r.reserved),
      occupied: Number(r.occupied),
      maintenance: Number(r.maintenance),
    }));

    return NextResponse.json(formatted);
  } catch (error: any) {
    console.error("Fetch parking lots error:", error);
    return NextResponse.json(
      { message: error.message || "Failed to fetch parking locations" },
      { status: 500 }
    );
  }
}
