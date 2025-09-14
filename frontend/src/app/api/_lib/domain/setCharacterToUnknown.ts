import dayjs from "dayjs";
import { notionClient } from "../dependencies/notion";
import {
  levelOfConfidenceMappingFromDomainToNotion,
  propertiesMappingFromDomainToNotion,
} from "./mappers";

export const setCharacterToUnknown = async (id: string): Promise<void> => {
  console.log("Updating character with ID:", id);

  await notionClient.pages.update({
    page_id: id,
    properties: {
      [propertiesMappingFromDomainToNotion.lastSeenAt]: {
        date: {
          start: dayjs().format("YYYY-MM-DD"),
        },
      },
      [propertiesMappingFromDomainToNotion.levelOfConfidence]: {
        status: {
          name: levelOfConfidenceMappingFromDomainToNotion["low"],
        },
      },
    },
  });
};
