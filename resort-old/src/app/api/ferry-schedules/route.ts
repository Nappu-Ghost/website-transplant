import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

// GET /api/ferry-schedules - Get all ferry schedules
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const ferryId = searchParams.get("ferryId");

    const schedules = await prisma.ferrySchedule.findMany({
      where: ferryId ? { ferryId: parseInt(ferryId, 10) } : undefined,
      include: {
        ferry: true,
      },
    });

    return NextResponse.json(schedules);
  } catch (error) {
    console.error("Failed to fetch ferry schedules:", error);
    return NextResponse.json(
      { error: "Failed to fetch ferry schedules" },
      { status: 500 },
    );
  }
}

// POST /api/ferry-schedules - Create a new ferry schedule
export async function POST(req: NextRequest) {
  try {
    const { ferryId, departure, arrival, route, price, available } =
      await req.json();

    if (!ferryId || !departure || !arrival || !route || price === undefined) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: ferryId, departure, arrival, route, price",
        },
        { status: 400 },
      );
    }

    // Validate price is non-negative
    if (typeof price !== "number" || price < 0) {
      return NextResponse.json(
        { error: "Price must be a non-negative number" },
        { status: 400 },
      );
    }

    // Check if ferry exists
    const ferry = await prisma.ferry.findUnique({
      where: { id: ferryId },
    });

    if (!ferry) {
      return NextResponse.json({ error: "Ferry not found" }, { status: 404 });
    }

    const newSchedule = await prisma.ferrySchedule.create({
      data: {
        ferryId,
        departure: new Date(departure),
        arrival: new Date(arrival),
        route,
        price,
        available: available ?? true,
      },
    });

    return NextResponse.json(newSchedule, { status: 201 });
  } catch (error) {
    console.error("Failed to create ferry schedule:", error);
    return NextResponse.json(
      { error: "Failed to create ferry schedule" },
      { status: 500 },
    );
  }
}

// PUT /api/ferry-schedules - Update a ferry schedule
export async function PUT(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Schedule ID is required" },
        { status: 400 },
      );
    }

    const scheduleId = parseInt(id, 10);
    if (isNaN(scheduleId)) {
      return NextResponse.json(
        { error: "Invalid schedule ID" },
        { status: 400 },
      );
    }

    const { departure, arrival, route, price, available } = await req.json();

    const existingSchedule = await prisma.ferrySchedule.findUnique({
      where: { id: scheduleId },
    });

    if (!existingSchedule) {
      return NextResponse.json(
        { error: "Schedule not found" },
        { status: 404 },
      );
    }

    const updatedSchedule = await prisma.ferrySchedule.update({
      where: { id: scheduleId },
      data: {
        departure: departure ? new Date(departure) : undefined,
        arrival: arrival ? new Date(arrival) : undefined,
        route,
        price: price !== undefined ? price : undefined,
        available: available !== undefined ? available : undefined,
      },
    });

    return NextResponse.json(updatedSchedule);
  } catch (error) {
    console.error("Failed to update ferry schedule:", error);
    return NextResponse.json(
      { error: "Failed to update ferry schedule" },
      { status: 500 },
    );
  }
}

// DELETE /api/ferry-schedules - Delete a ferry schedule
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Schedule ID is required" },
        { status: 400 },
      );
    }

    const scheduleId = parseInt(id, 10);
    if (isNaN(scheduleId)) {
      return NextResponse.json(
        { error: "Invalid schedule ID" },
        { status: 400 },
      );
    }

    const existingSchedule = await prisma.ferrySchedule.findUnique({
      where: { id: scheduleId },
    });

    if (!existingSchedule) {
      return NextResponse.json(
        { error: "Schedule not found" },
        { status: 404 },
      );
    }

    await prisma.ferrySchedule.delete({
      where: { id: scheduleId },
    });

    return NextResponse.json({ message: "Schedule deleted successfully" });
  } catch (error) {
    console.error("Failed to delete ferry schedule:", error);
    return NextResponse.json(
      { error: "Failed to delete ferry schedule" },
      { status: 500 },
    );
  }
}
