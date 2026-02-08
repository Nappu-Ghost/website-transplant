import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getUserById } from "@/lib/auth";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// GET /api/users/[id] - Get a specific user
// PUT /api/users/[id] - Update a specific user
// DELETE /api/users/[id] - Delete a specific user

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = parseInt(params.id, 10);
    if (isNaN(userId)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }

    // Get the user from the request (would be from session in a real app)
    const authHeader = req.headers.get("authorization");
    let requestUserId: number | null = null;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7);
      requestUserId = parseInt(token, 10);
    }

    // Check if user exists and is authorized
    if (!requestUserId) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const requestUser = await getUserById(requestUserId);

    // Only allow admins or the user themselves to access their data
    if (!requestUser || (requestUser.role !== "ADMIN" && requestUser.id !== userId)) {
      return NextResponse.json(
        { error: "Unauthorized access" },
        { status: 403 }
      );
    }

    // Get the user
    const user = await prisma.user.findUnique({
      where: { id: userId },
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
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Get user error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "An error occurred" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = parseInt(params.id, 10);
    if (isNaN(userId)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }

    // Get the user from the request (would be from session in a real app)
    const authHeader = req.headers.get("authorization");
    let requestUserId: number | null = null;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7);
      requestUserId = parseInt(token, 10);
    }

    // Check if user exists and is authorized
    if (!requestUserId) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const requestUser = await getUserById(requestUserId);

    // Only allow admins to update users
    if (!requestUser || requestUser.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized. Admin access required" },
        { status: 403 }
      );
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get update data
    const { name, email, password, role, profileImage } = await req.json();
    
    // Prepare update data
    const updateData: any = {};
    
    if (name !== undefined) updateData.name = name;
    if (profileImage !== undefined) updateData.profileImage = profileImage;
    if (email !== undefined) {
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return NextResponse.json(
          { error: "Invalid email format" },
          { status: 400 }
        );
      }
      
      // Check if email is already taken by another user
      if (email !== existingUser.email) {
        const emailExists = await prisma.user.findUnique({
          where: { email },
        });
        
        if (emailExists) {
          return NextResponse.json(
            { error: "Email already registered to another user" },
            { status: 400 }
          );
        }
      }
      
      updateData.email = email;
    }
    
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }
    
    if (role !== undefined) updateData.role = role;

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
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
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Update user error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update user" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = parseInt(params.id, 10);
    if (isNaN(userId)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }

    // Get the user from the request (would be from session in a real app)
    const authHeader = req.headers.get("authorization");
    let requestUserId: number | null = null;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7);
      requestUserId = parseInt(token, 10);
    }

    // Check if user exists and is authorized
    if (!requestUserId) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const requestUser = await getUserById(requestUserId);

    // Only allow admins to delete users
    if (!requestUser || requestUser.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized. Admin access required" },
        { status: 403 }
      );
    }

    // Prevent admins from deleting themselves
    if (userId === requestUserId) {
      return NextResponse.json(
        { error: "You cannot delete your own account" },
        { status: 400 }
      );
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Delete user
    await prisma.user.delete({
      where: { id: userId },
    });

    return NextResponse.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Delete user error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to delete user" },
      { status: 500 }
    );
  }
}