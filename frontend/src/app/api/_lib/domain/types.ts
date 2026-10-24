export const CHARACTER_TYPES = [
  "verb",
  "noun",
  "adjective",
  "adverb",
  "link",
] as const;
export type CharacterType = (typeof CHARACTER_TYPES)[number];

export const CHARACTER_IMPORTANCE = ["high", "medium", "low"] as const;
export type CharacterImportance = (typeof CHARACTER_IMPORTANCE)[number];

export const CHARACTER_CONFIDENCE = ["high", "low"] as const;
export type CharacterConfidence = (typeof CHARACTER_CONFIDENCE)[number];

export type ChineseCharacter = {
  id: string;
  character: string;
  pinyin?: string | null;
  translation: string | null;
  example: string | null;
  addedAt: Date | null;
  type: CharacterType | null;
  importance: CharacterImportance | null;
  lastSeenAt: Date | null;
  numberOfCorrectAnswers: number | null;
  levelOfConfidence: CharacterConfidence | null;
};

export type AdminCharacter = {
  id: string;
  character: string;
  pinyin?: string | null;
  translation: string | null;
  example: string | null;
  addedAt: string | null;
  type: CharacterType | null;
  importance: CharacterImportance | null;
  lastSeenAt: string | null;
  numberOfCorrectAnswers: number;
  levelOfConfidence: CharacterConfidence;
};

export type CharacterFilters = {
  characterType: CharacterType | null;
  characterImportance: CharacterImportance | null;
};

export type CreateCharacterInput = {
  character: string;
  pinyin?: string | null;
  translation?: string | null;
  example?: string | null;
  addedAt?: string | null;
  type?: CharacterType | null;
  importance?: CharacterImportance | null;
  lastSeenAt?: string | null;
  numberOfCorrectAnswers?: number | null;
  levelOfConfidence?: CharacterConfidence | null;
};

export type UpdateCharacterInput = Partial<CreateCharacterInput>;
