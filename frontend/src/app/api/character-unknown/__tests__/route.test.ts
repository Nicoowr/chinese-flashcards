import { afterEach, describe, expect, it, vi } from "vitest";
import { POST } from "../route";
import { setCharacterUnknown } from "../../_lib/dependencies/supabase";

vi.mock("../../_lib/dependencies/supabase", () => ({
  setCharacterUnknown: vi.fn(),
}));

const setCharacterUnknownMock = vi.mocked(setCharacterUnknown);

afterEach(() => {
  vi.restoreAllMocks();
});

describe("POST /api/character-unknown", () => {
  it("returns 400 when id is missing", async () => {
    const request = new Request("http://localhost/api/character-unknown", {
      method: "POST",
      body: JSON.stringify({}),
    });

    const response = await POST(request);

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: "Missing id" });
    expect(setCharacterUnknownMock).not.toHaveBeenCalled();
  });

  it("marks character as unknown when id is provided", async () => {
    const request = new Request("http://localhost/api/character-unknown", {
      method: "POST",
      body: JSON.stringify({ id: "abc" }),
    });

    const response = await POST(request);

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ id: "abc" });
    expect(setCharacterUnknownMock).toHaveBeenCalledWith("abc");
  });

  it("returns 500 when update fails", async () => {
    setCharacterUnknownMock.mockRejectedValueOnce(new Error("db down"));

    const request = new Request("http://localhost/api/character-unknown", {
      method: "POST",
      body: JSON.stringify({ id: "abc" }),
    });

    const response = await POST(request);

    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({ error: "Failed to update character" });
  });
});
