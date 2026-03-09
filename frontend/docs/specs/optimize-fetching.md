## Flashcards: Prefetch Queue + Back + Unique Counter + Sonner Toasts

### Objective
- Eliminate per-card wait by prefetching.
- Add “Back” to correct mistakes.
- Count unique cards seen.
- Show brief error toasts using Sonner.

### High-level behavior
- On page load (and filter changes), fetch 2 distinct characters → `current`, `next`.
- On Known/Unknown:
  - Optimistically shift: `previous = current`, `current = next`, `next = null`.
  - Fire-and-forget mutation for the old `current`.
  - Prefetch a new `next` in background.
- On Back:
  - If `previous` exists: `next = next ?? current`, `current = previous`, `previous = null`.
  - No network call.
- Keyboard: Left=Known, Right=Unknown, Up=Reveal/Hide, Backspace=Back (prevent browser navigation).
- Counter: top-right shows unique cards seen (size of an immutable Set), resets on filter changes.

### Constraints (repo rules)
- Functional style: isolate I/O at handlers; domain helpers are pure.
- Avoid loops: no `for`/`while` and no `reduce`. Use recursion and small helpers.
- Immutability: never mutate inputs; return new objects/sets.

---

## Changes by file

### 1) `frontend/package.json`
- Add dependency:
  - `sonner` (toaster library).

### 2) `frontend/src/app/layout.tsx`
- Add Sonner provider once at the root:
  - Import `{ Toaster }` from `sonner`.
  - Render `<Toaster richColors />` near the root of the body.

### 3) `frontend/src/components/FlashcardsContainer.queries.ts`
- Ensure this is exported for direct use in the container:
  - `export const fetchChineseCharacter(...) => Promise<ChineseCharacter>`
- Keep `useFetchChineseCharacter` exported (unused after refactor but retained for future).

### 4) `frontend/src/components/FlashcardsContainer.tsx`
- Replace single-item query usage with a local queue and prefetching.
- State:
  - `previous: ChineseCharacter | null`
  - `current: ChineseCharacter | null`
  - `next: ChineseCharacter | null`
  - `seenIdSet: Set<string>`
  - `showIdeogram: boolean`
  - `characterType: CharacterType | null`
  - `characterImportance: CharacterImportance | null`
- Derived:
  - `isLoading = current == null`
  - `uniqueSeenCount = seenIdSet.size`
- Pure helpers (no side-effects):
  - `shiftForward({ previous, current, next })`
    - Returns `{ previous: current, current: next, next: null }`
  - `shiftBack({ previous, current, next })`
    - Returns `{ previous: null, current: previous, next: next ?? current }`
  - `fetchDistinct(params)(excludeIds, attemptsLeft = 5)`
    - Recursively fetch one character.
    - If fetched id is in `excludeIds` and `attemptsLeft > 0`, recurse with `attemptsLeft - 1`.
    - Else return the fetched character.
- Lifecycle:
  - On mount and when `characterType`/`characterImportance` change:
    - Reset `previous/current/next`, `seenIdSet`, `showIdeogram`.
    - Fetch first → set `current` and `seenIdSet = new Set([first.id])`.
    - Fetch second excluding first id → set `next`.
- Handlers (I/O at the boundary):
  - `handleCheck`/`handleUnknown`:
    - If `current` exists: store `oldId = current.id`.
    - Optimistically `shiftForward`.
    - Add new `current?.id` to `seenIdSet` immutably: `new Set(prev).add(current.id)`.
    - Fire-and-forget mutation (`known`/`unknown`) with `oldId`.
    - `prefetchNext` excluding ids from the queue. On error → `toast.error("Failed to fetch next card")`.
  - `handleReveal`: toggle `showIdeogram`.
  - `handleBack`:
    - If `previous` exists: `shiftBack`.
    - After switching, add `current.id` to `seenIdSet` if not present.
  - Keyboard listener in `useEffect`:
    - Left=Known, Right=Unknown, Up=Reveal, Backspace=Back (use `event.preventDefault()`).
- Error handling with Sonner:
  - On mutation failure: `toast.error("Unable to update card, please try again.")`.
  - On prefetch failure: `toast.error("Failed to fetch next card.")`.

- UI:
  - Display `uniqueSeenCount` in the existing top-right `Card`.
  - Pass `handleBack` and `canGoBack={!!previous}` to the panel.

### 5) `frontend/src/components/CharacterPanel/CharacterPanel.tsx`
- Props: add `handleBack: () => void`, `canGoBack: boolean`.
- Pass through to `ControlButtons`.

### 6) `frontend/src/components/CharacterPanel/ControlButtons.tsx`
- Add a “Back” button:
  - `disabled` when `isLoading || !canGoBack`.
- Keep Check/Reveal/Unknown as-is.

---

## Sonner integration specifics

- Install:
  - `cd frontend && pnpm add sonner`
- Root setup in `layout.tsx`:
  - `import { Toaster } from "sonner";`
  - Place `<Toaster richColors />` once in the app root.
- Usage:
  - `import { toast } from "sonner";`
  - `toast.error("...")` in mutation/prefetch error branches.

---

## Acceptance criteria

- On load: two characters are fetched; first is shown immediately; second is ready (no visible delay when answering).
- Known/Unknown:
  - UI navigates instantly to the next card.
  - Previous becomes available for “Back”.
  - Network mutation happens in background; on failure, a Sonner error toast appears; user can continue.
  - Next card is prefetched in background (if it fails, a Sonner error toast appears).
- Back:
  - Works when a previous card exists; no network call triggered by Back itself.
  - After going back, answering re-sends the intended state for that card.
- Counter:
  - Shows the number of unique cards seen in the session.
  - Resets when filters change.
- Keyboard:
  - Left=Known, Right=Unknown, Up=Reveal/Hide, Backspace=Back.
  - Backspace does not cause browser navigation.

---

## Manual test plan

- Initial load:
  - Spinner only until `current` populated; then shows card details.
  - Counter = 1.
- Answer flow:
  - Press Known (button and ArrowLeft); navigate instantly to next; counter increments to 2.
  - Press Unknown (button and ArrowRight); navigate instantly; counter increments correctly.
- Back:
  - After at least one answer, Back is enabled (button and Backspace).
  - Back moves to prior card; counter remains the number of unique cards seen (does not decrement).
- Filters:
  - Change type/importance; queue resets; first and second fetched anew; counter reset.
- Error cases:
  - Force network errors (disconnect/devtools) and ensure Sonner toasts appear for mutation and prefetch failures.
  - App remains usable; next attempts recover.

---

## Future enhancements (optional)
- Batch API endpoint (fetch N at once) to further reduce round-trips.
- Queue depth > 2 (e.g., keep 2 next cards) if latency remains noticeable.
- Extract queue logic and helpers into a small, tested module.
