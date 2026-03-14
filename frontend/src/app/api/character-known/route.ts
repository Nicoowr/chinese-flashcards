import { NextResponse } from "next/server";
import { assertAuthorizedEmail, toAuthErrorResponse } from "../_lib/auth";
import { setCharacterKnown } from "../_lib/dependencies/supabase";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    await assertAuthorizedEmail(request);

    const { id } = (await request.json()) as { id?: string };
    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }
    await setCharacterKnown(id);
    return NextResponse.json({ id }, { status: 200 });
  } catch (error) {
    const authErrorResponse = toAuthErrorResponse(error);
    if (authErrorResponse) {
      return authErrorResponse;
    }

    return NextResponse.json(
      { error: "Failed to update character" },
      { status: 500 }
    );
  }
}
