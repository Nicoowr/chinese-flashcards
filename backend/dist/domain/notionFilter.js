"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.selectRandomCharacter = exports.characterNeedsRefresh = exports.notKnownCharactersFilter = void 0;
const dayjs_1 = __importDefault(require("dayjs"));
const mappers_1 = require("./mappers");
const lodash_es_1 = require("lodash-es");
const notKnownCharactersFilter = ({ characterType, characterImportance, }) => {
    return {
        or: [
            {
                and: (0, lodash_es_1.compact)([
                    {
                        property: mappers_1.propertiesMappingFromDomainToNotion.lastSeenAt,
                        date: {
                            before: (0, dayjs_1.default)().subtract(1, "month").format("YYYY-MM-DD"),
                        },
                    },
                    {
                        property: mappers_1.propertiesMappingFromDomainToNotion.levelOfConfidence,
                        status: {
                            equals: "✅",
                        },
                    },
                    characterImportance && {
                        property: mappers_1.propertiesMappingFromDomainToNotion.importance,
                        select: {
                            equals: mappers_1.importanceMappingFromDomainToNotion[characterImportance],
                        },
                    },
                    characterType && {
                        property: mappers_1.propertiesMappingFromDomainToNotion.type,
                        multi_select: {
                            contains: mappers_1.typesMappingFromDomainToNotion[characterType],
                        },
                    },
                ]),
            },
            {
                and: (0, lodash_es_1.compact)([
                    {
                        property: mappers_1.propertiesMappingFromDomainToNotion.lastSeenAt,
                        date: {
                            before: (0, dayjs_1.default)().subtract(1, "week").format("YYYY-MM-DD"),
                        },
                    },
                    {
                        property: mappers_1.propertiesMappingFromDomainToNotion.levelOfConfidence,
                        status: {
                            equals: "❌",
                        },
                    },
                    characterImportance && {
                        property: mappers_1.propertiesMappingFromDomainToNotion.importance,
                        select: {
                            equals: mappers_1.importanceMappingFromDomainToNotion[characterImportance],
                        },
                    },
                    characterType && {
                        property: mappers_1.propertiesMappingFromDomainToNotion.type,
                        multi_select: {
                            contains: mappers_1.typesMappingFromDomainToNotion[characterType],
                        },
                    },
                ]),
            },
        ],
    };
};
exports.notKnownCharactersFilter = notKnownCharactersFilter;
// This means that everytime a character is remembered, we can add 2 more weeks before considering it as forgotten again
const DECAYING_RATE_IN_WEEKS = 2;
const characterNeedsRefresh = (character) => {
    const characterIsNotKnown = character.levelOfConfidence === "low";
    const numberOfCorrectAnswers = character.numberOfCorrectAnswers ?? 0;
    const chatacterMightHaveBeenForgotten = character.levelOfConfidence === "high" &&
        (0, dayjs_1.default)().diff((0, dayjs_1.default)(character.lastSeenAt), "day") >
            numberOfCorrectAnswers * DECAYING_RATE_IN_WEEKS * 7;
    return characterIsNotKnown || chatacterMightHaveBeenForgotten;
};
exports.characterNeedsRefresh = characterNeedsRefresh;
const selectRandomCharacter = (characters) => {
    const randomCharacter = characters[Math.floor(Math.random() * characters.length)];
    console.log("Random character selected:", randomCharacter);
    return randomCharacter;
};
exports.selectRandomCharacter = selectRandomCharacter;
