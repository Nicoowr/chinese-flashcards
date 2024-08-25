import { fetchChineseCharactersFromDatabase } from "../dependencies/notion";
import {
  characterNeedsRefresh,
  notKnownCharactersFilter,
  selectRandomCharacter,
} from "../domain/notionFilter";

export const handler = async (event: any) => {
  const eligibleCharacters = await fetchChineseCharactersFromDatabase(
    notKnownCharactersFilter,
    50
  );

  const charactersNeedingRefresh = eligibleCharacters.filter(
    characterNeedsRefresh
  );

  const selectedCharacter = selectRandomCharacter(charactersNeedingRefresh);

  return {
    statusCode: 200,
    body: JSON.stringify({ character: selectedCharacter }),
  };
};
