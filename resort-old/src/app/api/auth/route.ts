import { NextRequest, NextResponse } from "next/server";
import { registerUser, loginUser } from "@/lib/auth";

// POST /api/auth - Handle user registration and login
export async function POST(req: NextRequest) {
  try {
    const { action, name, email, password, profileImage } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 },
      );
    }

    if (action === "register") {
      if (!name) {
        return NextResponse.json(
          { error: "Name is required for registration" },
          { status: 400 },
        );
      }

      const user = await registerUser(name, email, password, profileImage);
      return NextResponse.json({ user });
    } else if (action === "login") {
      const user = await loginUser(email, password);
      return NextResponse.json({ user });
    } else {
      return NextResponse.json(
        { error: 'Invalid action. Must be "login" or "register"' },
        { status: 400 },
      );
    }
  } catch (error) {
    console.error("Auth API error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "An error occurred" },
      { status: 500 },
    );
  }
}
