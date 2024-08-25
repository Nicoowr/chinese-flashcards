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
        type: "date",
        date: {
          start: dayjs().format("YYYY-MM-DD"),
        },
      },
      [propertiesMappingFromDomainToNotion.levelOfConfidence]: {
        type: "status",
        status: {
          name: levelOfConfidenceMappingFromDomainToNotion["low"],
        },
      },
    },
  });
};
