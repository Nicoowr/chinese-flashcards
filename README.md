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

## API endpoints

- `POST /api/fetch-chinese-character`
- `POST /api/character-known`
- `POST /api/character-unknown`
- `POST /api/generate-character-details`
- `POST /api/admin/characters`
- `PATCH /api/admin/characters/:id`
- `DELETE /api/admin/characters/:id`

## Character details generation (OpenRouter)

The character editor can generate an English translation, a Chinese example sentence, and a part of speech through OpenRouter.

1. Create an API key at [OpenRouter](https://openrouter.ai/settings/keys).
2. Add `OPENROUTER_API_KEY=your_key` to `frontend/.env.local`, or to your hosting provider's server environment variables for a deployed app.
3. Restart the development server, or redeploy after changing the hosting environment variables.

The default model is [`dots-studio/dots-3-note-preview:free`](https://openrouter.ai/dots-studio/dots-3-note-preview:free), selected after comparing English meanings and Chinese example sentences on six sample words. Set `OPENROUTER_MODEL` to override it with another `:free` model that supports JSON-schema output and disabling reasoning. If that model is unavailable or rate-limited, OpenRouter automatically tries [`nvidia/nemotron-3.5-super-vl:free`](https://openrouter.ai/nvidia/nemotron-3.5-super-vl:free). All requested models are free, and paid model IDs are rejected. Requests use strict JSON schemas, and the server validates the result before returning it to the editor.

The Dots preview is currently scheduled to retire on December 31, 2026; the NVIDIA fallback allows generation to continue if the preview is removed. When updating the model, also update any `OPENROUTER_MODEL` override in your hosting environment.

OpenRouter free models have rate limits and availability can change. Generation reports when the service is busy or a free usage limit is reached. The API key stays on the server; `OPENAI_API_KEY` is no longer used.

Generation sends the entered word or phrase and instructions to OpenRouter and the selected model provider. Provider retention policies apply; this integration does not require zero data retention. Use it for non-sensitive vocabulary and review generated translations before saving. See [OpenRouter's provider policies](https://openrouter.ai/providers/) and the [NVIDIA free endpoint's data-use notice](https://openrouter.ai/nvidia/nemotron-3.5-super-vl:free).

### Getting Started

```bash
cd frontend
pnpm install

pnpm dev
```
