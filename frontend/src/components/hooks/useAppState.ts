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
  const [currentCharacter, setCurrentCharacter] =
    useState<ChineseCharacter | null>(null);
  const [nextCharacter, setNextCharacter] = useState<ChineseCharacter | null>(
    null
  );
  const [seenCharacterIds, setSeenCharacterIds] = useState<string[]>([]);
  const [knownCharacters, setKnownCharacters] = useState<ChineseCharacter[]>(
    []
  );
  const [unknownCharacters, setUnknownCharacters] = useState<
    ChineseCharacter[]
  >([]);

  const shiftForward = ({
    currentCharacter,
    nextCharacter,
  }: {
    currentCharacter: ChineseCharacter | null;
    nextCharacter: ChineseCharacter | null;
  }) => {
    const newState = {
      currentCharacter: nextCharacter,
      nextCharacter: null,
    };
    setCurrentCharacter(newState.currentCharacter);
    setNextCharacter(newState.nextCharacter);
    if (newState.currentCharacter) {
      setSeenCharacterIds((prev) => {
        return uniq(compact([...prev, newState.currentCharacter?.id]));
      });
    }
    return newState;
  };

  const addKnownCharacter = (character: ChineseCharacter) => {
    setKnownCharacters((prev) => [...prev, character]);
  };

  const addUnknownCharacter = (character: ChineseCharacter) => {
    setUnknownCharacters((prev) => [...prev, character]);
  };

  return {
    showIdeogram,
    setShowIdeogram,
    characterType,
    setCharacterType,
    characterImportance,
    setCharacterImportance,
    currentCharacter,
    setCurrentCharacter,
    nextCharacter,
    setNextCharacter,
    seenCharacterIds,
    setSeenCharacterIds,
    knownCharacters,
    setKnownCharacters,
    unknownCharacters,
    setUnknownCharacters,
    addKnownCharacter,
    addUnknownCharacter,
    shiftForward,
  };
};
