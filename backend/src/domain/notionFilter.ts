import dayjs from "dayjs";
import {
  propertiesMappingFromDomainToNotion,
  importanceMappingFromDomainToNotion,
  typesMappingFromDomainToNotion,
} from "./mappers";
import { CharacterType, ChineseCharacter } from "./types";
import { compact } from "lodash-es";

export const notKnownCharactersFilter = ({
  characterType,
}: {
  characterType: CharacterType | null;
}) => {
  return {
    or: [
      {
        and: compact([
          {
            property: propertiesMappingFromDomainToNotion.lastSeenAt,
            date: {
              before: dayjs().subtract(1, "month").format("YYYY-MM-DD"),
            },
          },
          {
            property: propertiesMappingFromDomainToNotion.levelOfConfidence,
            status: {
              equals: "✅",
            },
          },
          {
            property: propertiesMappingFromDomainToNotion.importance,
            select: {
              equals: importanceMappingFromDomainToNotion.high,
            },
          },
          characterType && {
            property: propertiesMappingFromDomainToNotion.type,
            multi_select: {
              contains: typesMappingFromDomainToNotion[characterType],
            },
          },
        ]),
      },
      {
        and: compact([
          {
            property: propertiesMappingFromDomainToNotion.lastSeenAt,
            date: {
              before: dayjs().subtract(1, "week").format("YYYY-MM-DD"),
            },
          },
          {
            property: propertiesMappingFromDomainToNotion.levelOfConfidence,
            status: {
              equals: "❌",
            },
          },
          {
            property: propertiesMappingFromDomainToNotion.importance,
            select: {
              equals: importanceMappingFromDomainToNotion.high,
            },
          },
          characterType && {
            property: propertiesMappingFromDomainToNotion.type,
            multi_select: {
              contains: typesMappingFromDomainToNotion[characterType],
            },
          },
        ]),
      },
    ],
  };
};

// This means that everytime a character is remembered, we can add 2 more weeks before considering it as forgotten again
const DECAYING_RATE_IN_WEEKS = 2;

export const characterNeedsRefresh = (character: {
  levelOfConfidence: "high" | "low" | null;
  lastSeenAt: Date | null;
  numberOfCorrectAnswers: number | null;
}) => {
  const characterIsNotKnown = character.levelOfConfidence === "low";

  const numberOfCorrectAnswers = character.numberOfCorrectAnswers ?? 0;

  const chatacterMightHaveBeenForgotten =
    character.levelOfConfidence === "high" &&
    dayjs().diff(dayjs(character.lastSeenAt), "day") >
      numberOfCorrectAnswers * DECAYING_RATE_IN_WEEKS * 7;

  return characterIsNotKnown || chatacterMightHaveBeenForgotten;
};

export const selectRandomCharacter = (
  characters: ChineseCharacter[]
): ChineseCharacter => {
  const randomCharacter =
    characters[Math.floor(Math.random() * characters.length)];

  console.log("Random character selected:", randomCharacter);

  return randomCharacter;
};
