import { fetchChineseCharacters } from "../dependencies/notion";
import { notKnownCharacterFilter } from "../domain/notionFilter";
import { ChineseCharacter } from "../domain/types";

export const handler = async (event: any) => {
  const characters: ChineseCharacter[] = await fetchChineseCharacters(
    notKnownCharacterFilter
  );
  console.log({
    "Fetched characters": characters,
  });

  const randomCharacter =
    characters[Math.floor(Math.random() * characters.length)];

  console.log("Random character selected:", randomCharacter);

  return {
    statusCode: 200,
    body: JSON.stringify({ character: randomCharacter }),
  };
};
