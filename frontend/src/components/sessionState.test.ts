import { describe, expect, it } from "vitest";
import { resolveNextCharacter, upsertCharacterById } from "./sessionState";
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
