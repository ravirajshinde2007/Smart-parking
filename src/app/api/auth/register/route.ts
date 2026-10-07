import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { hashPassword, signToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { firstName, lastName, email, phone, password } = body;

    if (!firstName || !lastName || !email || !phone || !password) {
      return NextResponse.json(
        { message: "All registration fields are required." },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { message: "Password must contain at least 6 characters." },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();

    // Check if email already exists
    const [existing]: any = await pool.query(
      "SELECT id FROM users WHERE email = ? LIMIT 1",
      [cleanEmail]
    );

    if (existing.length > 0) {
      return NextResponse.json(
        { message: "An account with this email address already exists." },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);
    const [result]: any = await pool.query(
      `INSERT INTO users (first_name, last_name, email, phone, password_hash, role)
       VALUES (?, ?, ?, ?, ?, 'USER')`,
      [firstName.trim(), lastName.trim(), cleanEmail, phone.trim(), passwordHash]
    );

    const user = {
      id: result.insertId,
      email: cleanEmail,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      phone: phone.trim(),
      role: "USER" as const,
    };

    const token = signToken({ id: user.id, email: user.email, role: user.role });

    return NextResponse.json(
      {
        message: "Account created successfully!",
        token,
        user,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Register error:", error);
    return NextResponse.json(
      { message: error.message || "Failed to create account." },
      { status: 500 }
    );
  }
}
