export type ChineseCharacter = {
  character: string;
  translation: string | null;
  example: string | null;
  metadata: {
    addedAt: Date | null;
    type: "verb" | "noun" | "adjective" | "adverb" | "link" | null;
    importance: "high" | "medium" | "low" | null;
    lastSeenAt: Date | null;
    numberOfCorrectAnswers: number | null;
    levelOfConfidence: "✅" | "❌" | null;
  };
};
