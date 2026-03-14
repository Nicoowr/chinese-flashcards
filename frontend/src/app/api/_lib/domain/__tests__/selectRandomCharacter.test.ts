import { describe, it, expect, vi, afterEach } from "vitest";
import { selectRandomCharacter } from "../characterSelection";
import { ChineseCharacter } from "../types";

const characters: ChineseCharacter[] = [
  {
    id: "1",
    character: "你",
    translation: "you",
    example: null,
    addedAt: null,
    type: "noun",
    importance: "high",
    lastSeenAt: null,
    numberOfCorrectAnswers: 0,
    levelOfConfidence: "low",
  },
  {
    id: "2",
    character: "好",
    translation: "good",
    example: null,
    addedAt: null,
    type: "adjective",
    importance: "high",
    lastSeenAt: null,
    numberOfCorrectAnswers: 2,
    levelOfConfidence: "high",
  },
];

afterEach(() => {
  vi.restoreAllMocks();
});

describe("selectRandomCharacter", () => {
  it("returns the first character when random is 0", () => {
    vi.spyOn(Math, "random").mockReturnValue(0);

    const selected = selectRandomCharacter(characters);

    expect(selected).toEqual(characters[0]);
  });

  it("returns the last character when random is close to 1", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.99999);

    const selected = selectRandomCharacter(characters);

    expect(selected).toEqual(characters[1]);
  });
});
