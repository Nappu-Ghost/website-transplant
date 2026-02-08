import { NextRequest, NextResponse } from "next/server";
import { prisma } from '@/lib/prisma';
import { getUserById } from "@/lib/auth";
import bcrypt from "bcryptjs";

// GET /api/users - Get all users (admin only)
// POST /api/users - Create a new user
export async function POST(req: NextRequest) {
  try {
    const { name, email, password, role, profileImage } = await req.json();

    // Validate required fields
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email, and password are required" },
        { status: 400 },
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 },
      );
    }

    // Check if user with email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 400 },
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role || "USER",
        profileImage: profileImage || "/profile.svg", // Use provided image or default
      },
    });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = newUser;

    return NextResponse.json(userWithoutPassword, { status: 201 });
  } catch (error) {
    console.error("Create user error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create user" },
      { status: 500 },
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    // Get the user from the request (would be from session in a real app)
    const authHeader = req.headers.get("authorization");
    let userId: number | null = null;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7);
      // In a real app, you would verify the token
      // For now, we'll just parse the user ID from the token
      userId = parseInt(token, 10);
    }

    // Check if user exists and is an admin
    if (!userId) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    const currentUser = await getUserById(userId);

    if (!currentUser || currentUser.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized. Admin access required" },
        { status: 403 },
      );
    }

    // Get all users
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        profileImage: true,
        createdAt: true,
        updatedAt: true,
        // Exclude password
        password: false,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ users });
  } catch (error) {
    console.error("Get users error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "An error occurred" },
      { status: 500 },
    );
  }
}
