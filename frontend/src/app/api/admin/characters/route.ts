import { NextResponse } from "next/server";
import { assertAuthorizedEmail, toAuthErrorResponse } from "../../_lib/auth";
import {
  CHARACTER_CONFIDENCE,
  CHARACTER_IMPORTANCE,
  CHARACTER_TYPES,
  CharacterConfidence,
  CharacterImportance,
  CharacterType,
  CreateCharacterInput,
} from "../../_lib/domain/types";
import {
  createCharacter,
  listAdminCharacters,
} from "../../_lib/dependencies/supabase";

export const runtime = "nodejs";

const isCharacterType = (value: unknown): value is CharacterType =>
  typeof value === "string" &&
  CHARACTER_TYPES.includes(value as CharacterType);

const isCharacterImportance = (value: unknown): value is CharacterImportance =>
  typeof value === "string" &&
  CHARACTER_IMPORTANCE.includes(value as CharacterImportance);

const isCharacterConfidence = (value: unknown): value is CharacterConfidence =>
  typeof value === "string" &&
  CHARACTER_CONFIDENCE.includes(value as CharacterConfidence);

const nullableString = (value: unknown): string | null | undefined => {
  if (value === undefined) {
    return undefined;
  }
  if (value === null) {
    return null;
  }
  if (typeof value !== "string") {
    throw new Error("Invalid string field");
  }
  return value;
};

const parseCreateInput = (payload: unknown): CreateCharacterInput => {
  if (!payload || typeof payload !== "object") {
    throw new Error("Invalid payload");
  }

  const body = payload as Record<string, unknown>;
  if (typeof body.character !== "string" || body.character.trim().length === 0) {
    throw new Error("character is required");
  }

  if (body.type !== undefined && body.type !== null && !isCharacterType(body.type)) {
    throw new Error("Invalid type");
  }
  if (
    body.importance !== undefined &&
    body.importance !== null &&
    !isCharacterImportance(body.importance)
  ) {
    throw new Error("Invalid importance");
  }
  if (
    body.levelOfConfidence !== undefined &&
    body.levelOfConfidence !== null &&
    !isCharacterConfidence(body.levelOfConfidence)
  ) {
    throw new Error("Invalid levelOfConfidence");
  }

  if (
    body.numberOfCorrectAnswers !== undefined &&
    body.numberOfCorrectAnswers !== null &&
    (typeof body.numberOfCorrectAnswers !== "number" ||
      Number.isNaN(body.numberOfCorrectAnswers))
  ) {
    throw new Error("Invalid numberOfCorrectAnswers");
  }

  return {
    character: body.character.trim(),
    translation: nullableString(body.translation),
    example: nullableString(body.example),
    addedAt: nullableString(body.addedAt),
    type: body.type ? (body.type as CharacterType) : null,
    importance: body.importance ? (body.importance as CharacterImportance) : null,
    lastSeenAt: nullableString(body.lastSeenAt),
    levelOfConfidence: body.levelOfConfidence
      ? (body.levelOfConfidence as CharacterConfidence)
      : null,
    numberOfCorrectAnswers:
      typeof body.numberOfCorrectAnswers === "number"
        ? body.numberOfCorrectAnswers
        : null,
  };
};

export async function GET(request: Request) {
  try {
    await assertAuthorizedEmail(request);

    const url = new URL(request.url);
    const limit = Number(url.searchParams.get("limit") ?? 500);
    const offset = Number(url.searchParams.get("offset") ?? 0);
    const page = await listAdminCharacters(
      Number.isFinite(limit) ? limit : 500,
      Number.isFinite(offset) ? offset : 0
    );
    return NextResponse.json(page, { status: 200 });
  } catch (error) {
    const authErrorResponse = toAuthErrorResponse(error);
    if (authErrorResponse) {
      return authErrorResponse;
    }

    return NextResponse.json(
      { error: "Failed to fetch admin character list" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await assertAuthorizedEmail(request);

    const payload = (await request.json()) as unknown;
    const parsed = parseCreateInput(payload);
    const created = await createCharacter(parsed);
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    const authErrorResponse = toAuthErrorResponse(error);
    if (authErrorResponse) {
      return authErrorResponse;
    }

    const message = error instanceof Error ? error.message : "Invalid request";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
