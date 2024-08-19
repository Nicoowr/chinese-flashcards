import { Client } from "@notionhq/client";
import { DatabaseObjectResponse } from "@notionhq/client/build/src/api-endpoints";
import { config } from "dotenv";
import { ChineseCharacter } from "../domain/types";
import { mapNotionCharacterToChineseCharacter } from "../domain/mappers";

config();

const notion = new Client({ auth: process.env.NOTION_API_KEY });

export const fetchChineseCharacters = async (
  filters: any
): Promise<ChineseCharacter[]> => {
  const databaseId = process.env.NOTION_DATABASE_ID;
  if (!databaseId) {
    throw new Error(
      "NOTION_DATABASE_ID is not defined in the environment variables"
    );
  }

  console.log(
    "Fetching characters with filters:",
    JSON.stringify(filters, null, 2)
  );

  const response = (await notion.databases.query({
    database_id: databaseId,
    page_size: 1,
    filter: filters,
  })) as { results: DatabaseObjectResponse[] };

  console.log("Raw fetched characters:", JSON.stringify(response.results));

  return response.results.map(mapNotionCharacterToChineseCharacter);
};
