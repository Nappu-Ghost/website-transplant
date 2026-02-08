// app/api/rooms/route.ts

// Import necessary modules from Prisma and Next.js.
// PrismaClient is used to interact with the database.
// NextRequest and NextResponse are used to handle incoming requests and construct responses in the Next.js App Router.
import { NextRequest, NextResponse } from "next/server";
import { prisma } from '@/lib/prisma';

// GET /api/rooms - Get all rooms or rooms for a specific hotel
// This function handles HTTP GET requests to /api/rooms. It retrieves all rooms or rooms for a specific hotel from the database.
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const hotelId = searchParams.get('hotelId');

    const rooms = await prisma.room.findMany({
      where: hotelId ? {
        hotelId: parseInt(hotelId)
      } : undefined,
      include: {
        hotel: true,
      },
    });
    return NextResponse.json(rooms);
  } catch (error) {
    console.error('Error fetching rooms:', error);
    return NextResponse.json({ error: 'Failed to fetch rooms' }, { status: 500 });
  }
}

// POST /api/rooms - Create a new room
// This function handles HTTP POST requests to /api/rooms. It creates a new room in the database.
export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    const room = await prisma.room.create({
      data: {
        name: data.name,
        hotelId: data.hotelId,
        type: data.type,
        price: data.price,
        capacity: data.capacity,
        description: data.description,
        imageUrl: data.imageUrl,
        available: data.available,
        isPremium: data.isPremium,
      },
      include: {
        hotel: true,
      },
    });

    return NextResponse.json(room);
  } catch (error) {
    console.error('Error creating room:', error);
    return NextResponse.json({ error: 'Failed to create room' }, { status: 500 });
  }
}

// PUT /api/rooms/[id] - Update a room
// This function handles HTTP PUT requests to /api/rooms/[id]. It updates an existing room in the database.
export async function PUT(req: NextRequest) {
  // Use a try...catch block for error handling.
  try {
    // Extract the room ID from the URL query parameters.
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    // Validate that the room ID is provided in the URL.
    // If the ID is missing, return a 400 Bad Request error.
    if (!id) {
      return NextResponse.json(
        { error: "Room ID is required" },
        { status: 400 },
      );
    }

    // Convert the room ID to an integer.
    const roomId = parseInt(id, 10);
    // Validate that the room ID is a valid number.
    // If the ID is not a valid number, return a 400 Bad Request error.
    if (isNaN(roomId)) {
      return NextResponse.json({ error: "Invalid room ID" }, { status: 400 });
    }

    // Extract updated room data from the request body.
    const { name, type, description, price, capacity, available, isPremium } =
      await req.json();

    // Check if a room with the given ID exists in the database.
    // If the room doesn't exist, return a 404 Not Found error.
    const existingRoom = await prisma.room.findUnique({
      where: { id: roomId },
    });

    if (!existingRoom) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    // Convert price and capacity to numbers, handling undefined values.
    const priceNum = price !== undefined ? Number(price) : undefined;
    const capacityNum = capacity !== undefined ? Number(capacity) : undefined;
    const availableBool =
      typeof available === "boolean" ? available : undefined;
    const isPremiumBool =
      typeof isPremium === "boolean" ? isPremium : undefined;

    // Update the room record in the database using Prisma's update method.
    const updatedRoom = await prisma.room.update({
      where: { id: roomId }, // Specify which room to update.
      data: {
        // Specify the fields to update.
        name, // Update 'name' if provided.
        type, // Update 'type' if provided.
        description, // Update 'description' if provided
        ...(priceNum !== undefined && { price: priceNum }), // Conditionally update 'price' only if priceNum is defined.
        ...(capacityNum !== undefined && { capacity: capacityNum }), // Conditionally update capacity only if capacity is defined
        ...(availableBool !== undefined && { available: availableBool }), // Conditionally update 'available' only if available is defined.
        ...(isPremiumBool !== undefined && { isPremium: isPremiumBool }), // Conditionally update 'isPremium' only if isPremium is defined.
      },
      include: {
        hotel: true,
      },
    });

    // Return the updated room as a JSON response with a 200 OK status.
    return NextResponse.json(updatedRoom);
  } catch (error) {
    // If any error occurs, log the error and return a 500 Internal Server Error response.
    console.error("Failed to update room:", error);
    return NextResponse.json(
      { error: "Failed to update room" },
      { status: 500 },
    );
  }
}

// DELETE /api/rooms/[id] - Delete a room
// This function handles HTTP DELETE requests to /api/rooms/[id]. It deletes a room from the database.
export async function DELETE(req: NextRequest) {
  // Use a try...catch block for error handling.
  try {
    // Extract the room ID from the URL query parameters.
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    // Validate that the room ID is provided.
    // If the ID is missing, return a 400 Bad Request error.
    if (!id) {
      return NextResponse.json(
        { error: "Room ID is required" },
        { status: 400 },
      );
    }

    // Convert the room ID to an integer.
    const roomId = parseInt(id, 10);
    // Validate that the room ID is a valid number.
    // If the ID is not a valid number, return a 400 Bad Request error.
    if (isNaN(roomId)) {
      return NextResponse.json({ error: "Invalid room ID" }, { status: 400 });
    }
    // Check if a room with the given ID exists in the database.
    // If the room doesn't exist, return a 404 Not Found error.
    const existingRoom = await prisma.room.findUnique({
      where: { id: roomId },
    });

    if (!existingRoom) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    // IMPORTANT: This comment highlights a crucial consideration for data integrity.
    // Before deleting a room, you need to decide how to handle related bookings.
    // You could either delete them (cascading delete) or prevent room deletion if bookings exist.

    // Delete the room record from the database using Prisma's delete method.
    await prisma.room.delete({
      where: { id: roomId }, // Specify which room to delete.
    });

    // Return a success message as a JSON response with a 200 OK status (or 204 No Content).
    return NextResponse.json(
      { message: "Room deleted successfully" },
      { status: 200 },
    );
  } catch (error) {
    // If any error occurs, log the error and return a 500 Internal Server Error response.
    console.error("Failed to delete room:", error);
    return NextResponse.json(
      { error: "Failed to delete room" },
      { status: 500 },
    );
  }
}
