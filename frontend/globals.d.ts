declare global {
  namespace NodeJS {
    interface ProcessEnv {
      ENV: string;
    }
  }
}

export {};
