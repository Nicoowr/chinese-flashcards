import { fetchChineseCharacters } from "../dependencies/notion";
import { ChineseCharacter } from "../domain/types";

export const handler = async (event: any) => {
  const characters: ChineseCharacter[] = await fetchChineseCharacters([]);
  return {
    statusCode: 200,
    body: JSON.stringify({ character: characters[0] }),
  };
};
