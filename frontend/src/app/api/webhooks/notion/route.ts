import { NextResponse } from "next/server";

export const runtime = "nodejs";

type UnknownRecord = Record<string, unknown>;

const getValueAtPath = (source: unknown, path: string[]): unknown => {
  if (!source) {
    return null;
  }
  if (path.length === 0) {
    return source;
  }
  const [head, ...rest] = path;
  if (typeof source !== "object") {
    return null;
  }
  const record = source as UnknownRecord;
  const next = record[head];
  return getValueAtPath(next, rest);
};

const toStringOrNull = (value: unknown): string | null => {
  if (typeof value === "string") {
    return value;
  }
  return null;
};

const extractDatabaseIdsFromEvent = (payload: unknown): string[] => {
  const candidates: Array<string | null> = [];

  const direct = toStringOrNull(getValueAtPath(payload, ["database_id"]));
  candidates.push(direct);

  const parentDirect = toStringOrNull(
    getValueAtPath(payload, ["parent", "database_id"])
  );
  candidates.push(parentDirect);

  const contextDb = toStringOrNull(
    getValueAtPath(payload, ["context", "database_id"])
  );
  candidates.push(contextDb);

  const pageParent = toStringOrNull(
    getValueAtPath(payload, ["page", "parent", "database_id"])
  );
  candidates.push(pageParent);

  const recordParent = toStringOrNull(
    getValueAtPath(payload, ["record", "parent", "database_id"])
  );
  candidates.push(recordParent);

  const eventsVal = getValueAtPath(payload, ["events"]);
  if (Array.isArray(eventsVal)) {
    const eventParents = eventsVal
      .map((evt) =>
        toStringOrNull(getValueAtPath(evt, ["parent", "database_id"]))
      )
      .filter((val): val is string => Boolean(val));
    candidates.push(...eventParents);

    const eventDirect = eventsVal
      .map((evt) => toStringOrNull(getValueAtPath(evt, ["database_id"])))
      .filter((val): val is string => Boolean(val));
    candidates.push(...eventDirect);
  }

  const unique = candidates
    .filter((val): val is string => Boolean(val))
    .filter((val, index, list) => list.indexOf(val) === index);

  return unique;
};

const isAuthorized = (request: Request): boolean => {
  const secretFromEnv = process.env.NOTION_WEBHOOK_SECRET ?? "";
  if (secretFromEnv.length === 0) {
    return true;
  }
  const headerValue = request.headers.get("x-webhook-secret") ?? "";
  if (headerValue.length === 0) {
    return false;
  }
  if (headerValue === secretFromEnv) {
    return true;
  }
  return false;
};

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const rawBody = await request.text();

  try {
    const payload = JSON.parse(rawBody) as unknown;

    const configuredDatabaseId = process.env.NOTION_DATABASE_ID ?? null;
    const eventDatabaseIds = extractDatabaseIdsFromEvent(payload);

    let shouldProcess = true;
    if (configuredDatabaseId) {
      if (!eventDatabaseIds.includes(configuredDatabaseId)) {
        shouldProcess = false;
      }
    }

    if (!shouldProcess) {
      return NextResponse.json({ ok: true, ignored: true });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
}
