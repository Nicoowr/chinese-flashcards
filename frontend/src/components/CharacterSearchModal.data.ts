import { authenticatedApiFetch } from "../lib/supabaseClient";
import { ChineseCharacter } from "./types";

type CharacterListResponse = Omit<ChineseCharacter, "addedAt" | "lastSeenAt"> & {
  addedAt: string | null;
  lastSeenAt: string | null;
};

type CharacterListPageResponse = {
  characters: CharacterListResponse[];
  total: number;
};

const PAGE_SIZE = 1000;

const toCharacter = (response: CharacterListResponse): ChineseCharacter => ({
  ...response,
  addedAt: response.addedAt ? new Date(`${response.addedAt}T00:00:00.000Z`) : null,
  lastSeenAt: response.lastSeenAt
    ? new Date(`${response.lastSeenAt}T00:00:00.000Z`)
    : null,
});

const fetchCharacterPage = async (offset: number) => {
  const searchParams = new URLSearchParams({
    limit: String(PAGE_SIZE),
    offset: String(offset),
  });
  const response = await authenticatedApiFetch(
    `/api/admin/characters?${searchParams.toString()}`
  );

  if (!response.ok) {
    const error = (await response.json()) as { error?: string };
    throw new Error(error.error ?? "Failed to fetch characters");
  }

  return (await response.json()) as CharacterListPageResponse;
};

export const fetchAdminCharacters = async (): Promise<{
  characters: ChineseCharacter[];
  total: number;
}> => {
  const characters: ChineseCharacter[] = [];
  let total = 0;

  do {
    const page = await fetchCharacterPage(characters.length);
    total = page.total;
    characters.push(...page.characters.map(toCharacter));

    if (page.characters.length === 0 && characters.length < total) {
      throw new Error("Failed to fetch the complete character list");
    }
  } while (characters.length < total);

  return { characters, total };
};
