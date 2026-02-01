import { NextResponse } from "next/server";
import { fetchChineseCharactersFromDatabase } from "../_lib/dependencies/notion";
import {
  notKnownCharactersFilter,
  characterNeedsRefresh,
  selectRandomCharacter,
  recentlyKnownCharactersFilter,
} from "../_lib/domain/notionFilter";
import { CharacterType, CharacterImportance } from "../_lib/domain/types";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const { characterType, characterImportance } = (await request.json()) as {
      characterType: CharacterType | null;
      characterImportance: CharacterImportance | null;
    };
    const unknownCharacters = await fetchChineseCharactersFromDatabase(
      notKnownCharactersFilter({
        characterType,
        characterImportance,
      }),
      50
    );

    if (unknownCharacters.length > 0) {
      const selectedCharacter = selectRandomCharacter(unknownCharacters);
      return NextResponse.json(selectedCharacter ?? null, { status: 200 });
    }
    
    
    const recentlyKnownCharacters = await fetchChineseCharactersFromDatabase(
      recentlyKnownCharactersFilter({
        characterType,
        characterImportance,
      }),
      50
    );

    const charactersNeedingRefresh = recentlyKnownCharacters.filter(
      characterNeedsRefresh
    );

    const selectedCharacter = selectRandomCharacter(charactersNeedingRefresh);

    return NextResponse.json(selectedCharacter ?? null, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch character" },
      { status: 500 }
    );
  }
}
