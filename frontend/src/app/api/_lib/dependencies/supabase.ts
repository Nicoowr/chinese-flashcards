import dayjs from "dayjs";
import {
  AdminCharacter,
  CharacterConfidence,
  CharacterFilters,
  CharacterImportance,
  CharacterType,
  ChineseCharacter,
  CreateCharacterInput,
  UpdateCharacterInput,
} from "../domain/types";

const TABLE_NAME = "chinese_characters";

type CharacterRow = {
  id: string;
  character: string;
  translation: string | null;
  example: string | null;
  added_at: string | null;
  type: CharacterType | null;
  importance: CharacterImportance | null;
  last_seen_at: string | null;
  number_of_correct_answers: number;
  level_of_confidence: CharacterConfidence;
};

const getSupabaseConfig = () => {
  const url = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variable"
    );
  }

  return { url, serviceRoleKey };
};

const buildHeaders = ({
  includeContentType = false,
  prefer,
}: {
  includeContentType?: boolean;
  prefer?: string;
}) => {
  const { serviceRoleKey } = getSupabaseConfig();

  return {
    apikey: serviceRoleKey,
    Authorization: `Bearer ${serviceRoleKey}`,
    ...(includeContentType ? { "Content-Type": "application/json" } : {}),
    ...(prefer ? { Prefer: prefer } : {}),
  };
};

const buildRestUrl = (path: string, params?: URLSearchParams) => {
  const { url } = getSupabaseConfig();
  const query = params ? `?${params.toString()}` : "";
  return `${url}/rest/v1/${path}${query}`;
};

const readResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    const message = await response.text();
    throw new Error(`Supabase request failed: ${response.status} ${message}`);
  }

  if (response.status === 204) {
    return null as T;
  }

  return (await response.json()) as T;
};

const toDate = (value: string | null): Date | null =>
  value ? new Date(`${value}T00:00:00.000Z`) : null;

const normalizeDateInput = (value?: string | null): string | null => {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  const parsed = dayjs(trimmed);
  if (!parsed.isValid()) {
    throw new Error(`Invalid date input: ${value}`);
  }

  return parsed.format("YYYY-MM-DD");
};

const mapRowToChineseCharacter = (row: CharacterRow): ChineseCharacter => ({
  id: row.id,
  character: row.character,
  translation: row.translation,
  example: row.example,
  addedAt: toDate(row.added_at),
  type: row.type,
  importance: row.importance,
  lastSeenAt: toDate(row.last_seen_at),
  numberOfCorrectAnswers: row.number_of_correct_answers,
  levelOfConfidence: row.level_of_confidence,
});

const mapRowToAdminCharacter = (row: CharacterRow): AdminCharacter => ({
  id: row.id,
  character: row.character,
  translation: row.translation,
  example: row.example,
  addedAt: row.added_at,
  type: row.type,
  importance: row.importance,
  lastSeenAt: row.last_seen_at,
  numberOfCorrectAnswers: row.number_of_correct_answers,
  levelOfConfidence: row.level_of_confidence,
});

const queryCharacters = async (params: URLSearchParams) => {
  const response = await fetch(buildRestUrl(TABLE_NAME, params), {
    method: "GET",
    headers: buildHeaders({}),
    cache: "no-store",
  });

  return readResponse<CharacterRow[]>(response);
};

const countCharacters = async (params: URLSearchParams) => {
  const countParams = new URLSearchParams(params);
  countParams.set("select", "id");
  countParams.delete("limit");
  countParams.delete("offset");
  countParams.delete("order");

  const response = await fetch(buildRestUrl(TABLE_NAME, countParams), {
    method: "GET",
    headers: buildHeaders({
      prefer: "count=exact",
    }),
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`Supabase count request failed: ${response.status} ${message}`);
  }

  const contentRange = response.headers.get("content-range");
  if (!contentRange) {
    return 0;
  }

  const totalCount = Number(contentRange.split("/")[1]);
  return Number.isFinite(totalCount) ? totalCount : 0;
};

const withRandomOffset = (
  params: URLSearchParams,
  totalMatchingCharacters: number,
  limit: number
) => {
  if (totalMatchingCharacters <= limit) {
    return params;
  }

  const maxOffset = totalMatchingCharacters - limit;
  const offset = Math.floor(Math.random() * (maxOffset + 1));
  const nextParams = new URLSearchParams(params);
  nextParams.set("offset", String(offset));

  return nextParams;
};

const upsertBodyFromInput = (
  input: CreateCharacterInput | UpdateCharacterInput
) => {
  const body: Record<string, unknown> = {};

  if ("character" in input && typeof input.character === "string") {
    body.character = input.character.trim();
  }

  if ("translation" in input) {
    body.translation = input.translation?.trim() || null;
  }
  if ("example" in input) {
    body.example = input.example?.trim() || null;
  }
  if ("type" in input) {
    body.type = input.type ?? null;
  }
  if ("importance" in input) {
    body.importance = input.importance ?? null;
  }
  if ("levelOfConfidence" in input) {
    body.level_of_confidence = input.levelOfConfidence ?? "low";
  }
  if ("numberOfCorrectAnswers" in input) {
    body.number_of_correct_answers = Math.max(
      0,
      input.numberOfCorrectAnswers ?? 0
    );
  }
  if ("addedAt" in input) {
    body.added_at = normalizeDateInput(input.addedAt);
  }
  if ("lastSeenAt" in input) {
    body.last_seen_at = normalizeDateInput(input.lastSeenAt);
  }

  return body;
};

