import { NextResponse } from "next/server";
import { createEntry, listEntries, verifyPin } from "@/lib/db";
import type { EntryType } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const entries = await listEntries();
    return NextResponse.json({ entries });
  } catch (error) {
    console.error("GET /api/entries", error);
    return NextResponse.json(
      { error: "Failed to load entries" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const name = String(body.name ?? "").trim();
    const reason = String(body.reason ?? "").trim();
    const pin = String(body.pin ?? "");
    const type = body.type as EntryType;
    const amount = Number(body.amount);

    if (!name || !reason) {
      return NextResponse.json(
        { error: "Name and reason are required" },
        { status: 400 },
      );
    }

    if (!Number.isFinite(amount) || amount <= 0 || !Number.isInteger(amount)) {
      return NextResponse.json(
        { error: "Amount must be a positive whole number" },
        { status: 400 },
      );
    }

    if (type !== "sponsor" && type !== "expenditure" && type !== "due") {
      return NextResponse.json(
        { error: "Type must be sponsor, expenditure, or due" },
        { status: 400 },
      );
    }

    if (!verifyPin(pin)) {
      return NextResponse.json({ error: "Invalid PIN" }, { status: 401 });
    }

    const entry = await createEntry({ name, reason, amount, type });
    return NextResponse.json({ entry }, { status: 201 });
  } catch (error) {
    console.error("POST /api/entries", error);
    return NextResponse.json(
      { error: "Failed to create entry" },
      { status: 500 },
    );
  }
}
