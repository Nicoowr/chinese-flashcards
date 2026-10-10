import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { setTimeout as delay } from "node:timers/promises";
import { fileURLToPath } from "node:url";
import { load } from "js-yaml";

const SEVEN_DAYS_IN_MINUTES = 7 * 24 * 60;

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
  const [workspace, lockfile] = await Promise.all(
    ["pnpm-workspace.yaml", "pnpm-lock.yaml"].map(async (file) =>
      load(await readFile(new URL(file, root), "utf8")),
    ),
  );
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
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  main().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
