import dayjs from "dayjs";
import {
  propertiesMappingFromDomainToNotion,
  importanceMappingFromDomainToNotion,
} from "./mappers";

export const notKnownCharacterFilter = {
  or: [
    {
      and: [
        {
          property: propertiesMappingFromDomainToNotion.lastSeenAt,
          date: {
            before: dayjs().subtract(1, "month").format("YYYY-MM-DD"),
          },
        },
        {
          property: propertiesMappingFromDomainToNotion.levelOfConfidence,
          status: {
            equals: "✅",
          },
        },
        {
          property: propertiesMappingFromDomainToNotion.importance,
          select: {
            equals: importanceMappingFromDomainToNotion.high,
          },
        },
      ],
    },
    {
      and: [
        {
          property: propertiesMappingFromDomainToNotion.lastSeenAt,
          date: {
            before: dayjs().subtract(1, "week").format("YYYY-MM-DD"),
          },
        },
        {
          property: propertiesMappingFromDomainToNotion.levelOfConfidence,
          status: {
            equals: "❌",
          },
        },
        {
          property: propertiesMappingFromDomainToNotion.importance,
          select: {
            equals: importanceMappingFromDomainToNotion.high,
          },
        },
      ],
    },
  ],
};
