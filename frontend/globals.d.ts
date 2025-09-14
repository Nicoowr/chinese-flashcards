declare global {
  namespace NodeJS {
    interface ProcessEnv {
      ENV: string;
      NOTION_API_KEY: string;
    }
  }
}

export {};
