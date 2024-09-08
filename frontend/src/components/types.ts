export type CharacterImportance = "high" | "medium" | "low";

export type ChineseCharacter = {
  id: string;
  character: string;
  translation: string | null;
  example: string | null;
  addedAt: Date | null;
  type: "verb" | "noun" | "adjective" | "adverb" | "link" | null;
  importance: CharacterImportance | null;
  lastSeenAt: Date | null;
  numberOfCorrectAnswers: number | null;
  levelOfConfidence: "high" | "low" | null;
};
