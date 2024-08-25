import dayjs from "dayjs";
import {
  fetchChineseCharacterById,
  notionClient,
} from "../dependencies/notion";
import {
  propertiesMappingFromDomainToNotion,
  levelOfConfidenceMappingFromDomainToNotion,
} from "./mappers";

export const setCharacterToKnown = async (id: string): Promise<void> => {
  console.log("Setting character with ID to known", id);

  const character = await fetchChineseCharacterById(id);

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
          name: levelOfConfidenceMappingFromDomainToNotion["high"],
        },
      },
      [propertiesMappingFromDomainToNotion.numberOfCorrectAnswers]: {
        type: "number",
        number: (character.numberOfCorrectAnswers ?? 0) + 1,
      },
    },
  });
};
