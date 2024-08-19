import { fetchChineseCharacter } from "../dependencies/notion";
import { notKnownCharacterFilter } from "../domain/notionFilter";

export const handler = async (event: any) => {
  const character = await fetchChineseCharacter(notKnownCharacterFilter);

  return {
    statusCode: 200,
    body: JSON.stringify({ character }),
  };
};
