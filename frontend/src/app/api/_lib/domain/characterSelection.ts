import dayjs from "dayjs";
import { ChineseCharacter } from "./types";

// Every correct answer postpones the next refresh by two weeks.
const DECAYING_RATE_IN_WEEKS = 2;

export const characterNeedsRefresh = (character: {
  levelOfConfidence: "high" | "low" | null;
  lastSeenAt: Date | null;
  numberOfCorrectAnswers: number | null;
}) => {
  const characterIsNotKnown = character.levelOfConfidence === "low";
  const numberOfCorrectAnswers = character.numberOfCorrectAnswers ?? 0;

  const characterMightHaveBeenForgotten =
    character.levelOfConfidence === "high" &&
    dayjs().diff(dayjs(character.lastSeenAt), "day") >
      numberOfCorrectAnswers * DECAYING_RATE_IN_WEEKS * 7;

  return characterIsNotKnown || characterMightHaveBeenForgotten;
};

export const selectRandomCharacter = (
  characters: ChineseCharacter[]
): ChineseCharacter => {
  const randomCharacter =
    characters[Math.floor(Math.random() * characters.length)];

  return randomCharacter;
};
