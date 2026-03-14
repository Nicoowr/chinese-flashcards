import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "../route";
import type { ChineseCharacter } from "../../_lib/domain/types";
import {
  fetchRecentlyKnownCharacters,
  fetchUnknownCharacters,
} from "@/app/api/_lib/dependencies/supabase";

vi.mock("@/app/api/_lib/auth", () => ({
  assertAuthorizedEmail: vi.fn().mockResolvedValue(undefined),
  toAuthErrorResponse: vi.fn().mockReturnValue(null),
}));

vi.mock("@/app/api/_lib/dependencies/supabase", () => ({
  fetchUnknownCharacters: vi.fn(),
  fetchRecentlyKnownCharacters: vi.fn(),
}));

const fetchUnknownCharactersMock = vi.mocked(fetchUnknownCharacters);
const fetchRecentlyKnownCharactersMock = vi.mocked(fetchRecentlyKnownCharacters);

const createCharacter = (
  id: string,
  levelOfConfidence: "high" | "low",
  numberOfCorrectAnswers: number,
  lastSeenAt: Date
): ChineseCharacter => ({
  id,
  character: "字",
  translation: "character",
  example: null,
  addedAt: null,
  type: "noun",
  importance: "high",
  levelOfConfidence,
  numberOfCorrectAnswers,
  lastSeenAt,
});

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-03-01T00:00:00.000Z"));
  vi.spyOn(Math, "random").mockReturnValue(0);
});

const createAuthedRequest = (url: string, body: unknown) =>
  new Request(url, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: "Bearer test-token",
      "x-api-key": "test-api-key",
    },
    body: JSON.stringify(body),
  });

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe("POST /api/fetch-chinese-character", () => {
  it("returns one of the unknown characters when available", async () => {
    const unknown = [createCharacter("unknown-1", "low", 0, new Date())];
    fetchUnknownCharactersMock.mockResolvedValueOnce(unknown);

    const request = createAuthedRequest("http://localhost/api/fetch-chinese-character", {
      characterType: "noun",
      characterImportance: "high",
    });

    const response = await POST(request);

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      ...unknown[0],
      lastSeenAt: unknown[0].lastSeenAt?.toISOString() ?? null,
    });
    expect(fetchUnknownCharactersMock).toHaveBeenCalledWith(
      { characterType: "noun", characterImportance: "high" },
      50
    );
    expect(fetchRecentlyKnownCharactersMock).not.toHaveBeenCalled();
  });

  it("falls back to recently known characters and filters forgotten characters", async () => {
    fetchUnknownCharactersMock.mockResolvedValueOnce([]);
    const forgotten = createCharacter(
      "known-1",
      "high",
      1,
      new Date("2026-01-01T00:00:00.000Z")
    );
    const fresh = createCharacter(
      "known-2",
      "high",
      5,
      new Date("2026-02-28T00:00:00.000Z")
    );

    fetchRecentlyKnownCharactersMock.mockResolvedValueOnce([forgotten, fresh]);

    const request = createAuthedRequest("http://localhost/api/fetch-chinese-character", {
      characterType: null,
      characterImportance: null,
    });

    const response = await POST(request);

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      ...forgotten,
      lastSeenAt: forgotten.lastSeenAt?.toISOString() ?? null,
    });
    expect(fetchRecentlyKnownCharactersMock).toHaveBeenCalledWith(
      { characterType: null, characterImportance: null },
      50
    );
  });

  it("returns 500 when data fetching fails", async () => {
    fetchUnknownCharactersMock.mockRejectedValueOnce(new Error("db down"));

    const request = createAuthedRequest("http://localhost/api/fetch-chinese-character", {
      characterType: null,
      characterImportance: null,
    });

    const response = await POST(request);

    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({ error: "Failed to fetch character" });
  });
});
