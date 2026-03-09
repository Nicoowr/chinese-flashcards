import { NextResponse } from "next/server";
import { setCharacterKnown } from "../_lib/dependencies/supabase";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const { id } = (await request.json()) as { id?: string };
    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }
    await setCharacterKnown(id);
    return NextResponse.json({ id }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update character" },
      { status: 500 }
    );
  }
}
