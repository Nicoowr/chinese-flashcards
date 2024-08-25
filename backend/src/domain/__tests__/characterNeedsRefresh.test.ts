import { describe, it, expect } from "vitest";
import { characterNeedsRefresh } from "../notionFilter";
import dayjs from "dayjs";

describe("characterNeedsRefresh", () => {
  it("should return true if character is not known", () => {
    const character = {
      levelOfConfidence: "low" as const,
      lastSeenAt: dayjs().subtract(1, "year").toDate(),
      numberOfCorrectAnswers: 10,
    };

    expect(characterNeedsRefresh(character)).toBe(true);
  });
  it("should return true if character was remembered ONCE and last seen more than 2 weeks agao", () => {
    const character = {
      levelOfConfidence: "high" as const,
      lastSeenAt: dayjs().subtract(3, "weeks").toDate(),
      numberOfCorrectAnswers: 1,
    };

    expect(characterNeedsRefresh(character)).toBe(true);
  });
  it("should return false if character was remembered ONCE and last seen less than 2 weeks ago", () => {
    const character = {
      levelOfConfidence: "high" as const,
      lastSeenAt: dayjs().subtract(1, "weeks").toDate(),
      numberOfCorrectAnswers: 1,
    };

    expect(characterNeedsRefresh(character)).toBe(false);
  });
  it("should return true if character was remembered TWICE and last seen more than 4 weeks ago", () => {
    const character = {
      levelOfConfidence: "high" as const,
      lastSeenAt: dayjs().subtract(5, "weeks").toDate(),
      numberOfCorrectAnswers: 2,
    };

    expect(characterNeedsRefresh(character)).toBe(true);
  });
});
