import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { assertAuthorizedEmail, RequestAuthError } from "@/app/api/_lib/auth";
import { POST } from "../route";

vi.mock("@/app/api/_lib/auth", async (importOriginal) => {
  const auth = await importOriginal<typeof import("@/app/api/_lib/auth")>();
  return { ...auth, assertAuthorizedEmail: vi.fn() };
});

const openRouterFetch = vi.fn<typeof fetch>();
const generatedDetails = {
  translation: "study; learn",
  example: "我每天都学习中文。",
  type: "verb",
};

const createRequest = (body: unknown) =>
  new Request("http://localhost/api/generate-character-details", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: "Bearer test-token",
    },
    body: JSON.stringify(body),
  });

const createCompletion = (content: unknown) => ({
  choices: [{ message: { content }, finish_reason: "stop" }],
});

beforeEach(() => {
  vi.stubEnv("OPENROUTER_API_KEY", "test-openrouter-key");
  vi.stubEnv("OPENROUTER_MODEL", "");
  vi.stubGlobal("fetch", openRouterFetch);
  openRouterFetch.mockReset();
  vi.mocked(assertAuthorizedEmail).mockResolvedValue({ id: "test-user" });
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("POST /api/generate-character-details", () => {
  it("uses OpenRouter's free model and preserves the editor's response contract", async () => {
    openRouterFetch.mockResolvedValueOnce(
      Response.json(
        createCompletion(
          JSON.stringify({
            ...generatedDetails,
            translation: " study; learn ",
            example: " 我每天都学习中文。 ",
          }),
        ),
      ),
    );

    const response = await POST(createRequest({ character: " 学习 " }));

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual(generatedDetails);
    expect(openRouterFetch).toHaveBeenCalledTimes(1);
    const [url, options] = openRouterFetch.mock.calls[0];
    expect(url).toBe("https://openrouter.ai/api/v1/chat/completions");
    expect(options).toEqual(
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          Authorization: "Bearer test-openrouter-key",
        }),
        signal: expect.any(AbortSignal),
      }),
    );
    const requestBody = JSON.parse(String(options?.body));
    expect(requestBody).toEqual(
      expect.objectContaining({
        models: [
          "dots-studio/dots-3-note-preview:free",
          "nvidia/nemotron-3.5-super-vl:free",
        ],
        provider: { require_parameters: true },
        reasoning: { enabled: false },
        messages: expect.arrayContaining([
          { role: "user", content: "Character: 学习" },
        ]),
        response_format: {
          type: "json_schema",
          json_schema: expect.objectContaining({
            strict: true,
            schema: expect.objectContaining({
              required: ["translation", "example", "type"],
              additionalProperties: false,
            }),
          }),
        },
      }),
    );
  });

  it("accepts a null part of speech", async () => {
    openRouterFetch.mockResolvedValueOnce(
      Response.json(
        createCompletion(JSON.stringify({ ...generatedDetails, type: null })),
      ),
    );

    const response = await POST(createRequest({ character: "学习" }));

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ ...generatedDetails, type: null });
  });

  it("supports overriding the default with another free model", async () => {
    vi.stubEnv("OPENROUTER_MODEL", " liquid/lfm-3-1.7b:free ");
    openRouterFetch.mockResolvedValueOnce(
      Response.json(createCompletion(JSON.stringify(generatedDetails))),
    );

    const response = await POST(createRequest({ character: "学习" }));

    expect(response.status).toBe(200);
    const [, options] = openRouterFetch.mock.calls[0];
    expect(JSON.parse(String(options?.body)).models).toEqual([
      "liquid/lfm-3-1.7b:free",
      "nvidia/nemotron-3.5-super-vl:free",
    ]);
  });

  it("does not duplicate the fallback when it is configured as the primary model", async () => {
    vi.stubEnv("OPENROUTER_MODEL", "nvidia/nemotron-3.5-super-vl:free");
    openRouterFetch.mockResolvedValueOnce(
      Response.json(createCompletion(JSON.stringify(generatedDetails))),
    );

    const response = await POST(createRequest({ character: "学习" }));

    expect(response.status).toBe(200);
    const [, options] = openRouterFetch.mock.calls[0];
    expect(JSON.parse(String(options?.body)).models).toEqual([
      "nvidia/nemotron-3.5-super-vl:free",
    ]);
  });

  it("requires the new API key even if an OpenAI key exists", async () => {
    vi.stubEnv("OPENROUTER_API_KEY", "");
    vi.stubEnv("OPENAI_API_KEY", "unused-openai-key");

    const response = await POST(createRequest({ character: "学习" }));

    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({
      error: "OPENROUTER_API_KEY is not configured.",
    });
    expect(openRouterFetch).not.toHaveBeenCalled();
  });

  it("rejects paid model IDs before making a request", async () => {
    vi.stubEnv("OPENROUTER_MODEL", "openai/gpt-4.1-mini");

    const response = await POST(createRequest({ character: "学习" }));

    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({
      error: "OPENROUTER_MODEL must be a free model ending in :free.",
    });
    expect(openRouterFetch).not.toHaveBeenCalled();
  });

  it.each([{}, null, { character: "  " }, { character: 42 }])(
    "rejects invalid input %j without calling OpenRouter",
    async (body) => {
      const response = await POST(createRequest(body));

      expect(response.status).toBe(400);
      expect(openRouterFetch).not.toHaveBeenCalled();
    },
  );

  it("keeps generation restricted to the authorized user", async () => {
    vi.mocked(assertAuthorizedEmail).mockRejectedValueOnce(
      new RequestAuthError("Forbidden", 403),
    );

    const response = await POST(createRequest({ character: "学习" }));

    expect(response.status).toBe(403);
    expect(await response.json()).toEqual({ error: "Forbidden" });
    expect(openRouterFetch).not.toHaveBeenCalled();
  });

  it("reports free usage limits without exposing the provider error body", async () => {
    openRouterFetch.mockResolvedValueOnce(
      new Response("private provider details", { status: 429 }),
    );

    const response = await POST(createRequest({ character: "学习" }));

    expect(response.status).toBe(429);
    expect(await response.json()).toEqual({
      error:
        "Free generation is busy or its daily limit has been reached. Please try again later.",
    });
  });

  it.each([401, 404, 503])(
    "handles provider HTTP %i failures",
    async (status) => {
      openRouterFetch.mockResolvedValueOnce(
        new Response("private provider details", { status }),
      );

      const response = await POST(createRequest({ character: "学习" }));

      expect(response.status).toBe(502);
      expect(await response.json()).toEqual({
        error:
          "The translation service is unavailable. Please try again later.",
      });
    },
  );

  it.each([
    null,
    { choices: [] },
    createCompletion(null),
    createCompletion("not JSON"),
    createCompletion(JSON.stringify({ ...generatedDetails, type: "pronoun" })),
    createCompletion(JSON.stringify({ ...generatedDetails, translation: " " })),
    createCompletion(JSON.stringify({ ...generatedDetails, example: " " })),
    {
      choices: [
        {
          message: { content: JSON.stringify(generatedDetails) },
          finish_reason: "length",
        },
      ],
    },
    { error: { code: 503, message: "upstream failure" } },
  ])("rejects invalid or incomplete provider output %j", async (payload) => {
    openRouterFetch.mockResolvedValueOnce(Response.json(payload));

    const response = await POST(createRequest({ character: "学习" }));

    expect(response.status).toBe(502);
    expect(await response.json()).toEqual({
      error: "Character generation returned an invalid response. Please retry.",
    });
  });

  it("handles malformed HTTP JSON from the provider", async () => {
    openRouterFetch.mockResolvedValueOnce(new Response("not JSON"));

    const response = await POST(createRequest({ character: "学习" }));

    expect(response.status).toBe(502);
  });

  it.each(["AbortError", "TimeoutError"])(
    "handles a request %s",
    async (errorName) => {
      openRouterFetch.mockRejectedValueOnce(
        new DOMException("timed out", errorName),
      );

      const response = await POST(createRequest({ character: "学习" }));

      expect(response.status).toBe(504);
      expect(await response.json()).toEqual({
        error: "Character generation timed out. Please retry.",
      });
    },
  );
});
