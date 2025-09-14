# Chinese Flashcards

A flashcard application for learning Chinese characters, integrated with Notion API.

## Recent Updates

### Migration to Notion API v5

The backend has been successfully migrated from Notion API v2 to v5. Key changes include:

1. **Import paths updated**: The types are now imported directly from `@notionhq/client/build/src/api-endpoints`
2. **Property type definitions simplified**: In v5, property types are inferred automatically when updating pages
3. **Type assertions updated**: Using `isFullPage` helper and proper type guards for PageObjectResponse
4. **API routes migrated**: All API routes now use the App Router structure in Next.js

### API Endpoints

- `POST /api/fetch-chinese-character` - Fetches a random Chinese character based on filters
- `POST /api/character-known` - Marks a character as known
- `POST /api/character-unknown` - Marks a character as unknown

### Environment Variables

Make sure to set the following environment variable:
- `NOTION_API_KEY` - Your Notion integration API key

### Getting Started

```bash
# Install dependencies
cd frontend
pnpm install

# Run development server
pnpm dev
```