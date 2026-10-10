import { realpathSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { setTimeout as delay } from "node:timers/promises";
import { fileURLToPath } from "node:url";

const SEVEN_DAYS_IN_MINUTES = 7 * 24 * 60;

// Read only pnpm's generated block mappings. Reject unfamiliar syntax rather than
// risk silently skipping a package; no installed dependency may run before the gate.
function readSections(source) {
  const sections = new Map();
  let section;
  for (const line of source.split(/\r?\n/)) {
    if (!line.trim() || line.trimStart().startsWith("#")) continue;
    if (line.startsWith(" ") && section) {
      section.lines.push(line);
      continue;
    }
    const match = line.match(/^([A-Za-z][\w-]*):(?:\s+(.*))?$/);
    if (!match || sections.has(match[1])) {
      throw new Error(`Unsupported or duplicate YAML field: ${line}`);
    }
    section = { value: (match[2] ?? "").replace(/\s*#.*$/, ""), lines: [] };
    sections.set(match[1], section);
  }
  return sections;
}

export function parseReleaseAgeFiles(workspaceSource, lockfileSource) {
  const workspaceSections = readSections(workspaceSource);
  const lockfileSections = readSections(lockfileSource);
  const age = workspaceSections.get("minimumReleaseAge");
  if (!age || age.lines.length || !/^\d+$/.test(age.value)) {
    throw new Error(
      "Expected a numeric minimumReleaseAge in pnpm-workspace.yaml.",
    );
  }
  const version = lockfileSections.get("lockfileVersion");
  if (
    !version ||
    version.lines.length ||
    !/^(?:9\.0|'9\.0'|"9\.0")$/.test(version.value)
  ) {
    throw new Error("Expected a pnpm v9 lockfile.");
  }
  const packageSection = lockfileSections.get("packages");
  if (!packageSection || packageSection.value) {
    throw new Error("Expected a block packages section in pnpm-lock.yaml.");
  }

  const packages = Object.create(null);
  let entry;
  let fields;
  for (const line of packageSection.lines) {
    const key = line.match(
      /^  (?:'([^']+)'|"([^"\\]+)"|([^'"\s][^:]*)):\s*(?:#.*)?$/,
    );
    if (key) {
      const name = key[1] ?? key[2] ?? key[3];
      if (Object.hasOwn(packages, name))
        throw new Error(`Duplicate locked package: ${name}`);
      entry = packages[name] = {};
      fields = new Set();
      continue;
    }
    if (!entry) throw new Error(`Unsupported package mapping: ${line}`);
    const field = line.match(/^    ([A-Za-z][\w]*):(?:\s+(.*))?$/);
    if (field) {
      if (fields.has(field[1]))
        throw new Error(`Duplicate package field: ${line}`);
      fields.add(field[1]);
      if (field[1] === "resolution") {
        const integrity = field[2]?.match(/^\{integrity: ([\w+/=-]+)\}$/);
        if (!integrity)
          throw new Error(`Unsupported package resolution: ${line}`);
        entry.resolution = { integrity: integrity[1] };
      }
    } else if (!/^ {6,}\S/.test(line)) {
      throw new Error(`Unsupported package field: ${line}`);
    }
  }
  return {
    workspace: { minimumReleaseAge: Number(age.value) },
    lockfile: { lockfileVersion: "9.0", packages },
  };
}

async function fetchPublicationTimes(name) {
  for (let attempt = 0; ; attempt++) {
    try {
      const response = await fetch(
        `https://registry.npmjs.org/${encodeURIComponent(name)}`,
        { signal: AbortSignal.timeout(30_000) },
      );
      if (!response.ok) {
        throw new Error(`npm registry returned HTTP ${response.status}`);
      }
      return (await response.json()).time;
    } catch (error) {
      if (attempt === 2) throw error;
      await delay(1000 * (attempt + 1));
    }
  }
}

export async function checkReleaseAge({
  workspace,
  lockfile,
  fetchMetadata = fetchPublicationTimes,
  now = Date.now(),
}) {
  const minutes = workspace?.minimumReleaseAge;
  if (!Number.isSafeInteger(minutes) || minutes < SEVEN_DAYS_IN_MINUTES) {
    throw new Error(
      "minimumReleaseAge must be at least 10080 minutes (7 days).",
    );
  }
  if (String(lockfile?.lockfileVersion) !== "9.0" || !lockfile.packages) {
    throw new Error("Expected a pnpm v9 lockfile with a packages section.");
  }

  const packages = Object.entries(lockfile.packages);
  if (packages.length === 0) throw new Error("No locked packages to check.");

  const versionsByName = new Map();
  for (const [key, entry] of packages) {
    const match = key.match(
      /^(@[^/]+\/[^@]+|[^@/]+)@(\d+\.\d+\.\d+(?:-[\w.-]+)?(?:\+[\w.-]+)?)$/,
    );
    if (
      !match ||
      !entry?.resolution?.integrity ||
      entry.resolution.tarball ||
      entry.resolution.type
    ) {
      throw new Error(`Cannot verify npm publication age for ${key}.`);
    }
    const [, name, version] = match;
    if (!versionsByName.has(name)) versionsByName.set(name, []);
    versionsByName.get(name).push(version);
  }

  const cutoff = now - minutes * 60_000;
  const queue = [...versionsByName];
  const failures = [];
  let index = 0;
  // Fetch each package's full metadata once, including optional/transitive versions.
  await Promise.all(
    Array.from({ length: Math.min(8, queue.length) }, async () => {
      while (index < queue.length) {
        const [name, versions] = queue[index++];
        try {
          const times = await fetchMetadata(name);
          for (const version of versions) {
            const published = times?.[version];
            const publishedAt =
              typeof published === "string" ? Date.parse(published) : NaN;
            if (!Number.isFinite(publishedAt)) {
              failures.push(
                `${name}@${version}: missing or invalid publication date.`,
              );
            } else if (publishedAt > cutoff) {
              const eligibleAt = new Date(
                publishedAt + minutes * 60_000,
              ).toISOString();
              failures.push(
                `${name}@${version}: published ${published}; eligible ${eligibleAt}.`,
              );
            }
          }
        } catch (error) {
          failures.push(
            `${name}: unable to verify publication dates (${error.message}).`,
          );
        }
      }
    }),
  );
  return { packagesChecked: packages.length, failures: failures.sort() };
}

async function main() {
  const root = new URL("../", import.meta.url);
  const sources = await Promise.all(
    ["pnpm-workspace.yaml", "pnpm-lock.yaml"].map((file) =>
      readFile(new URL(file, root), "utf8"),
    ),
  );
  const { workspace, lockfile } = parseReleaseAgeFiles(...sources);
  const { packagesChecked, failures } = await checkReleaseAge({
    workspace,
    lockfile,
  });
  if (failures.length > 0) {
    console.error(
      `Dependency release age check failed:\n${failures.join("\n")}`,
    );
    process.exitCode = 1;
  } else {
    console.log(
      `${packagesChecked} locked dependencies meet the ${workspace.minimumReleaseAge}-minute release age policy.`,
    );
  }
}

if (
  process.argv[1] &&
  realpathSync(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  main().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
