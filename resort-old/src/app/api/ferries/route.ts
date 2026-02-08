import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const ferries = await prisma.Ferry.findMany({});
    return NextResponse.json({ data: ferries });
  } catch (error) {
    console.error("Failed to fetch ferries:", error);
    return NextResponse.json(
      {
        message: "Failed to fetch ferries due to a server error.",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { name, description, capacity, price, schedule, imageUrl } =
      await req.json();

    if (!name || capacity === undefined || price === undefined || !schedule) {
      return NextResponse.json(
        { error: "Missing required fields: name, capacity, price, schedule" },
        { status: 400 },
      );
    }
    if (typeof capacity !== "number" || capacity <= 0) {
      return NextResponse.json(
        { error: "Capacity must be a positive number" },
        { status: 400 },
      );
    }
    if (typeof price !== "number" || price < 0) {
      return NextResponse.json(
        { error: "Price must be a non-negative number" },
        { status: 400 },
      );
    }

    const newFerry = await prisma.Ferry.create({
      data: {
        name,
        description: description || "",
        capacity,
        price,
        schedule,
        imageUrl: imageUrl || null,
      },
    });
    return NextResponse.json({ data: newFerry }, { status: 201 });
  } catch (error) {
    console.error("Failed to create ferry:", error);
    return NextResponse.json(
      {
        message: "Failed to create ferry",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Ferry ID is required" },
        { status: 400 },
      );
    }
    const ferryId = parseInt(id, 10);
    if (isNaN(ferryId)) {
      return NextResponse.json({ error: "Invalid ferry ID" }, { status: 400 });
    }

    const { name, description, capacity, price, schedule, imageUrl } =
      await req.json();

    const updatedFerry = await prisma.Ferry.update({
      where: { id: ferryId },
      data: { name, description, capacity, price, schedule, imageUrl },
    });
    return NextResponse.json({ data: updatedFerry });
  } catch (error) {
    if (error instanceof Error && 'code' in error && error.code === "P2025") {
      return NextResponse.json({ message: "Ferry not found" }, { status: 404 });
    }
    console.error("Failed to update ferry:", error);
    return NextResponse.json(
      {
        message: "Failed to update ferry",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Ferry ID is required" },
        { status: 400 },
      );
    }
    const ferryId = parseInt(id, 10);
    if (isNaN(ferryId)) {
      return NextResponse.json({ error: "Invalid ferry ID" }, { status: 400 });
    }

    await prisma.Ferry.delete({
      where: { id: ferryId },
    });
    return NextResponse.json({ message: "Ferry deleted successfully" });
  } catch (error) {
    if (error instanceof Error && 'code' in error && error.code === "P2025") {
      return NextResponse.json({ message: "Ferry not found" }, { status: 404 });
    }
    console.error("Failed to delete ferry:", error);
    return NextResponse.json(
      {
        message: "Failed to delete ferry",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
