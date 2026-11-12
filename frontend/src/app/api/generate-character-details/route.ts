import { NextResponse } from "next/server";
import { assertAuthorizedEmail, toAuthErrorResponse } from "../_lib/auth";
import { CHARACTER_TYPES, CharacterType } from "../_lib/domain/types";

export const runtime = "nodejs";

const DEFAULT_OPENROUTER_MODEL = "dots-studio/dots-3-note-preview:free";
const FALLBACK_OPENROUTER_MODEL = "nvidia/nemotron-3.5-super-vl:free";

type GenerateCharacterDetailsResponse = {
  translation: string;
  example: string;
  type: CharacterType | null;
};

type OpenRouterChatCompletionPayload = {
  choices: Array<{
    message: { content: unknown } | null;
    finish_reason: string | null;
  }> | null;
};

const isCharacterType = (value: unknown): value is CharacterType =>
  typeof value === "string" && CHARACTER_TYPES.includes(value as CharacterType);

const toStructuredResponse = (
  payload: unknown,
): GenerateCharacterDetailsResponse => {
  if (!payload || typeof payload !== "object") {
    throw new Error("Character generation returned an invalid response.");
  }

  const body = payload as Record<string, unknown>;

  if (
    typeof body.translation !== "string" ||
    body.translation.trim().length === 0 ||
    typeof body.example !== "string" ||
    body.example.trim().length === 0 ||
    !(body.type === null || isCharacterType(body.type))
  ) {
    throw new Error("Character generation returned an invalid response.");
  }

  return {
    translation: body.translation.trim(),
    example: body.example.trim(),
    type: body.type,
  };
};

const extractJsonText = (payload: OpenRouterChatCompletionPayload): string => {
  const choice = payload?.choices?.[0];
  const content = choice?.message?.content;

  if (
    choice?.finish_reason !== "stop" ||
    typeof content !== "string" ||
    content.trim().length === 0
  ) {
    throw new Error(
      "Character generation did not return complete text output.",
    );
  }

  return content;
};

export const POST = async (request: Request) => {
  try {
    await assertAuthorizedEmail(request);

    const apiKey = process.env.OPENROUTER_API_KEY?.trim();
    if (!apiKey) {
      return NextResponse.json(
        { error: "OPENROUTER_API_KEY is not configured." },
        { status: 500 },
      );
    }

    const model =
      process.env.OPENROUTER_MODEL?.trim() || DEFAULT_OPENROUTER_MODEL;
    if (!model.endsWith(":free")) {
      return NextResponse.json(
        { error: "OPENROUTER_MODEL must be a free model ending in :free." },
        { status: 500 },
      );
    }

    const payload = (await request.json()) as { character: unknown } | null;
    if (
      typeof payload?.character !== "string" ||
      payload.character.trim().length === 0
    ) {
      return NextResponse.json(
        { error: "character is required." },
        { status: 400 },
      );
    }

    const character = payload.character.trim();
    const openRouterResponse = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        signal: AbortSignal.timeout(30000),
        body: JSON.stringify({
          models: [
            model,
            ...[FALLBACK_OPENROUTER_MODEL].filter(
              (fallbackModel) => fallbackModel !== model,
            ),
          ],
          max_tokens: 512,
          reasoning: { enabled: false },
          provider: { require_parameters: true },
          messages: [
            {
              role: "system",
              content:
                "You help build concise Chinese flashcards. Return only data requested in the schema. The translation must be a concise English meaning, never Chinese or pinyin. Choose the most common meaning, and make the example and type match that meaning. The example must be a short sentence in Chinese (汉字), in spoken/conversational tone: natural and clear, neither overly simple nor overly formal. Always choose the most appropriate part-of-speech (type) when the word or phrase fits one of the options; use null only when it truly does not fit verb, noun, adjective, adverb, or link.",
            },
            {
              role: "user",
              content: `Character: ${character}`,
            },
          ],
          response_format: {
            type: "json_schema",
            json_schema: {
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
                    enum: [...CHARACTER_TYPES, null],
                    description:
                      "Part of speech. Prefer verb, noun, adjective, adverb, or link when the character/word clearly fits; use null only when none apply (e.g. 多年来 → adverb).",
                  },
                },
                required: ["translation", "example", "type"],
              },
            },
          },
        }),
      },
    );

    if (openRouterResponse.status === 429) {
      return NextResponse.json(
        {
          error:
            "Free generation is busy or its daily limit has been reached. Please try again later.",
        },
        { status: 429 },
      );
    }

    if (!openRouterResponse.ok) {
      return NextResponse.json(
        {
          error:
            "The translation service is unavailable. Please try again later.",
        },
        { status: 502 },
      );
    }

    try {
      const responseData =
        (await openRouterResponse.json()) as OpenRouterChatCompletionPayload;
      const rawJson = extractJsonText(responseData);
      const parsed = JSON.parse(rawJson) as unknown;
      const normalized = toStructuredResponse(parsed);

      return NextResponse.json(
        normalized satisfies GenerateCharacterDetailsResponse,
        {
          status: 200,
        },
      );
    } catch (error) {
      if (
        error instanceof Error &&
        (error.name === "AbortError" || error.name === "TimeoutError")
      ) {
        throw error;
      }

      return NextResponse.json(
        {
          error:
            "Character generation returned an invalid response. Please retry.",
        },
        { status: 502 },
      );
    }
  } catch (error) {
    const authErrorResponse = toAuthErrorResponse(error);
    if (authErrorResponse) {
      return authErrorResponse;
    }

    if (
      error instanceof Error &&
      (error.name === "AbortError" || error.name === "TimeoutError")
    ) {
      return NextResponse.json(
        { error: "Character generation timed out. Please retry." },
        { status: 504 },
      );
    }

    const message =
      error instanceof Error
        ? error.message
        : "Failed to generate character details.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
};
