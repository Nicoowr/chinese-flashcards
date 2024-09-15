import dayjs from "dayjs";
import {
  propertiesMappingFromDomainToNotion,
  importanceMappingFromDomainToNotion,
  typesMappingFromDomainToNotion,
} from "./mappers";
import { CharacterType, CharacterImportance, ChineseCharacter } from "./types";
import { compact } from "lodash-es";

export const notKnownCharactersFilter = ({
  characterType,
  characterImportance,
}: {
  characterType: CharacterType | null;
  characterImportance: CharacterImportance | null;
}) => {
  const filter = {
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
          characterImportance && {
            property: propertiesMappingFromDomainToNotion.importance,
            select: {
              equals: importanceMappingFromDomainToNotion[characterImportance],
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
              before: dayjs().subtract(3, "day").format("YYYY-MM-DD"),
            },
          },
          {
            property: propertiesMappingFromDomainToNotion.levelOfConfidence,
            status: {
              equals: "❌",
            },
          },
          characterImportance && {
            property: propertiesMappingFromDomainToNotion.importance,
            select: {
              equals: importanceMappingFromDomainToNotion[characterImportance],
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

  console.log("Filter", filter);

  return filter;
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
