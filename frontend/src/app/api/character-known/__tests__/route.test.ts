import { afterEach, describe, expect, it, vi } from "vitest";
import { POST } from "../route";
import { setCharacterKnown } from "../../_lib/dependencies/supabase";

vi.mock("../../_lib/dependencies/supabase", () => ({
  setCharacterKnown: vi.fn(),
}));

const setCharacterKnownMock = vi.mocked(setCharacterKnown);

afterEach(() => {
  vi.restoreAllMocks();
});

describe("POST /api/character-known", () => {
  it("returns 400 when id is missing", async () => {
    const request = new Request("http://localhost/api/character-known", {
      method: "POST",
      body: JSON.stringify({}),
    });

    const response = await POST(request);

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: "Missing id" });
    expect(setCharacterKnownMock).not.toHaveBeenCalled();
  });

  it("marks character as known when id is provided", async () => {
    const request = new Request("http://localhost/api/character-known", {
      method: "POST",
      body: JSON.stringify({ id: "abc" }),
    });

    const response = await POST(request);

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ id: "abc" });
    expect(setCharacterKnownMock).toHaveBeenCalledWith("abc");
  });

  it("returns 500 when update fails", async () => {
    setCharacterKnownMock.mockRejectedValueOnce(new Error("db down"));

    const request = new Request("http://localhost/api/character-known", {
      method: "POST",
      body: JSON.stringify({ id: "abc" }),
    });

    const response = await POST(request);

    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({ error: "Failed to update character" });
  });
});
