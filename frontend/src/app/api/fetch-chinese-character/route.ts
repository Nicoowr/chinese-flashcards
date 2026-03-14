import { NextResponse } from "next/server";
import { assertAuthorizedEmail, toAuthErrorResponse } from "../_lib/auth";
import {
  fetchRecentlyKnownCharacters,
  fetchUnknownCharacters,
} from "@/app/api/_lib/dependencies/supabase";
import {
  characterNeedsRefresh,
  selectRandomCharacter,
} from "../_lib/domain/characterSelection";
import { CharacterType, CharacterImportance } from "../_lib/domain/types";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    await assertAuthorizedEmail(request);

    const { characterType, characterImportance } = (await request.json()) as {
      characterType: CharacterType | null;
      characterImportance: CharacterImportance | null;
    };
    const unknownCharacters = await fetchUnknownCharacters(
      {
        characterType,
        characterImportance,
      },
      50
    );

    if (unknownCharacters.length > 0) {
      const selectedCharacter = selectRandomCharacter(unknownCharacters);
      return NextResponse.json(selectedCharacter ?? null, { status: 200 });
    }
    const recentlyKnownCharacters = await fetchRecentlyKnownCharacters(
      {
        characterType,
        characterImportance,
      },
      50
    );

    const charactersNeedingRefresh = recentlyKnownCharacters.filter(
      characterNeedsRefresh
    );

    const selectedCharacter = selectRandomCharacter(charactersNeedingRefresh);

    return NextResponse.json(selectedCharacter ?? null, { status: 200 });
  } catch (error) {
    const authErrorResponse = toAuthErrorResponse(error);
    if (authErrorResponse) {
      return authErrorResponse;
    }

    return NextResponse.json(
      { error: "Failed to fetch character" },
      { status: 500 }
    );
  }
}
