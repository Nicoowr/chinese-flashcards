declare global {
  namespace NodeJS {
    interface ProcessEnv {
      ENV: string;
      NOTION_API_KEY: string;
      NOTION_DATABASE_ID: string;
      NOTION_VOCABULARY_DATASOURCE_ID: string;
    }
  }
}

export {};
