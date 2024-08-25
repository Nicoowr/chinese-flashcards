import { DatabaseObjectResponse } from "@notionhq/client/build/src/api-endpoints";
import {
  extractNotionTitle,
  extractNotionRichText,
  extractNotionDate,
  extractMultiSelectFirstValue,
  extractSelectValue,
  extractNumber,
  extractStatusValue,
} from "./notionTypeguards";
import { ChineseCharacter } from "./types";

const typesMapping = {
  Verb: "verb",
  Noun: "noun",
  Adjective: "adjective",
  Adverb: "adverb",
  Link: "link",
} as const;

const levelsOfConfidenceMappingFromNotionToDomain = {
  "✅": "high",
  "❌": "low",
} as const;

export const levelOfConfidenceMappingFromDomainToNotion = {
  high: "✅",
  low: "❌",
};

const importanceMappingFromNotionToDomain = {
  High: "high",
  Medium: "medium",
  Low: "low",
} as const;

export const importanceMappingFromDomainToNotion: Record<
  "high" | "medium" | "low",
  string
> = {
  high: "High",
  medium: "Medium",
  low: "Low",
};

export const propertiesMappingFromDomainToNotion: Record<
  keyof ChineseCharacter,
  string
> = {
  id: "id",
  character: "Character",
  translation: "Translation",
  example: "Example",
  addedAt: "Added At",
  type: "Type",
  importance: "Importance",
  lastSeenAt: "Last Seen At",
  numberOfCorrectAnswers: "Number Of Correct Answers",
  levelOfConfidence: "❤️",
};

export const mapNotionCharacterToChineseCharacter = ({
  id,
  properties,
}: {
  id: string;
  properties: DatabaseObjectResponse["properties"];
}): ChineseCharacter => {
  const character = extractNotionTitle(
    properties[propertiesMappingFromDomainToNotion.character]
  );
  const translation = extractNotionRichText(
    properties[propertiesMappingFromDomainToNotion.translation]
  );
  const example = extractNotionRichText(
    properties[propertiesMappingFromDomainToNotion.example]
  );
  const addedAt = extractNotionDate(
    properties[propertiesMappingFromDomainToNotion.addedAt]
  );
  const type = extractMultiSelectFirstValue<keyof typeof typesMapping>(
    properties[propertiesMappingFromDomainToNotion.type]
  );
  const importance = extractSelectValue<
    keyof typeof importanceMappingFromNotionToDomain
  >(properties[propertiesMappingFromDomainToNotion.importance]);
  const lastSeenAt = extractNotionDate(
    properties[propertiesMappingFromDomainToNotion.lastSeenAt]
  );
  const numberOfCorrectAnswers = extractNumber(
    properties[propertiesMappingFromDomainToNotion.numberOfCorrectAnswers]
  );
  const levelOfConfidence = extractStatusValue<
    keyof typeof levelsOfConfidenceMappingFromNotionToDomain
  >(properties[propertiesMappingFromDomainToNotion.levelOfConfidence]);

  return {
    id,
    character,
    translation,
    example,
    addedAt,
    type: type ? typesMapping[type] : null,
    importance: importance
      ? importanceMappingFromNotionToDomain[importance]
      : null,
    lastSeenAt,
    numberOfCorrectAnswers,
    levelOfConfidence: levelOfConfidence
      ? levelsOfConfidenceMappingFromNotionToDomain[levelOfConfidence]
      : null,
  };
};
