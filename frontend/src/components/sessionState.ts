import { ChineseCharacter } from "./types";

export const upsertCharacterById = (
  characters: ChineseCharacter[],
  character: ChineseCharacter,
) => {
  return [...characters.filter((item) => item.id !== character.id), character];
};

export const updateCharacterInSessionList = ({
  characters,
  updatedCharacter,
  hasBeenReviewed,
  levelOfConfidence,
}: {
  characters: ChineseCharacter[];
  updatedCharacter: ChineseCharacter;
  hasBeenReviewed: boolean;
  levelOfConfidence: "high" | "low";
}) => {
  if (!hasBeenReviewed) {
    return characters;
  }

  if (updatedCharacter.levelOfConfidence !== levelOfConfidence) {
    return characters.filter(
      (character) => character.id !== updatedCharacter.id,
    );
  }

  return upsertCharacterById(characters, updatedCharacter);
};

export const resolveNextCharacter = ({
  currentCharacter,
  nextCharacter,
}: {
  currentCharacter: ChineseCharacter | null;
  nextCharacter: ChineseCharacter | null;
}) => {
  if (!nextCharacter) return null;
  if (currentCharacter && nextCharacter.id === currentCharacter.id) {
    return null;
  }
  return nextCharacter;
};