export const listAdminCharacters = async (limit = 500) => {
  const params = new URLSearchParams();
  params.set("select", "*");
  params.set("order", "added_at.desc.nullslast,character.asc");
  params.set("limit", String(Math.min(Math.max(limit, 1), 1000)));

  const rows = await queryCharacters(params);
  return rows.map(mapRowToAdminCharacter);
};

export const createCharacter = async (input: CreateCharacterInput) => {
  const payload = upsertBodyFromInput(input);

  if (typeof payload.character !== "string" || !payload.character.trim()) {
    throw new Error("Character is required");
  }

  const response = await fetch(buildRestUrl(TABLE_NAME), {
    method: "POST",
    headers: buildHeaders({
      includeContentType: true,
      prefer: "return=representation",
    }),
    body: JSON.stringify(payload),
  });

  const rows = await readResponse<CharacterRow[]>(response);
  return mapRowToAdminCharacter(rows[0]);
};

export const updateCharacter = async (id: string, input: UpdateCharacterInput) => {
  const payload = upsertBodyFromInput(input);
  if (Object.keys(payload).length === 0) {
    throw new Error("No fields provided to update");
  }

  const params = new URLSearchParams();
  params.set("id", `eq.${id}`);

  const response = await fetch(buildRestUrl(TABLE_NAME, params), {
    method: "PATCH",
    headers: buildHeaders({
      includeContentType: true,
      prefer: "return=representation",
    }),
    body: JSON.stringify(payload),
  });

  const rows = await readResponse<CharacterRow[]>(response);
  if (rows.length === 0) {
    throw new Error(`Character ${id} not found`);
  }

  return mapRowToAdminCharacter(rows[0]);
};

export const deleteCharacter = async (id: string) => {
  const params = new URLSearchParams();
  params.set("id", `eq.${id}`);

  const response = await fetch(buildRestUrl(TABLE_NAME, params), {
    method: "DELETE",
    headers: buildHeaders({}),
  });

  await readResponse<null>(response);
};

export const fetchCharacterById = async (id: string) => {
  const params = new URLSearchParams();
  params.set("select", "*");
  params.set("id", `eq.${id}`);
  params.set("limit", "1");

  const rows = await queryCharacters(params);
  if (rows.length === 0) {
    throw new Error(`Character ${id} not found`);
  }

  return mapRowToChineseCharacter(rows[0]);
};

export const fetchUnknownCharacters = async (
  filters: CharacterFilters,
  limit: number
) => {
  const threeDaysAgo = dayjs().subtract(3, "day").format("YYYY-MM-DD");
  const params = new URLSearchParams();

  params.set("select", "*");
  params.set("level_of_confidence", "eq.low");
  params.set("or", `(last_seen_at.lt.${threeDaysAgo},last_seen_at.is.null)`);
  params.set("order", "last_seen_at.asc.nullsfirst");
  params.set("limit", String(limit));

  if (filters.characterType) {
    params.set("type", `eq.${filters.characterType}`);
  }
  if (filters.characterImportance) {
    params.set("importance", `eq.${filters.characterImportance}`);
  }

  const totalMatchingCharacters = await countCharacters(params);
  const randomizedParams = withRandomOffset(params, totalMatchingCharacters, limit);
  const rows = await queryCharacters(randomizedParams);
  return rows.map(mapRowToChineseCharacter);
};

export const fetchRecentlyKnownCharacters = async (
  filters: CharacterFilters,
  limit: number
) => {
  const oneMonthAgo = dayjs().subtract(1, "month").format("YYYY-MM-DD");
  const params = new URLSearchParams();

  params.set("select", "*");
  params.set("level_of_confidence", "eq.high");
  params.set("last_seen_at", `lt.${oneMonthAgo}`);
  params.set("order", "last_seen_at.asc");
  params.set("limit", String(limit));

  if (filters.characterType) {
    params.set("type", `eq.${filters.characterType}`);
  }
  if (filters.characterImportance) {
    params.set("importance", `eq.${filters.characterImportance}`);
  }

  const totalMatchingCharacters = await countCharacters(params);
  const randomizedParams = withRandomOffset(params, totalMatchingCharacters, limit);
  const rows = await queryCharacters(randomizedParams);
  return rows.map(mapRowToChineseCharacter);
};

export const setCharacterKnown = async (id: string) => {
  const character = await fetchCharacterById(id);
  const params = new URLSearchParams();
  params.set("id", `eq.${id}`);

  const response = await fetch(buildRestUrl(TABLE_NAME, params), {
    method: "PATCH",
    headers: buildHeaders({
      includeContentType: true,
      prefer: "return=minimal",
    }),
    body: JSON.stringify({
      last_seen_at: dayjs().format("YYYY-MM-DD"),
      level_of_confidence: "high",
      number_of_correct_answers: (character.numberOfCorrectAnswers ?? 0) + 1,
    }),
  });

  await readResponse<null>(response);
};

export const setCharacterUnknown = async (id: string) => {
  const params = new URLSearchParams();
  params.set("id", `eq.${id}`);

  const response = await fetch(buildRestUrl(TABLE_NAME, params), {
    method: "PATCH",
    headers: buildHeaders({
      includeContentType: true,
      prefer: "return=minimal",
    }),
    body: JSON.stringify({
      last_seen_at: dayjs().format("YYYY-MM-DD"),
      level_of_confidence: "low",
    }),
  });

  await readResponse<null>(response);
};
