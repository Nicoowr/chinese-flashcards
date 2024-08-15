import { Client } from "@notionhq/client";
import { config } from "dotenv";
import { ChineseCharacter, ChineseCharacterFilter } from "../domain/types";
import { DatabaseObjectResponse } from "@notionhq/client/build/src/api-endpoints";

config();

const notion = new Client({ auth: process.env.NOTION_API_KEY });

const typesMapping = {
  Verb: "verb",
  Noun: "noun",
  Adjective: "adjective",
  Adverb: "adverb",
  Link: "link",
};

const levelsOfConfidenceMapping = {
  "✅": "high",
  "❌": "low",
};

const importanceMapping = {
  High: "high",
  Medium: "medium",
  Low: "low",
};

/*
{
    Example: { id: '%3EWI%7C', type: 'rich_text', rich_text: [Array] },
    'Added At': { id: 'FwNo', type: 'date', date: [Object] },
    Translation: { id: 'XopM', type: 'rich_text', rich_text: [Array] },
    Type: { id: 'Zddm', type: 'multi_select', multi_select: [Array] },
    Importance: { id: '%5E%3EDj', type: 'select', select: [Object] },
    'Start/Stop': { id: 'hsHU', type: 'rich_text', rich_text: [] },
    '❤️': { id: 'l%3AqH', type: 'status', status: [Object] },
    Staged: { id: '%7BQ%60D', type: 'checkbox', checkbox: false },
    Character: { id: 'title', type: 'title', title: [Array] }
  }
 */

const mapNotionCharacterToChineseCharacter = (
  notionCharacter: DatabaseObjectResponse
): ChineseCharacter => {
  return {
    character: notionCharacter.properties["Character"].title[0].plain_text,
    translation:
      notionCharacter.properties["Translation"]?.rich_text[0]?.plain_text,
    example: notionCharacter.properties["Example"]?.rich_text[0]?.plain_text,
    metadata: {
      addedAt: notionCharacter.properties["Added At"].date
        ? new Date(notionCharacter.properties["Added At"].date.start)
        : null,
      type: typesMapping[
        notionCharacter.properties["Type"].multi_select[0]?.name
      ],
      importance: notionCharacter.properties["Importance"].select
        ? importanceMapping[
            notionCharacter.properties["Importance"].select.name
          ]
        : null,
      lastSeenAt: notionCharacter.properties["Last Seen At"].date
        ? new Date(notionCharacter.properties["Last Seen At"].date.start)
        : null,
      numberOfCorrectAnswers:
        notionCharacter.properties["Number Of Correct Answers"].number,
      levelOfConfidence: notionCharacter.properties["❤️"].status
        ? levelsOfConfidenceMapping[
            notionCharacter.properties["❤️"].status.name
          ]
        : null,
    },
  };
};

export const fetchChineseCharacters = async (
  filters: ChineseCharacterFilter[]
): Promise<ChineseCharacter[]> => {
  const databaseId = process.env.NOTION_DATABASE_ID;
  if (!databaseId) {
    throw new Error(
      "NOTION_DATABASE_ID is not defined in the environment variables"
    );
  }

  const response = (await notion.databases.query({
    database_id: databaseId,
    page_size: 5,
    filter: { and: filters },
  })) as { results: DatabaseObjectResponse[] };

  return response.results.map(mapNotionCharacterToChineseCharacter);
};
