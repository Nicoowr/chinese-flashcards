import { afterEach, vi } from "vitest";

// Prevent accidental outbound network calls in unit/integration tests.
// Tests that intentionally need fetch should mock it explicitly.
vi.stubGlobal(
  "fetch",
  vi.fn(async () => {
    throw new Error(
      "Unexpected network call in test. Mock auth/dependencies instead of calling real services."
    );
  })
);

afterEach(() => {
  vi.clearAllMocks();
});
