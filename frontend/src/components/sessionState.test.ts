import { describe, expect, it } from "vitest";
import {
  resolveNextCharacter,
  updateCharacterInSessionList,
  upsertCharacterById,
} from "./sessionState";
import { ChineseCharacter } from "./types";

const createCharacter = (id: string, character: string): ChineseCharacter => ({
  id,
  character,
  translation: `translation-${id}`,
  example: `example-${id}`,
  addedAt: null,
  type: "noun",
  importance: "high",
  levelOfConfidence: "low",
  numberOfCorrectAnswers: 0,
  lastSeenAt: null,
});

describe("resolveNextCharacter", () => {
  it("returns null when prefetched character matches current character", () => {
    const currentCharacter = createCharacter("1", "你");

    const resolved = resolveNextCharacter({
      currentCharacter,
      nextCharacter: currentCharacter,
    });

    expect(resolved).toBeNull();
  });

  it("returns the prefetched character when it is different", () => {
    const resolved = resolveNextCharacter({
      currentCharacter: createCharacter("1", "你"),
      nextCharacter: createCharacter("2", "好"),
    });

    expect(resolved?.id).toBe("2");
  });
});

describe("upsertCharacterById", () => {
  it("does not duplicate a character that already exists", () => {
    const existing = createCharacter("1", "你");
    const updated = {
      ...existing,
      translation: "you",
    };

    const result = upsertCharacterById([existing], updated);

    expect(result).toHaveLength(1);
    expect(result[0]?.translation).toBe("you");
  });
});

describe("updateCharacterInSessionList", () => {
  it("moves a reviewed character from known to unknown after saving not known", () => {
    const knownCharacter = {
      ...createCharacter("1", "你"),
      levelOfConfidence: "high" as const,
    };
    const otherKnownCharacter = {
      ...createCharacter("2", "好"),
      levelOfConfidence: "high" as const,
    };
    const updatedCharacter = {
      ...knownCharacter,
      levelOfConfidence: "low" as const,
    };
    const knownCharacters = updateCharacterInSessionList({
      characters: [knownCharacter, otherKnownCharacter],
      updatedCharacter,
      hasBeenReviewed: true,
      levelOfConfidence: "high",
    });
    const unknownCharacters = updateCharacterInSessionList({
      characters: [],
      updatedCharacter,
      hasBeenReviewed: true,
      levelOfConfidence: "low",
    });

    expect(knownCharacters).toEqual([otherKnownCharacter]);
    expect(unknownCharacters).toEqual([updatedCharacter]);
  });

  it("moves an unknown character back to known without duplicating it", () => {
    const unknownCharacter = createCharacter("1", "你");
    const updatedCharacter = {
      ...unknownCharacter,
      translation: "you",
      levelOfConfidence: "high" as const,
    };

    expect(
      updateCharacterInSessionList({
        characters: [unknownCharacter],
        updatedCharacter,
        hasBeenReviewed: true,
        levelOfConfidence: "low",
      }),
    ).toEqual([]);
    expect(
      updateCharacterInSessionList({
        characters: [updatedCharacter],
        updatedCharacter,
        hasBeenReviewed: true,
        levelOfConfidence: "high",
      }),
    ).toEqual([updatedCharacter]);
  });

  it("does not count an unreviewed library character as a session answer", () => {
    const existingCharacter = createCharacter("1", "你");
    const updatedCharacter = createCharacter("2", "好");

    expect(
      updateCharacterInSessionList({
        characters: [existingCharacter],
        updatedCharacter,
        hasBeenReviewed: false,
        levelOfConfidence: "low",
      }),
    ).toEqual([existingCharacter]);
  });
});
