import { afterEach, describe, expect, it, vi } from "vitest";
import { listAdminCharacters } from "../supabase";

const originalSupabaseUrl = process.env.SUPABASE_URL;
const originalServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

afterEach(() => {
  vi.unstubAllGlobals();
  process.env.SUPABASE_URL = originalSupabaseUrl;
  process.env.SUPABASE_SERVICE_ROLE_KEY = originalServiceRoleKey;
});

describe("listAdminCharacters", () => {
  it("returns the exact total while requesting a deterministic page", async () => {
    process.env.SUPABASE_URL = "https://example.supabase.co";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "service-role-key";
    const fetchMock = vi.fn().mockResolvedValue(
      new Response("[]", {
        headers: { "content-range": "1000-1431/1432" },
      })
    );
    vi.stubGlobal("fetch", fetchMock);

    const result = await listAdminCharacters(1000, 1000);

    expect(result).toEqual({ characters: [], total: 1432 });
    expect(fetchMock).toHaveBeenCalledOnce();

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    const requestUrl = new URL(url);
    expect(requestUrl.searchParams.get("limit")).toBe("1000");
    expect(requestUrl.searchParams.get("offset")).toBe("1000");
    expect(requestUrl.searchParams.get("order")).toBe(
      "added_at.desc.nullslast,character.asc,id.asc"
    );
    expect(init.headers).toMatchObject({ Prefer: "count=exact" });
  });
});
