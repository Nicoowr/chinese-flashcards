# Chinese Flashcards

A flashcard application for learning Chinese characters, now backed by Supabase (Postgres).

## Architecture

- `frontend` (Next.js App Router):
  - Study app UI (`/`)
  - API routes for flashcard logic
  - In-context create/edit modal on the main flashcard page

## Database setup (Supabase)

1. Create a Supabase project.
2. Apply SQL migration:
   - `frontend/supabase/migrations/20260307195000_create_chinese_characters.sql`
3. Set environment variables in `frontend/.env.local`:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`

## Notion data migration (one-time)

If your data is still in Notion, run:

```bash
cd frontend
pnpm migrate:notion-to-supabase
```

Required env vars for the migration script:
- `NOTION_API_KEY`
- `NOTION_VOCABULARY_DATASOURCE_ID` (or `NOTION_DATABASE_ID`)
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

## API endpoints

- `POST /api/fetch-chinese-character`
- `POST /api/character-known`
- `POST /api/character-unknown`
- `POST /api/admin/characters`
- `PATCH /api/admin/characters/:id`
- `DELETE /api/admin/characters/:id`

### Getting Started

```bash
cd frontend
pnpm install

pnpm dev
```
