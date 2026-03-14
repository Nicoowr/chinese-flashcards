import { afterEach, describe, expect, it, vi } from "vitest";
import { POST } from "../route";
import { setCharacterUnknown } from "@/app/api/_lib/dependencies/supabase";

vi.mock("@/app/api/_lib/auth", () => ({
  assertAuthorizedEmail: vi.fn().mockResolvedValue(undefined),
  toAuthErrorResponse: vi.fn().mockReturnValue(null),
}));

vi.mock("@/app/api/_lib/dependencies/supabase", () => ({
  setCharacterUnknown: vi.fn(),
}));

const setCharacterUnknownMock = vi.mocked(setCharacterUnknown);

const createAuthedRequest = (url: string, body: unknown) =>
  new Request(url, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: "Bearer test-token",
      "x-api-key": "test-api-key",
    },
    body: JSON.stringify(body),
  });

afterEach(() => {
  vi.restoreAllMocks();
});

describe("POST /api/character-unknown", () => {
  it("returns 400 when id is missing", async () => {
    const request = createAuthedRequest("http://localhost/api/character-unknown", {});

    const response = await POST(request);

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: "Missing id" });
    expect(setCharacterUnknownMock).not.toHaveBeenCalled();
  });

  it("marks character as unknown when id is provided", async () => {
    const request = createAuthedRequest("http://localhost/api/character-unknown", { id: "abc" });

    const response = await POST(request);

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ id: "abc" });
    expect(setCharacterUnknownMock).toHaveBeenCalledWith("abc");
  });

  it("returns 500 when update fails", async () => {
    setCharacterUnknownMock.mockRejectedValueOnce(new Error("db down"));

    const request = createAuthedRequest("http://localhost/api/character-unknown", { id: "abc" });

    const response = await POST(request);

    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({ error: "Failed to update character" });
  });
});
