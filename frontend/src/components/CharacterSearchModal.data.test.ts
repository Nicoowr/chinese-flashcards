import { afterEach, describe, expect, it, vi } from "vitest";
import { authenticatedApiFetch } from "../lib/supabaseClient";
import { fetchAdminCharacters } from "./CharacterSearchModal.data";

vi.mock("../lib/supabaseClient", () => ({
  authenticatedApiFetch: vi.fn(),
}));

const authenticatedApiFetchMock = vi.mocked(authenticatedApiFetch);

const createCharacter = (index: number) => ({
  id: String(index),
  character: `字${index}`,
  translation: index === 1000 ? "concept" : null,
  example: null,
  addedAt: "2026-08-24",
  type: null,
  importance: null,
  lastSeenAt: null,
  numberOfCorrectAnswers: 0,
  levelOfConfidence: "low" as const,
});

afterEach(() => {
  vi.resetAllMocks();
});

describe("fetchAdminCharacters", () => {
  it("loads every page and preserves the exact database total", async () => {
    const firstPage = Array.from({ length: 1000 }, (_, index) =>
      createCharacter(index)
    );
    const secondPage = [createCharacter(1000)];

    authenticatedApiFetchMock
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ characters: firstPage, total: 1001 }))
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ characters: secondPage, total: 1001 }))
      );

    const result = await fetchAdminCharacters();

    expect(authenticatedApiFetchMock).toHaveBeenNthCalledWith(
      1,
      "/api/admin/characters?limit=1000&offset=0"
    );
    expect(authenticatedApiFetchMock).toHaveBeenNthCalledWith(
      2,
      "/api/admin/characters?limit=1000&offset=1000"
    );
    expect(result.total).toBe(1001);
    expect(result.characters).toHaveLength(1001);
    expect(result.characters[1000]).toMatchObject({
      translation: "concept",
      addedAt: new Date("2026-08-24T00:00:00.000Z"),
    });
  });
});
