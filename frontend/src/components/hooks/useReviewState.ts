import { useState } from "react";
import { ChineseCharacter } from "../types";

type ReviewSnapshot = {
  previousCharacter: ChineseCharacter;
  previousShowIdeogram: boolean;
};

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
    const characterId = currentCharacter.id;
    if (targetList === "known") {
      setKnownCharacters((prev) => [
        ...prev.filter((c) => c.id !== characterId),
        currentCharacter,
      ]);
      setUnknownCharacters((prev) =>
        prev.filter((c) => c.id !== characterId)
      );
    } else {
      setUnknownCharacters((prev) => [
        ...prev.filter((c) => c.id !== characterId),
        currentCharacter,
      ]);
      setKnownCharacters((prev) =>
        prev.filter((c) => c.id !== characterId)
      );
    }
    const character = currentCharacter;
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
