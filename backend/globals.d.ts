declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NOTION_API_KEY: string;
    }
  }
}

export {};
