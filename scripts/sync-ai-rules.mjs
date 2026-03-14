/**
 * Sync AI rules from docs/ai markdown files to .cursor/rules/*.mdc
 * Extracts BEGIN:blockName / END:blockName marker blocks and writes one .mdc per block.
 */
import { readFileSync, writeFileSync, mkdirSync, readdirSync } from "fs";
import { join, relative } from "path";
import { fileURLToPath } from "url";

const ROOT = join(fileURLToPath(import.meta.url), "..", "..");
const DOCS_AI = join(ROOT, "docs", "ai");
const CURSOR_RULES = join(ROOT, ".cursor", "rules");

const BEGIN_RE = /<!--\s*BEGIN:([\w.-]+)\s*-->/g;
const END_RE = /<!--\s*END:([\w.-]+)\s*-->/g;

const collectMdFiles = (dir, files = []) => {
  const entries = readdirSync(dir, { withFileTypes: true });
  entries.forEach((entry) => {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      collectMdFiles(full, files);
    } else if (entry.name.endsWith(".md")) {
      files.push(full);
    }
  });
  return files;
};

const extractBlocks = (filePath) => {
  const text = readFileSync(filePath, "utf-8");
  const blocks = [];
  const lines = text.split("\n");
  let i = 0;
  while (i < lines.length) {
    const beginMatch = lines[i].match(/^\s*<!--\s*BEGIN:([\w.-]+)\s*-->\s*$/);
    if (beginMatch) {
      const name = beginMatch[1];
      const contentLines = [];
      i += 1;
      while (i < lines.length) {
        const endMatch = lines[i].match(/^\s*<!--\s*END:([\w.-]+)\s*-->\s*$/);
        if (endMatch && endMatch[1] === name) {
          i += 1;
          break;
        }
        contentLines.push(lines[i]);
        i += 1;
      }
      blocks.push({ name, content: contentLines.join("\n").trim() });
    } else {
      i += 1;
    }
  }
  return blocks;
};

const main = () => {
  const mdFiles = collectMdFiles(DOCS_AI);
  const allBlocks = mdFiles.flatMap((filePath) =>
    extractBlocks(filePath).map((block) => ({
      ...block,
      source: relative(ROOT, filePath),
    }))
  );

  mkdirSync(CURSOR_RULES, { recursive: true });

  allBlocks.forEach(({ name, content, source }) => {
    const safeName = name.replace(/[^a-z0-9._-]/gi, "_");
    const mdcPath = join(CURSOR_RULES, `${safeName}.mdc`);
    const frontmatter = `---
description: AI rule block "${name}" (from ${source})
globs:
alwaysApply: false
---
`;
    writeFileSync(mdcPath, frontmatter + content + "\n", "utf-8");
    console.log("Wrote", relative(ROOT, mdcPath));
  });

  console.log("Sync complete:", allBlocks.length, "rule(s)");
};

main();
