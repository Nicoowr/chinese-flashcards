import { useState } from "react";
import { CharacterType, CharacterImportance, ChineseCharacter } from "../types";
import { compact, uniq } from "lodash-es";

export const useAppState = () => {
  const [showIdeogram, setShowIdeogram] = useState(false);
  const [characterType, setCharacterType] = useState<CharacterType | null>(
    null
  );
  const [characterImportance, setCharacterImportance] =
    useState<CharacterImportance | null>("high");
  const [previousCharacter, setPreviousCharacter] =
    useState<ChineseCharacter | null>(null);
  const [currentCharacter, setCurrentCharacter] =
    useState<ChineseCharacter | null>(null);
  const [nextCharacter, setNextCharacter] = useState<ChineseCharacter | null>(
    null
  );
  const [seenCharacterIds, setSeenCharacterIds] = useState<string[]>([]);

  const shiftForward = ({
    currentCharacter,
    nextCharacter,
  }: {
    currentCharacter: ChineseCharacter | null;
    nextCharacter: ChineseCharacter | null;
  }) => {
    const newState = {
      previousCharacter: currentCharacter,
      currentCharacter: nextCharacter,
      nextCharacter: null as ChineseCharacter | null,
    };
    setPreviousCharacter(newState.previousCharacter);
    setCurrentCharacter(newState.currentCharacter);
    setNextCharacter(newState.nextCharacter);
    if (newState.currentCharacter) {
      setSeenCharacterIds((prev) => {
        return uniq(compact([...prev, newState.currentCharacter?.id]));
      });
    }
    return newState;
  };

  const shiftBack = ({
    previousCharacter,
    currentCharacter,
    nextCharacter,
  }: {
    previousCharacter: ChineseCharacter | null;
    currentCharacter: ChineseCharacter | null;
    nextCharacter: ChineseCharacter | null;
  }) => {
    const newState = {
      previousCharacter: null as ChineseCharacter | null,
      currentCharacter: previousCharacter,
      nextCharacter: nextCharacter ?? currentCharacter,
    };
    setPreviousCharacter(newState.previousCharacter);
    setCurrentCharacter(newState.currentCharacter);
    setNextCharacter(newState.nextCharacter);
    if (newState.currentCharacter) {
      setSeenCharacterIds((prev) => {
        return uniq(compact([...prev, newState.currentCharacter?.id]));
      });
    }
    return newState;
  };

  return {
    showIdeogram,
    setShowIdeogram,
    characterType,
    setCharacterType,
    characterImportance,
    setCharacterImportance,
    previousCharacter,
    setPreviousCharacter,
    currentCharacter,
    setCurrentCharacter,
    nextCharacter,
    setNextCharacter,
    seenCharacterIds,
    setSeenCharacterIds,
    shiftForward,
    shiftBack,
  };
};
