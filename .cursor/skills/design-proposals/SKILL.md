---
name: design-proposals
description: Generate and present multiple visual UX/UI design proposals as interactive HTML mockups. Use when the user asks to propose, explore, or compare designs, layouts, or UX ideas for a feature — or when a feature request could benefit from visual exploration before implementation.
---

# Design Proposals

Generate 2–3 standalone HTML mockups so the user can visually compare UX directions before committing to one. This is a two-phase workflow: first explore via HTML mockups, then implement the chosen direction with real components.

## Phase 1 — HTML Mockups (exploration)

### Step 1: Understand the project's design language

Before creating any mockup, check if a **project design system reference** exists:

1. Look for `.design-proposals/design-system.md` in the project root.
2. **If it exists**, read it — it contains the project's colors, fonts, CSS utilities, layout patterns, and example markup ready to reuse in mockups. Skip discovery and go to Step 2.
3. **If it doesn't exist**, discover the design language manually:
   - Find the global CSS file (e.g., `globals.css`, `index.css`, `tailwind.config.*`) — extract colors, fonts, border radii, and any custom utilities.
   - Scan 1–2 existing page/layout files to understand overall structure (navigation, spacing, dark/light mode).
   - Note the component library in use (shadcn, Radix, MUI, Chakra, plain HTML…).
   - **Then offer to create the reference file** for future sessions (see "Creating a design system reference" below).

### Step 2: Create the mockups

1. Create a `.design-proposals/` directory at the project root (add it to `.gitignore` if not already present, along with `.screenshots/`).
2. For each proposal, create a self-contained HTML file:
   - Name files descriptively: `option-a-<short-label>.html`, `option-b-<short-label>.html`, etc.
   - Use **Tailwind CDN** (`<script src="https://cdn.tailwindcss.com"></script>`) for utility classes.
   - Import the same font the project uses (e.g., Google Fonts link).
   - Replicate the project's color palette and visual style via inline `<style>` — match dark/light mode, glass effects, gradients, border styles, etc.
   - Each file must be fully self-contained (no external dependencies beyond CDN links).
   - Add a **colored annotation banner** fixed at the top of each page, briefly describing the design direction (use a distinct color per option so they're easy to tell apart).
   - Populate with realistic placeholder content relevant to the feature.

### Step 3: Present the mockups

1. Start a local HTTP server in `.design-proposals/`:
   ```
   python3 -m http.server 8899
   ```
   Run it in the background (block_until_ms: 0, full_network permission).
2. Open each mockup in the Cursor built-in browser at `http://localhost:8899/<filename>.html`.
3. Resize the browser to **1440×900** before taking screenshots.
4. Take a screenshot of each option.
5. After all screenshots, provide a structured comparison:
   - For each option: a short description, **best for**, and **trade-off**.
   - Ask the user which direction they prefer, or if they want to mix elements.

### Iteration

When the user requests tweaks to a specific option, edit that HTML file in place and reload the browser. Do not recreate the file from scratch.

## Phase 2 — Real implementation (after the user picks a direction)

Once a direction is chosen:

1. Create a temporary design route or page in the project (e.g., `src/app/(design)/...` or equivalent for the framework in use).
2. Implement the chosen design using the project's **actual** components, styles, and data types.
3. Let the user validate on the dev server.
4. When approved, move the implementation to its final location and clean up design artifacts.

## Creating a design system reference

When a project doesn't have a `design-system.md` yet, offer to create one after the first design session. The file captures everything needed to replicate the project's visual style in standalone HTML mockups.

Store it at `.design-proposals/design-system.md` (already gitignored alongside the mockups).

The reference should include:
- **Theme**: dark/light mode, background colors (HSL values)
- **Color palette**: primary, secondary, muted, accent, destructive — with exact HSL values from the CSS
- **Typography**: font family, Google Fonts import URL, key sizes
- **Border & radius**: radius values, border colors
- **Custom utilities**: any project-specific CSS like glass effects, gradients, shadows — copy the exact CSS
- **Layout patterns**: typical page structure (e.g., "3-column: filters | main card | sidebar")
- **Component library**: which library is used, key components (Button, Card, etc.)
- **HTML boilerplate**: a ready-to-copy `<head>` block with all CDN links, font imports, and `<style>` block so new mockups can be started instantly

Keep the reference concise (under 150 lines). It's a cheat sheet, not full documentation.

## Rules

- **Never** use the image generation tool for design proposals — it produces hallucinated UI elements and doesn't match the project's design system.
- Always propose **2–3 options**, not just one. The value is in comparison.
- Each option should represent a **fundamentally different UX approach** (e.g., side panel vs. full page vs. drawer), not just color or spacing variations.
- Keep mockups focused on layout, information hierarchy, and interaction flow — pixel-perfect polish is not the goal at this stage.
- Use an opaque (not glass/transparent) background on the drawer/panel containers if the page background is dark — semi-transparent glass is invisible against matching dark backgrounds in standalone mockups.
