import "dotenv/config";
import { Client } from "@notionhq/client";

/**
 * Notion API v5 is breaking and handles Data sources instead of databases.
 * This script is used to get the Data source ID for the vocabulary database.
 */
const main = async () => {
  let notion = new Client({
    auth: process.env.NOTION_API_KEY,
    notionVersion: "2025-09-03",
  });

  const DATABASE_ID = process.env.NOTION_DATABASE_ID;

  try {
    const response = (await notion.request({
      method: "get",
      path: `databases/${DATABASE_ID}`,
    })) as { data_sources: { id: string; name: string }[] };
    const dataSources = response.data_sources;

    // [{ id: "...", name: "..." }, ...]
    console.log(dataSources);
  } catch (error) {
    // Handle `APIResponseError`
    console.error(error);
  }

  // ... Remaining code, not migrated yet.

  // ...
};

main();
