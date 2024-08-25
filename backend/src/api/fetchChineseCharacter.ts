import { fetchChineseCharactersFromDatabase } from "../dependencies/notion";
import {
  characterNeedsRefresh,
  notKnownCharactersFilter,
  selectRandomCharacter,
} from "../domain/notionFilter";
import { CharacterType } from "../domain/types";

export const handler = async (event: { body: string }) => {
  console.log("Event", event);
  const payload = JSON.parse(event.body) as { characterType: CharacterType };
  const eligibleCharacters = await fetchChineseCharactersFromDatabase(
    notKnownCharactersFilter({ characterType: payload.characterType }),
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
