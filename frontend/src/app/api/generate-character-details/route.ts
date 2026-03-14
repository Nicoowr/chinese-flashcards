import { NextResponse } from "next/server";
import { assertAuthorizedEmail, toAuthErrorResponse } from "../_lib/auth";
import { CHARACTER_TYPES, CharacterType } from "../_lib/domain/types";

export const runtime = "nodejs";

type GenerateCharacterDetailsResponse = {
  translation: string;
  example: string;
  type: CharacterType | null;
};

type OpenAiResponsesApiPayload = {
  output_text?: unknown;
  output?: Array<{
    content?: Array<{
      type?: string;
      text?: string;
    }>;
  }>;
};

const isCharacterType = (value: unknown): value is CharacterType =>
  typeof value === "string" &&
  CHARACTER_TYPES.includes(value as CharacterType);

const toStructuredResponse = (payload: unknown): GenerateCharacterDetailsResponse => {
  if (!payload || typeof payload !== "object") {
    throw new Error("OpenAI response format was invalid.");
  }

  const body = payload as Record<string, unknown>;

  if (
    typeof body.translation !== "string" ||
    body.translation.trim().length === 0 ||
    typeof body.example !== "string" ||
    body.example.trim().length === 0 ||
    !(body.type === null || isCharacterType(body.type))
  ) {
    throw new Error("OpenAI response format was invalid.");
  }

  return {
    translation: body.translation.trim(),
    example: body.example.trim(),
    type: body.type,
  };
};

const extractJsonText = (payload: OpenAiResponsesApiPayload): string => {
  if (typeof payload.output_text === "string" && payload.output_text.trim().length > 0) {
    return payload.output_text;
  }

  const firstTextChunk = payload.output
    ?.flatMap((item) => item.content ?? [])
    .find((content) => content.type === "output_text" && typeof content.text === "string");

  if (!firstTextChunk?.text) {
    throw new Error("OpenAI response did not include text output.");
  }

  return firstTextChunk.text;
};

export async function POST(request: Request) {
  try {
    await assertAuthorizedEmail(request);

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "OPENAI_API_KEY is not configured." },
        { status: 500 }
      );
    }

    const payload = (await request.json()) as { character?: unknown };
    if (typeof payload.character !== "string" || payload.character.trim().length === 0) {
      return NextResponse.json({ error: "character is required." }, { status: 400 });
    }

    const character = payload.character.trim();
    const abortController = new AbortController();
    const timeout = setTimeout(() => abortController.abort(), 15000);

    const openAiResponse = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      signal: abortController.signal,
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        input: [
          {
            role: "system",
            content:
              "You help build concise Chinese flashcards. Return only data requested in the schema. The example must be a short sentence in Chinese (汉字), in spoken/conversational tone: natural and clear, neither overly simple nor overly formal. Always choose the most appropriate part-of-speech (type) when the word or phrase fits one of the options; use null only when it truly does not fit verb, noun, adjective, adverb, or link.",
          },
          {
            role: "user",
            content: `Character: ${character}`,
          },
        ],
        text: {
          format: {
            type: "json_schema",
            name: "character_details",
            strict: true,
            schema: {
              type: "object",
              additionalProperties: false,
              properties: {
                translation: {
                  type: "string",
                  description: "Concise English translation or meaning.",
                },
                example: {
                  type: "string",
                  description:
                    "Short example sentence in Chinese (汉字) that uses the character or word, in natural spoken Chinese tone—not too simple, not too complex.",
                },
                type: {
                  type: ["string", "null"],
                  enum: ["verb", "noun", "adjective", "adverb", "link", null],
                  description:
                    "Part of speech. Prefer verb, noun, adjective, adverb, or link when the character/word clearly fits; use null only when none apply (e.g. 多年来 → adverb).",
                },
              },
              required: ["translation", "example", "type"],
            },
          },
        },
      }),
    });

    clearTimeout(timeout);

    if (!openAiResponse.ok) {
      const errorBody = await openAiResponse.text();
      return NextResponse.json(
        { error: `OpenAI request failed with status ${openAiResponse.status}. ${errorBody}` },
        { status: 502 }
      );
    }

    const responseData = (await openAiResponse.json()) as OpenAiResponsesApiPayload;
    const rawJson = extractJsonText(responseData);
    const parsed = JSON.parse(rawJson) as unknown;
    const normalized = toStructuredResponse(parsed);

    return NextResponse.json(normalized satisfies GenerateCharacterDetailsResponse, {
      status: 200,
    });
  } catch (error) {
    const authErrorResponse = toAuthErrorResponse(error);
    if (authErrorResponse) {
      return authErrorResponse;
    }

    if (error instanceof Error && error.name === "AbortError") {
      return NextResponse.json(
        { error: "OpenAI request timed out. Please retry." },
        { status: 504 }
      );
    }

    const message =
      error instanceof Error ? error.message : "Failed to generate character details.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
