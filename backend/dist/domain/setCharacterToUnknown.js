"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setCharacterToUnknown = void 0;
const dayjs_1 = __importDefault(require("dayjs"));
const notion_1 = require("../dependencies/notion");
const mappers_1 = require("./mappers");
const setCharacterToUnknown = async (id) => {
    console.log("Updating character with ID:", id);
    await notion_1.notionClient.pages.update({
        page_id: id,
        properties: {
            [mappers_1.propertiesMappingFromDomainToNotion.lastSeenAt]: {
                type: "date",
                date: {
                    start: (0, dayjs_1.default)().format("YYYY-MM-DD"),
                },
            },
            [mappers_1.propertiesMappingFromDomainToNotion.levelOfConfidence]: {
                type: "status",
                status: {
                    name: mappers_1.levelOfConfidenceMappingFromDomainToNotion["low"],
                },
            },
        },
    });
};
exports.setCharacterToUnknown = setCharacterToUnknown;
