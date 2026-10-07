import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { getAuthUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const auth = getAuthUser(req);
    if (!auth) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const [rows]: any = await pool.query(
      "SELECT id, first_name, last_name, email, phone, role FROM users WHERE id = ? LIMIT 1",
      [auth.id]
    );

    const user = rows[0];
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (error: any) {
    console.error("Get user error:", error);
    return NextResponse.json(
      { message: error.message || "Failed to fetch user" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const auth = getAuthUser(req);
    if (!auth) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { firstName, lastName, phone } = body;
    if (!firstName || !lastName || !phone) {
      return NextResponse.json({ message: "First name, last name, and phone number are required." }, { status: 400 });
    }

    await pool.query(
      "UPDATE users SET first_name = ?, last_name = ?, phone = ? WHERE id = ?",
      [firstName.trim(), lastName.trim(), phone.trim(), auth.id]
    );

    const [rows]: any = await pool.query(
      "SELECT id, first_name, last_name, email, phone, role FROM users WHERE id = ? LIMIT 1",
      [auth.id]
    );

    const user = rows[0];
    return NextResponse.json({
      message: "Profile updated successfully.",
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (error: any) {
    console.error("Update user error:", error);
    return NextResponse.json(
      { message: error.message || "Failed to update profile" },
      { status: 500 }
    );
  }
}

