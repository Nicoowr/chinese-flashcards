import { compact } from "lodash-es";
import { useEffect } from "react";
import { CharacterImportance, CharacterType, ChineseCharacter } from "../types";
import { QueryObserverResult } from "react-query";

export const useOnConfigurationChange = ({
  fetchCharacter,
  characterType,
  characterImportance,
  setShowIdeogram,
  setPreviousCharacter,
  setCurrentCharacter,
  setNextCharacter,
  setSeenCharacterIds,
}: {
  fetchCharacter: () => Promise<ChineseCharacter | null>;
  characterType: CharacterType;
  characterImportance: CharacterImportance | null;
  setShowIdeogram: (showIdeogram: boolean) => void;
  setPreviousCharacter: (previousCharacter: ChineseCharacter | null) => void;
  setCurrentCharacter: (currentCharacter: ChineseCharacter | null) => void;
  setNextCharacter: (nextCharacter: ChineseCharacter | null) => void;
  setSeenCharacterIds: (seenCharacterIds: string[]) => void;
}) => {
  useEffect(() => {
    setShowIdeogram(false);
    setPreviousCharacter(null);
    setCurrentCharacter(null);
    setNextCharacter(null);
    setSeenCharacterIds([]);

    const loadInitialCharacters = async () => {
      const first = await fetchCharacter();
      setCurrentCharacter(first);
      setSeenCharacterIds(compact([first?.id]));
      const second = await fetchCharacter();
      setSeenCharacterIds(compact([second?.id]));
      setNextCharacter(second);
    };
    loadInitialCharacters();
  }, [characterType, characterImportance]);
};
