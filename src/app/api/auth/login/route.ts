import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { comparePassword, hashPassword, signToken } from "@/lib/auth";

// Automatically provision or verify default admin if needed
async function ensureAdminExists() {
  const adminEmail = (process.env.ADMIN_EMAIL || "admin@gmail.com").trim().toLowerCase();
  const adminPass = process.env.ADMIN_PASSWORD || "raviraj@2007";

  try {
    const [rows]: any = await pool.query(
      "SELECT id FROM users WHERE email = ? LIMIT 1",
      [adminEmail]
    );

    if (rows.length === 0) {
      const hash = await hashPassword(adminPass);
      await pool.query(
        `INSERT INTO users (first_name, last_name, email, phone, password_hash, role)
         VALUES ('Admin', 'Administrator', ?, '9999999999', ?, 'ADMIN')`,
        [adminEmail, hash]
      );
    }
  } catch (e) {
    // Non-blocking
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { message: "Please provide both email and password." },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();

    // Ensure admin account exists
    if (cleanEmail === (process.env.ADMIN_EMAIL || "admin@gmail.com").toLowerCase()) {
      await ensureAdminExists();
    }

    const [rows]: any = await pool.query(
      "SELECT id, first_name, last_name, email, phone, password_hash, role FROM users WHERE email = ? LIMIT 1",
      [cleanEmail]
    );

    const user = rows[0];

    if (!user) {
      return NextResponse.json(
        { message: "Invalid email or password." },
        { status: 401 }
      );
    }

    const isMatch = await comparePassword(password, user.password_hash);
    if (!isMatch) {
      return NextResponse.json(
        { message: "Invalid email or password." },
        { status: 401 }
      );
    }

    const payload = {
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      phone: user.phone,
      role: user.role,
    };

    const token = signToken({
      id: payload.id,
      email: payload.email,
      role: payload.role,
    });

    return NextResponse.json({
      message: "Login successful!",
      token,
      user: payload,
    });
  } catch (error: any) {
    console.error("Login error:", error);
    return NextResponse.json(
      { message: error.message || "Login failed. Please check credentials." },
      { status: 500 }
    );
  }
}
