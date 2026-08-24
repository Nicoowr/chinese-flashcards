import { afterEach, describe, expect, it, vi } from "vitest";
import { GET } from "../route";
import { listAdminCharacters } from "@/app/api/_lib/dependencies/supabase";

vi.mock("@/app/api/_lib/auth", () => ({
  assertAuthorizedEmail: vi.fn().mockResolvedValue(undefined),
  toAuthErrorResponse: vi.fn().mockReturnValue(null),
}));

vi.mock("@/app/api/_lib/dependencies/supabase", () => ({
  listAdminCharacters: vi.fn(),
  createCharacter: vi.fn(),
}));

const listAdminCharactersMock = vi.mocked(listAdminCharacters);

afterEach(() => {
  vi.resetAllMocks();
});

describe("GET /api/admin/characters", () => {
  it("returns an exact-count page using the requested offset", async () => {
    listAdminCharactersMock.mockResolvedValueOnce({
      characters: [],
      total: 1432,
    });

    const response = await GET(
      new Request("http://localhost/api/admin/characters?limit=1000&offset=1000")
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ characters: [], total: 1432 });
    expect(listAdminCharactersMock).toHaveBeenCalledWith(1000, 1000);
  });
});
