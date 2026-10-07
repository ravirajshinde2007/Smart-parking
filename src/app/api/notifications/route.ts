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
      `SELECT id, user_id AS userId, title, message, is_read AS isRead, created_at AS createdAt
       FROM notifications
       WHERE user_id = ?
       ORDER BY created_at DESC
       LIMIT 30`,
      [auth.id]
    );

    return NextResponse.json(rows);
  } catch (error: any) {
    console.error("Fetch notifications error:", error);
    return NextResponse.json(
      { message: error.message || "Failed to fetch notifications" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = getAuthUser(req);
    if (!auth) {
      return NextResponse.json({ message: "Authentication required" }, { status: 401 });
    }

    const body = await req.json();
    const { id } = body;

    if (id) {
      await pool.query("UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?", [
        id,
        auth.id,
      ]);
    } else {
      await pool.query("UPDATE notifications SET is_read = 1 WHERE user_id = ?", [auth.id]);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Update notification error:", error);
    return NextResponse.json(
      { message: error.message || "Failed to update notification" },
      { status: 500 }
    );
  }
}
