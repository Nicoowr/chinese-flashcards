import type { Serverless } from "serverless/aws";
import fs from "fs";

const serverlessConfig: Serverless = {
  service: "chinese-flashcards",
  provider: {
    name: "aws",
    region: "eu-west-3",
    runtime: "nodejs18.x",
    logRetentionInDays: 14,
    architecture: "arm64",
    stage: "${opt:stage, 'dev'}",
    httpApi: {
      cors: true,
    },
    environment: {
      NOTION_API_KEY: "${env:NOTION_API_KEY}",
      NOTION_DATABASE_ID: "${env:NOTION_DATABASE_ID}",
    },
    timeout: 30,
  },
  functions: {
    fetchChineseCharacter: {
      handler: "api/fetchChineseCharacter.handler",
    },
  },
};

fs.writeFileSync(
  "./serverless.json",
  JSON.stringify(serverlessConfig, null, 2)
);
