import * as fs from "node:fs";
import * as path from "node:path";

type SectionEntry = {
    id: string;
    content: string;
    sourcePath: string;
};

type OutputFile = {
    path: string;
    content: string;
};

const ROOT_DIR = process.cwd();
const MARKER_PATTERN =
    /<!-- BEGIN:([a-zA-Z0-9._-]+) -->\n([\s\S]*?)\n<!-- END:\1 -->/g;

const SOURCE_FILES = [
    "docs/ai/core-rules.md",
    "docs/ai/routing.md",
    "docs/ai/tooling/cursor.md",
];

const AUTO_GENERATED_HEADER = [
    "<!-- AUTO-GENERATED FILE. DO NOT EDIT DIRECTLY. -->",
    "<!-- Edit docs/ai/* and run: pnpm sync:ai-rules -->",
    "",
].join("\n");

const readSourceFile = (relativePath: string): string => {
    const absolutePath = path.join(ROOT_DIR, relativePath);
    if (!fs.existsSync(absolutePath)) {
        console.error(`Missing AI rules source file: ${relativePath}`);
        process.exit(1);
    }

    return fs.readFileSync(absolutePath, "utf-8");
};

const parseSectionsFromFile = (params: {
    relativePath: string;
    content: string;
}): Array<SectionEntry> =>
    [...params.content.matchAll(MARKER_PATTERN)].map((match) => ({
        id: match[1],
        content: match[2].trim(),
        sourcePath: params.relativePath,
    }));

const ensureNoDuplicateSectionIds = (entries: Array<SectionEntry>) => {
    const ids = entries.map((entry) => entry.id);
    const duplicateIds = ids.filter((id, index) => ids.indexOf(id) !== index);
    const uniqueDuplicateIds = duplicateIds.filter(
        (id, index) => duplicateIds.indexOf(id) === index,
    );

    if (uniqueDuplicateIds.length === 0) return;

    console.error(
        `Duplicate AI section markers found: ${uniqueDuplicateIds.join(", ")}`,
    );
    process.exit(1);
};

const createSectionLookup = (
    entries: Array<SectionEntry>,
): Record<string, SectionEntry> =>
    Object.fromEntries(entries.map((entry) => [entry.id, entry]));

const requireSection = (
    sectionLookup: Record<string, SectionEntry>,
    id: string,
): string => {
    const entry = sectionLookup[id];

    if (entry) return entry.content;

    console.error(`Missing required AI section marker: ${id}`);
    process.exit(1);
};

const getOptionalSection = (
    sectionLookup: Record<string, SectionEntry>,
    id: string,
): string => sectionLookup[id]?.content.trim() ?? "";

const withTrailingNewline = (content: string): string =>
    content.endsWith("\n") ? content : `${content}\n`;

const joinSections = (sections: Array<string>): string =>
    sections
        .map((section) => section.trim())
        .filter((section) => section.length > 0)
        .join("\n\n");

const renderCursorRule = (params: {
    description: string;
    sectionId: string;
    includeCursorAdditions: boolean;
    sectionLookup: Record<string, SectionEntry>;
}): string => {
    const sharedSection = requireSection(
        params.sectionLookup,
        params.sectionId,
    );
    const cursorAdditions = params.includeCursorAdditions
        ? getOptionalSection(params.sectionLookup, "cursor.additions")
        : "";
    const body = joinSections([sharedSection, cursorAdditions]);

    return withTrailingNewline(
        [
            "---",
            `description: ${params.description}`,
            "alwaysApply: true",
            "---",
            "",
            AUTO_GENERATED_HEADER,
            body,
        ].join("\n"),
    );
};

const buildOutputs = (
    sectionLookup: Record<string, SectionEntry>,
): Array<OutputFile> => [
    {
        path: ".cursor/rules/coding-standards.mdc",
        content: renderCursorRule({
            description: "Core coding standards for the project",
            sectionId: "shared.coding-standards",
            includeCursorAdditions: true,
            sectionLookup,
        }),
    },
    {
        path: ".cursor/rules/design-system.mdc",
        content: renderCursorRule({
            description: "Use design system components from src/components/ui/",
            sectionId: "shared.design-system",
            includeCursorAdditions: false,
            sectionLookup,
        }),
    },
    {
        path: ".cursor/rules/request-relevance.mdc",
        content: renderCursorRule({
            description:
                "Analyze request relevance before taking action",
            sectionId: "shared.request-relevance",
            includeCursorAdditions: false,
            sectionLookup,
        }),
    },
    {
        path: ".cursor/rules/shared.routing.mdc",
        content: renderCursorRule({
            description: "Task routing and source-of-truth for AI docs",
            sectionId: "shared.routing",
            includeCursorAdditions: false,
            sectionLookup,
        }),
    },
    {
        path: ".cursor/rules/shared.cursor-rules.mdc",
        content: renderCursorRule({
            description: "Cursor project rules (FP, state, naming, React)",
            sectionId: "shared.cursor-rules",
            includeCursorAdditions: false,
            sectionLookup,
        }),
    },
];

const ensureParentDirectoryExists = (relativePath: string) => {
    const absolutePath = path.join(ROOT_DIR, relativePath);
    fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
};

const getCurrentFileContent = (relativePath: string): string => {
    const absolutePath = path.join(ROOT_DIR, relativePath);
    return fs.existsSync(absolutePath)
        ? fs.readFileSync(absolutePath, "utf-8")
        : "";
};

const writeOutputs = (outputs: Array<OutputFile>) => {
    const writtenPaths = outputs.map((output) => {
        ensureParentDirectoryExists(output.path);
        const absolutePath = path.join(ROOT_DIR, output.path);
        fs.writeFileSync(absolutePath, output.content);
        return output.path;
    });

    console.log(`AI rules synchronized: ${writtenPaths.join(", ")}`);
};

const checkOutputs = (outputs: Array<OutputFile>) => {
    const changedPaths = outputs
        .filter(
            (output) => getCurrentFileContent(output.path) !== output.content,
        )
        .map((output) => output.path);

    if (changedPaths.length === 0) {
        console.log("AI rules are in sync.");
        return;
    }

    const changedPathsList = changedPaths.map(
        (changedPath) => `- ${changedPath}`,
    );
    console.error(`AI rules are out of sync:\n${changedPathsList.join("\n")}`);
    console.error("Run `pnpm sync:ai-rules` to regenerate.");
    process.exit(1);
};

const run = () => {
    const isCheckMode = process.argv.slice(2).includes("--check");
    const entries = SOURCE_FILES.flatMap((filePath) => {
        const content = readSourceFile(filePath);
        return parseSectionsFromFile({ relativePath: filePath, content });
    });

    ensureNoDuplicateSectionIds(entries);
    const sectionLookup = createSectionLookup(entries);
    const outputs = buildOutputs(sectionLookup);

    if (isCheckMode) {
        checkOutputs(outputs);
        return;
    }

    writeOutputs(outputs);
};

run();
