import { Client } from "@notionhq/client";
import { DatabaseObjectResponse } from "@notionhq/client/build/src/api-endpoints";
import { config } from "dotenv";
import { mapNotionCharacterToChineseCharacter } from "../domain/mappers";
import { ChineseCharacter } from "../domain/types";

config();

export const notionClient = new Client({ auth: process.env.NOTION_API_KEY });

const NOTION_DATABASE_ID = "e9a17e9f569944f2bbde3bfe0929cddc";

export const fetchChineseCharacterById = async (
  id: string
): Promise<ChineseCharacter> => {
  const response = await notionClient.pages.retrieve({
    page_id: id,
  });

  // @ts-ignore: Page type is slightly different from DatabaseObjectResponse type, but it should not matter for this use case
  const character = mapNotionCharacterToChineseCharacter(response);

  return character;
};

export const fetchChineseCharactersFromDatabase = async (
  filters: any,
  numberOfCharacters: number
): Promise<ChineseCharacter[]> => {
  console.log(
    "Fetching characters with filters:",
    JSON.stringify(filters, null, 2)
  );

  const response = (await notionClient.databases.query({
    database_id: NOTION_DATABASE_ID,
    page_size: numberOfCharacters,
    filter: filters,
  })) as { results: DatabaseObjectResponse[] };

  console.log("Raw fetched characters:", JSON.stringify(response.results));

  const cleanCharacters = response.results.map(
    mapNotionCharacterToChineseCharacter
  );

  console.log({
    "Fetched characters": cleanCharacters,
  });

  return cleanCharacters;
};
