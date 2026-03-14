import { ChineseCharacter } from "./types";

export const upsertCharacterById = (
  characters: ChineseCharacter[],
  character: ChineseCharacter
) => {
  return [...characters.filter((item) => item.id !== character.id), character];
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
