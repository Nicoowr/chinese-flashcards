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
    timeout: 20,
  },
  functions: {
    fetchChineseCharacter: {
      handler: "src/api/fetchChineseCharacter.handler",
      events: [
        {
          httpApi: {
            path: "/fetch-chinese-character",
            method: "get",
          },
        },
      ],
    },
    characterUnknown: {
      handler: "src/api/characterUnknown.handler",
      events: [
        {
          httpApi: {
            path: "/character-unknown",
            method: "post",
          },
        },
      ],
    },
    characterKnown: {
      handler: "src/api/characterKnown.handler",
      events: [
        {
          httpApi: {
            path: "/character-known",
            method: "post",
          },
        },
      ],
    },
  },
};

fs.writeFileSync(
  "./serverless.json",
  JSON.stringify(serverlessConfig, null, 2)
);
