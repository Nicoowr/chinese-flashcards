import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import {
  copyFile,
  mkdir,
  mkdtemp,
  readFile,
  rm,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { promisify } from "node:util";
import { load } from "js-yaml";
import { checkReleaseAge, parseReleaseAgeFiles } from "./check-release-age.mjs";

const now = Date.parse("2026-10-10T12:00:00Z");
const day = 24 * 60 * 60 * 1000;
const published = (daysAgo) => new Date(now - daysAgo * day).toISOString();
const packageEntry = { resolution: { integrity: "sha512-test" } };
const workspaceSource = "packages:\n  - frontend\nminimumReleaseAge: 10080\n";
const lockfileSource =
  "lockfileVersion: '9.0'\npackages:\n  example@1.0.0:\n    resolution: {integrity: sha512-test}\nsnapshots:\n  example@1.0.0: {}\n";

test("reads every real locked package and resolution like the full YAML parser", async () => {
  const [workspace, lockfile] = await Promise.all(
    ["pnpm-workspace.yaml", "pnpm-lock.yaml"].map((file) =>
      readFile(new URL(`../${file}`, import.meta.url), "utf8"),
    ),
  );
  const parsed = parseReleaseAgeFiles(workspace, lockfile);
  const reference = load(lockfile);
  assert.equal(
    parsed.workspace.minimumReleaseAge,
    load(workspace).minimumReleaseAge,
  );
  assert.deepEqual(
    Object.keys(parsed.lockfile.packages),
    Object.keys(reference.packages),
  );
  for (const [name, entry] of Object.entries(parsed.lockfile.packages)) {
    assert.deepEqual(entry.resolution, reference.packages[name].resolution);
  }
});

test("rejects ambiguous or unsupported YAML instead of skipping dependencies", () => {
  for (const source of [
    lockfileSource +
      "packages:\n  hidden@1.0.0:\n    resolution: {integrity: sha512-test}\n",
    lockfileSource.replace("packages:", "packages: *hidden"),
    lockfileSource.replace("  example@1.0.0:", "  <<: *hidden"),
    lockfileSource.replace(
      "resolution: {integrity: sha512-test}",
      "resolution: *hidden",
    ),
    lockfileSource.replace("    resolution:", '    "resolution":'),
    lockfileSource.replace(
      "    resolution:",
      "    resolution: {integrity: sha512-test}\n    resolution:",
    ),
    lockfileSource.replace(
      "snapshots:",
      "  example@1.0.0:\n    resolution: {integrity: sha512-test}\nsnapshots:",
    ),
    lockfileSource.replace("packages:", '"packages":'),
  ]) {
    assert.throws(
      () => parseReleaseAgeFiles(workspaceSource, source),
      /Unsupported|Duplicate|Expected/,
    );
  }
  assert.throws(
    () =>
      parseReleaseAgeFiles(
        workspaceSource + "minimumReleaseAge: 0\n",
        lockfileSource,
      ),
    /duplicate/,
  );
});

test("the production command never imports an installed YAML parser", async (t) => {
  const directory = await mkdtemp(join(tmpdir(), "release-age-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  await mkdir(join(directory, "scripts"));
  await mkdir(join(directory, "node_modules", "js-yaml"), { recursive: true });
  const script = join(directory, "scripts", "check-release-age.mjs");
  await copyFile(new URL("./check-release-age.mjs", import.meta.url), script);
  await Promise.all([
    writeFile(join(directory, "pnpm-workspace.yaml"), workspaceSource),
    writeFile(join(directory, "pnpm-lock.yaml"), lockfileSource),
    writeFile(
      join(directory, "node_modules", "js-yaml", "package.json"),
      '{"main":"index.cjs"}',
    ),
    writeFile(
      join(directory, "node_modules", "js-yaml", "index.cjs"),
      'throw new Error("Unverified dependency executed");',
    ),
    writeFile(
      join(directory, "registry.mjs"),
      'globalThis.fetch = async () => ({ ok: true, json: async () => ({ time: { "1.0.0": "2000-01-01T00:00:00Z" } }) });',
    ),
  ]);
  const { stdout } = await promisify(execFile)(
    process.execPath,
    ["--import", join(directory, "registry.mjs"), script],
    { cwd: directory, timeout: 10_000 },
  );
  assert.match(stdout, /1 locked dependencies meet/);
});

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
