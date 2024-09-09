export type CharacterImportance = "high" | "medium" | "low";

export type CharacterType =
  | "verb"
  | "noun"
  | "adjective"
  | "adverb"
  | "link"
  | null;
export type ChineseCharacter = {
  id: string;
  character: string;
  translation: string | null;
  example: string | null;
  addedAt: Date | null;
  type: CharacterType | null;
  importance: CharacterImportance | null;
  lastSeenAt: Date | null;
  numberOfCorrectAnswers: number | null;
  levelOfConfidence: "high" | "low" | null;
};
