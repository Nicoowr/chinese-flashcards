declare global {
  namespace NodeJS {
    interface ProcessEnv {
      ENV: string;
      NOTION_API_KEY?: string;
      NOTION_DATABASE_ID?: string;
      NOTION_VOCABULARY_DATASOURCE_ID?: string;
      NEXT_PUBLIC_SUPABASE_URL?: string;
      NEXT_PUBLIC_SUPABASE_ANON_KEY?: string;
      SUPABASE_URL: string;
      SUPABASE_SERVICE_ROLE_KEY: string;
    }
  }
}

export {};
