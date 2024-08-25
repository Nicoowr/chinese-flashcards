"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const notion_1 = require("../dependencies/notion");
const notionFilter_1 = require("../domain/notionFilter");
const handler = async (event) => {
    console.log("Event", event);
    const payload = JSON.parse(event.body);
    const eligibleCharacters = await (0, notion_1.fetchChineseCharactersFromDatabase)((0, notionFilter_1.notKnownCharactersFilter)({ characterType: payload.characterType }), 50);
    const charactersNeedingRefresh = eligibleCharacters.filter(notionFilter_1.characterNeedsRefresh);
    const selectedCharacter = (0, notionFilter_1.selectRandomCharacter)(charactersNeedingRefresh);
    return {
        statusCode: 200,
        body: JSON.stringify({ character: selectedCharacter }),
    };
};
exports.handler = handler;
