import { prisma } from './prisma';
import bcrypt from "bcryptjs";
import { User } from "@/types/user";

// Register a new user
export async function registerUser(
  name: string,
  email: string,
  password: string,
  profileImage?: string,
) {
  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new Error("User with this email already exists");
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the user with default USER role
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        profileImage: profileImage || "/profile.svg",
        role: "USER", // Set default role to USER
      },
    });

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  } catch (error) {
    console.error("Registration error:", error);
    throw error;
  }
}

// Login a user
export async function loginUser(email: string, password: string) {
  try {
    // Find the user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new Error("Invalid email or password");
    }

    // Compare passwords
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new Error("Invalid email or password");
    }

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
}

// Get user by ID
export async function getUserById(id: number) {
  try {
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return null;
    }

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  } catch (error) {
    console.error("Get user error:", error);
    throw error;
  }
}
