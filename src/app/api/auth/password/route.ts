import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { getAuthUser, comparePassword, hashPassword } from "@/lib/auth";

export async function PUT(req: NextRequest) {
  try {
    const auth = getAuthUser(req);
    if (!auth) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { currentPassword, newPassword } = body;

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { message: "Current password and new password are required." },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { message: "New password must be at least 6 characters." },
        { status: 400 }
      );
    }

    const [rows]: any = await pool.query(
      "SELECT password_hash FROM users WHERE id = ? LIMIT 1",
      [auth.id]
    );

    if (!rows.length) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const isMatch = await comparePassword(currentPassword, rows[0].password_hash);
    if (!isMatch) {
      return NextResponse.json(
        { message: "Current password is incorrect." },
        { status: 400 }
      );
    }

    const newHash = await hashPassword(newPassword);
    await pool.query("UPDATE users SET password_hash = ? WHERE id = ?", [newHash, auth.id]);

    return NextResponse.json({ message: "Password updated successfully." });
  } catch (error: any) {
    console.error("Change password error:", error);
    return NextResponse.json(
      { message: error.message || "Failed to update password" },
      { status: 500 }
    );
  }
}
