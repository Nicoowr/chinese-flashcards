import { compact } from "lodash-es";
import { useEffect } from "react";
import { toast } from "sonner";
import {
  CharacterImportance,
  CharacterType,
  ChineseCharacter,
} from "../types";

export const useOnConfigurationChange = ({
  fetchCharacter,
  characterType,
  characterImportance,
  setShowIdeogram,
  setCurrentCharacter,
  setNextCharacter,
  setSeenCharacterIds,
  setKnownCharacters,
  setUnknownCharacters,
}: {
  fetchCharacter: () => Promise<ChineseCharacter | null>;
  characterType: CharacterType;
  characterImportance: CharacterImportance | null;
  setShowIdeogram: (showIdeogram: boolean) => void;
  setCurrentCharacter: (currentCharacter: ChineseCharacter | null) => void;
  setNextCharacter: (nextCharacter: ChineseCharacter | null) => void;
  setSeenCharacterIds: (seenCharacterIds: string[]) => void;
  setKnownCharacters: (knownCharacters: ChineseCharacter[]) => void;
  setUnknownCharacters: (unknownCharacters: ChineseCharacter[]) => void;
}) => {
  useEffect(() => {
    setShowIdeogram(false);
    setCurrentCharacter(null);
    setNextCharacter(null);
    setSeenCharacterIds([]);
    setKnownCharacters([]);
    setUnknownCharacters([]);

    let cancelled = false;

    const loadInitialCharacters = async () => {
      const first = await fetchCharacter();
      if (cancelled) return;
      setCurrentCharacter(first);
      setSeenCharacterIds(compact([first?.id]));
      if (first === null) {
        toast.error("No cards available for this filter.");
        return;
      }
      const second = await fetchCharacter();
      if (cancelled) return;
      setSeenCharacterIds(compact([second?.id]));
      setNextCharacter(second);
    };
    loadInitialCharacters();

    return () => {
      cancelled = true;
    };
  }, [characterType, characterImportance]);
};
