import { NextResponse } from "next/server";
import { assertAuthorizedEmail, toAuthErrorResponse } from "../../../_lib/auth";
import {
  CHARACTER_CONFIDENCE,
  CHARACTER_IMPORTANCE,
  CHARACTER_TYPES,
  CharacterConfidence,
  CharacterImportance,
  CharacterType,
  UpdateCharacterInput,
} from "../../../_lib/domain/types";
import {
  deleteCharacter,
  updateCharacter,
} from "../../../_lib/dependencies/supabase";

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

const parseUpdateInput = (payload: unknown): UpdateCharacterInput => {
  if (!payload || typeof payload !== "object") {
    throw new Error("Invalid payload");
  }

  const body = payload as Record<string, unknown>;
  const parsed: UpdateCharacterInput = {};

  if (body.character !== undefined) {
    if (typeof body.character !== "string" || body.character.trim().length === 0) {
      throw new Error("Invalid character");
    }
    parsed.character = body.character.trim();
  }

  if (body.translation !== undefined) {
    parsed.translation = nullableString(body.translation);
  }
  if (body.example !== undefined) {
    parsed.example = nullableString(body.example);
  }
  if (body.addedAt !== undefined) {
    parsed.addedAt = nullableString(body.addedAt);
  }
  if (body.lastSeenAt !== undefined) {
    parsed.lastSeenAt = nullableString(body.lastSeenAt);
  }

  if (body.type !== undefined) {
    if (body.type !== null && !isCharacterType(body.type)) {
      throw new Error("Invalid type");
    }
    parsed.type = body.type as CharacterType | null;
  }
  if (body.importance !== undefined) {
    if (body.importance !== null && !isCharacterImportance(body.importance)) {
      throw new Error("Invalid importance");
    }
    parsed.importance = body.importance as CharacterImportance | null;
  }
  if (body.levelOfConfidence !== undefined) {
    if (
      body.levelOfConfidence !== null &&
      !isCharacterConfidence(body.levelOfConfidence)
    ) {
      throw new Error("Invalid levelOfConfidence");
    }
    parsed.levelOfConfidence = body.levelOfConfidence as CharacterConfidence | null;
  }

  if (body.numberOfCorrectAnswers !== undefined) {
    if (
      body.numberOfCorrectAnswers !== null &&
      (typeof body.numberOfCorrectAnswers !== "number" ||
        Number.isNaN(body.numberOfCorrectAnswers))
    ) {
      throw new Error("Invalid numberOfCorrectAnswers");
    }
    parsed.numberOfCorrectAnswers =
      body.numberOfCorrectAnswers as number | null | undefined;
  }

  return parsed;
};

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await assertAuthorizedEmail(request);

    const { id } = await params;
    const payload = (await request.json()) as unknown;
    const parsed = parseUpdateInput(payload);
    const updated = await updateCharacter(id, parsed);
    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    const authErrorResponse = toAuthErrorResponse(error);
    if (authErrorResponse) {
      return authErrorResponse;
    }

    const message = error instanceof Error ? error.message : "Invalid request";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await assertAuthorizedEmail(request);

    const { id } = await params;
    await deleteCharacter(id);
    return NextResponse.json({ id }, { status: 200 });
  } catch (error) {
    const authErrorResponse = toAuthErrorResponse(error);
    if (authErrorResponse) {
      return authErrorResponse;
    }

    return NextResponse.json(
      { error: "Failed to delete character" },
      { status: 500 }
    );
  }
}
