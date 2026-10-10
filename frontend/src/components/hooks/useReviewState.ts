import { useState } from "react";
import { ChineseCharacter } from "../types";
import { upsertCharacterById } from "../sessionState";

type ReviewSnapshot = {
  previousCharacter: ChineseCharacter;
  previousShowIdeogram: boolean;
};

const confidenceByReviewList = {
  known: "high",
  unknown: "low",
} as const;

export const useReviewState = ({
  currentCharacter,
  showIdeogram,
  setCurrentCharacter,
  setShowIdeogram,
  setKnownCharacters,
  setUnknownCharacters,
}: {
  currentCharacter: ChineseCharacter | null;
  showIdeogram: boolean;
  setCurrentCharacter: (character: ChineseCharacter | null) => void;
  setShowIdeogram: (value: boolean) => void;
  setKnownCharacters: React.Dispatch<React.SetStateAction<ChineseCharacter[]>>;
  setUnknownCharacters: React.Dispatch<
    React.SetStateAction<ChineseCharacter[]>
  >;
}) => {
  const [reviewSnapshot, setReviewSnapshot] = useState<ReviewSnapshot | null>(
    null
  );

  const isReviewing = reviewSnapshot !== null;

  const startReview = (character: ChineseCharacter) => {
    if (!currentCharacter) return;
    setReviewSnapshot({
      previousCharacter: currentCharacter,
      previousShowIdeogram: showIdeogram,
    });
    setCurrentCharacter(character);
    setShowIdeogram(true);
  };

  const exitReview = () => {
    if (!reviewSnapshot) return;
    setCurrentCharacter(reviewSnapshot.previousCharacter);
    setShowIdeogram(reviewSnapshot.previousShowIdeogram);
    setReviewSnapshot(null);
  };

  const recategorizeReviewedCharacter = (
    targetList: "known" | "unknown"
  ) => {
    if (!currentCharacter || !reviewSnapshot) return currentCharacter;
    const character = {
      ...currentCharacter,
      levelOfConfidence: confidenceByReviewList[targetList],
    };
    const characterId = character.id;
    if (targetList === "known") {
      setKnownCharacters((prev) => upsertCharacterById(prev, character));
      setUnknownCharacters((prev) =>
        prev.filter((c) => c.id !== characterId)
      );
    } else {
      setUnknownCharacters((prev) =>
        upsertCharacterById(prev, character)
      );
      setKnownCharacters((prev) =>
        prev.filter((c) => c.id !== characterId)
      );
    }
    exitReview();
    return character;
  };

  return {
    isReviewing,
    startReview,
    exitReview,
    recategorizeReviewedCharacter,
  };
};
