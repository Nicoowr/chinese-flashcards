import { Client } from "@notionhq/client";
import { DatabaseObjectResponse } from "@notionhq/client/build/src/api-endpoints";
import { config } from "dotenv";
import { ChineseCharacter } from "../domain/types";
import {
  levelOfConfidenceMappingFromDomainToNotion,
  mapNotionCharacterToChineseCharacter,
  propertiesMappingFromDomainToNotion,
} from "../domain/mappers";
import dayjs from "dayjs";

config();

const notion = new Client({ auth: process.env.NOTION_API_KEY });

export const fetchChineseCharacter = async (
  filters: any
): Promise<ChineseCharacter> => {
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

  const cleanCharacters = response.results.map(
    mapNotionCharacterToChineseCharacter
  );

  console.log({
    "Fetched characters": cleanCharacters,
  });

  const randomCharacter =
    cleanCharacters[Math.floor(Math.random() * cleanCharacters.length)];

  console.log("Random character selected:", randomCharacter);

  return randomCharacter;
};

export const setCharacterToUnknown = async (id: string): Promise<void> => {
  const databaseId = process.env.NOTION_DATABASE_ID;
  if (!databaseId) {
    throw new Error(
      "NOTION_DATABASE_ID is not defined in the environment variables"
    );
  }

  console.log("Updating character with ID:", id);

  await notion.pages.update({
    page_id: id,
    properties: {
      [propertiesMappingFromDomainToNotion.lastSeenAt]: {
        type: "date",
        date: {
          start: dayjs().format("YYYY-MM-DD"),
        },
      },
      [propertiesMappingFromDomainToNotion.levelOfConfidence]: {
        type: "status",
        status: {
          name: levelOfConfidenceMappingFromDomainToNotion["low"],
        },
      },
    },
  });
};

export const setCharacterToKnown = async (id: string): Promise<void> => {
  const databaseId = process.env.NOTION_DATABASE_ID;
  if (!databaseId) {
    throw new Error(
      "NOTION_DATABASE_ID is not defined in the environment variables"
    );
  }

  console.log("Setting character with ID to known", id);

  await notion.pages.update({
    page_id: id,
    properties: {
      [propertiesMappingFromDomainToNotion.lastSeenAt]: {
        type: "date",
        date: {
          start: dayjs().format("YYYY-MM-DD"),
        },
      },
      [propertiesMappingFromDomainToNotion.levelOfConfidence]: {
        type: "status",
        status: {
          name: levelOfConfidenceMappingFromDomainToNotion["high"],
        },
      },
    },
  });
};
