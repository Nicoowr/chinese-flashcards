import assert from "node:assert/strict";
import test from "node:test";
import { checkReleaseAge } from "./check-release-age.mjs";

const now = Date.parse("2026-10-10T12:00:00Z");
const day = 24 * 60 * 60 * 1000;
const published = (daysAgo) => new Date(now - daysAgo * day).toISOString();
const packageEntry = { resolution: { integrity: "sha512-test" } };

function check(packages, times, workspace = { minimumReleaseAge: 10080 }) {
  return checkReleaseAge({
    workspace,
    lockfile: { lockfileVersion: "9.0", packages },
    fetchMetadata: async (name) => times[name],
    now,
  });
}

test("accepts releases at the seven-day boundary and older releases", async () => {
  const result = await check(
    { "example@1.0.0": packageEntry, "example@2.0.0": packageEntry },
    { example: { "1.0.0": published(7), "2.0.0": published(8) } },
  );
  assert.equal(result.packagesChecked, 2);
  assert.deepEqual(result.failures, []);
});

test("rejects fresh scoped, transitive, and optional locked dependencies", async () => {
  const result = await check(
    {
      "direct@1.0.0": packageEntry,
      "@scope/transitive@2.0.0-beta.1": packageEntry,
      "optional@3.0.0": { ...packageEntry, optional: true },
    },
    {
      direct: { "1.0.0": published(8) },
      "@scope/transitive": { "2.0.0-beta.1": published(6) },
      optional: { "3.0.0": published(1) },
    },
  );
  assert.equal(result.failures.length, 2);
  assert.match(
    result.failures[0],
    /@scope\/transitive@2\.0\.0-beta\.1.*eligible/,
  );
  assert.match(result.failures[1], /optional@3\.0\.0.*eligible/);
});

test("rejects missing or invalid publication dates", async () => {
  const result = await check(
    { "example@1.0.0": packageEntry, "example@2.0.0": packageEntry },
    { example: { "2.0.0": "invalid" } },
  );
  assert.equal(result.failures.length, 2);
  assert.ok(
    result.failures.every((failure) => /missing or invalid/.test(failure)),
  );
});

test("fails closed when registry metadata cannot be fetched", async () => {
  const result = await checkReleaseAge({
    workspace: { minimumReleaseAge: 10080 },
    lockfile: {
      lockfileVersion: "9.0",
      packages: { "example@1.0.0": packageEntry },
    },
    fetchMetadata: async () => {
      throw new Error("registry unavailable");
    },
    now,
  });
  assert.match(result.failures[0], /unable to verify.*registry unavailable/);
});

test("does not allow the workspace policy to drop below seven days", async () => {
  for (const minimumReleaseAge of [undefined, 0, 2880, "10080"]) {
    await assert.rejects(
      check({ "example@1.0.0": packageEntry }, {}, { minimumReleaseAge }),
      /at least 10080/,
    );
  }
});

test("honors a stricter workspace policy", async () => {
  const result = await check(
    { "example@1.0.0": packageEntry },
    { example: { "1.0.0": published(8) } },
    { minimumReleaseAge: 14 * 24 * 60 },
  );
  assert.equal(result.failures.length, 1);
});

test("rejects unverifiable package sources and empty lockfiles", async () => {
  await assert.rejects(
    check({ "example@file:../example": packageEntry }, {}),
    /Cannot verify/,
  );
  await assert.rejects(
    check(
      {
        "example@1.0.0": {
          resolution: { tarball: "https://example.com/example.tgz" },
        },
      },
      {},
    ),
    /Cannot verify/,
  );
  await assert.rejects(check({}, {}), /No locked packages/);
});
