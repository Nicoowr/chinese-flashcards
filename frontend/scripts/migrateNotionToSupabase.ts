import "dotenv/config";
import { Client, isFullPage } from "@notionhq/client";
import type {
  PageObjectResponse,
  PartialPageObjectResponse,
} from "@notionhq/client/build/src/api-endpoints";

type CharacterRowInsert = {
  id: string;
  character: string;
  translation: string | null;
  example: string | null;
  added_at: string | null;
  type: "verb" | "noun" | "adjective" | "adverb" | "link" | null;
  importance: "high" | "medium" | "low" | null;
  last_seen_at: string | null;
  number_of_correct_answers: number;
  level_of_confidence: "high" | "low";
};

const notionTypesMapping = {
  Verb: "verb",
  Noun: "noun",
  Adjective: "adjective",
  Adverb: "adverb",
  Link: "link",
} as const;

const notionImportanceMapping = {
  High: "high",
  Medium: "medium",
  Low: "low",
} as const;

const notionConfidenceMapping = {
  "✅": "high",
  "❌": "low",
} as const;

const env = {
  notionApiKey: process.env.NOTION_API_KEY,
  notionDataSourceId:
    process.env.NOTION_VOCABULARY_DATASOURCE_ID ??
    process.env.NOTION_DATABASE_ID,
  supabaseUrl: process.env.SUPABASE_URL,
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
};

if (
  !env.notionApiKey ||
  !env.notionDataSourceId ||
  !env.supabaseUrl ||
  !env.supabaseServiceRoleKey
) {
  throw new Error(
    "Missing env vars. Required: NOTION_API_KEY, NOTION_VOCABULARY_DATASOURCE_ID (or NOTION_DATABASE_ID), SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY."
  );
}

const notion = new Client({ auth: env.notionApiKey });

const readTitle = (page: PageObjectResponse, name: string) => {
  const property = page.properties[name];
  if (!property || property.type !== "title") {
    return "";
  }
  return property.title[0]?.plain_text ?? "";
};

const readRichText = (page: PageObjectResponse, name: string) => {
  const property = page.properties[name];
  if (!property || property.type !== "rich_text") {
    return null;
  }
  return property.rich_text[0]?.plain_text ?? null;
};

const readDate = (page: PageObjectResponse, name: string) => {
  const property = page.properties[name];
  if (!property || property.type !== "date") {
    return null;
  }
  return property.date?.start ?? null;
};

const readMultiSelectFirst = (page: PageObjectResponse, name: string) => {
  const property = page.properties[name];
  if (!property || property.type !== "multi_select") {
    return null;
  }
  return property.multi_select[0]?.name ?? null;
};

const readSelect = (page: PageObjectResponse, name: string) => {
  const property = page.properties[name];
  if (!property || property.type !== "select") {
    return null;
  }
  return property.select?.name ?? null;
};

const readStatus = (page: PageObjectResponse, name: string) => {
  const property = page.properties[name];
  if (!property || property.type !== "status") {
    return null;
  }
  return property.status?.name ?? null;
};

const readNumber = (page: PageObjectResponse, name: string) => {
  const property = page.properties[name];
  if (!property || property.type !== "number") {
    return null;
  }
  return property.number ?? null;
};

const mapPageToCharacter = (page: PageObjectResponse): CharacterRowInsert | null => {
  const character = readTitle(page, "Character").trim();
  if (!character) {
    return null;
  }

  const notionType = readMultiSelectFirst(page, "Type");
  const notionImportance = readSelect(page, "Importance");
  const notionConfidence = readStatus(page, "❤️");

  const mappedType =
    notionType && notionType in notionTypesMapping
      ? notionTypesMapping[notionType as keyof typeof notionTypesMapping]
      : null;
  const mappedImportance =
    notionImportance && notionImportance in notionImportanceMapping
      ? notionImportanceMapping[
          notionImportance as keyof typeof notionImportanceMapping
        ]
      : null;
  const mappedConfidence =
    notionConfidence && notionConfidence in notionConfidenceMapping
      ? notionConfidenceMapping[
          notionConfidence as keyof typeof notionConfidenceMapping
        ]
      : "low";

  return {
    id: page.id,
    character,
    translation: readRichText(page, "Translation"),
    example: readRichText(page, "Example"),
    added_at: readDate(page, "Added At"),
    type: mappedType,
    importance: mappedImportance,
    last_seen_at: readDate(page, "Last Seen At"),
    number_of_correct_answers: readNumber(page, "Number Of Correct Answers") ?? 0,
    level_of_confidence: mappedConfidence,
  };
};

const fetchAllNotionPages = async () => {
  const results: PageObjectResponse[] = [];
  let cursor: string | undefined = undefined;

  do {
    const response = await notion.dataSources.query({
      data_source_id: env.notionDataSourceId!,
      page_size: 100,
      start_cursor: cursor,
    });

    const pages = response.results.filter(
      (item): item is PageObjectResponse | PartialPageObjectResponse =>
        "object" in item && item.object === "page"
    );
    const fullPages = pages.filter(isFullPage);
    results.push(...fullPages);
    cursor = response.has_more ? response.next_cursor ?? undefined : undefined;

    console.log(
      `Fetched batch: ${fullPages.length} pages (running total: ${results.length})`
    );
  } while (cursor);

  return results;
};

const chunk = <T>(items: T[], size: number) => {
  const chunks: T[][] = [];
  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }
  return chunks;
};

const upsertBatchToSupabase = async (rows: CharacterRowInsert[]) => {
  const query = new URLSearchParams({ on_conflict: "id" });

  const response = await fetch(
    `${env.supabaseUrl}/rest/v1/chinese_characters?${query.toString()}`,
    {
      method: "POST",
      headers: {
        apikey: env.supabaseServiceRoleKey!,
        Authorization: `Bearer ${env.supabaseServiceRoleKey!}`,
        "Content-Type": "application/json",
        Prefer: "resolution=merge-duplicates,return=minimal",
      },
      body: JSON.stringify(rows),
    }
  );

  if (!response.ok) {
    const payload = await response.text();
    throw new Error(`Supabase upsert failed: ${response.status} ${payload}`);
  }
};

const main = async () => {
  console.log("Starting Notion -> Supabase migration...");
  const notionPages = await fetchAllNotionPages();
  const mappedRows = notionPages
    .map(mapPageToCharacter)
    .filter((row): row is CharacterRowInsert => Boolean(row));

  console.log(`Mapped ${mappedRows.length} records. Starting upsert...`);
  const batches = chunk(mappedRows, 200);
  for (let index = 0; index < batches.length; index += 1) {
    await upsertBatchToSupabase(batches[index]);
    console.log(`Upserted batch ${index + 1}/${batches.length}`);
  }

  console.log("Migration completed successfully.");
};

void main().catch((error) => {
  console.error("Migration failed.", error);
  process.exit(1);
});
