import { Client, isFullPage } from "@notionhq/client";
import type { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints";
import { mapNotionCharacterToChineseCharacter } from "../domain/mappers";
import { ChineseCharacter } from "../domain/types";
import { NOTION_VOCABULARY_DATASOURCE_ID } from "./constants";

export const notionClient = new Client({ auth: process.env.NOTION_API_KEY });

export const fetchChineseCharacterById = async (
  id: string
): Promise<ChineseCharacter> => {
  const response = await notionClient.pages.retrieve({
    page_id: id,
  });

  if (!("properties" in response)) {
    throw new Error("Page is not a database page");
  }

  const character = mapNotionCharacterToChineseCharacter(
    response as PageObjectResponse
  );

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

  const response = await notionClient.dataSources.query({
    data_source_id: NOTION_VOCABULARY_DATASOURCE_ID,
    page_size: numberOfCharacters,
    filter: filters,
  });

  console.log("Raw fetched characters:", JSON.stringify(response.results));

  const cleanCharacters = response.results
    .filter(isFullPage)
    .map(mapNotionCharacterToChineseCharacter);

  console.log({
    "Fetched characters": cleanCharacters,
    "Number of fetched characters": cleanCharacters.length,
  });

  return cleanCharacters;
};
