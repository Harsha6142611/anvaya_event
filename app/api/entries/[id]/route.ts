import { NextResponse } from "next/server";
import { deleteEntry, verifyPin } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const body = await request.json().catch(() => ({}));
    const pin = String(body.pin ?? "");

    if (!verifyPin(pin)) {
      return NextResponse.json({ error: "Invalid PIN" }, { status: 401 });
    }

    const deleted = await deleteEntry(id);
    if (!deleted) {
      return NextResponse.json({ error: "Entry not found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("DELETE /api/entries/[id]", error);
    return NextResponse.json(
      { error: "Failed to delete entry" },
      { status: 500 },
    );
  }
}
