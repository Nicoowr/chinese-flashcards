"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchChineseCharactersFromDatabase = exports.fetchChineseCharacterById = exports.notionClient = void 0;
const client_1 = require("@notionhq/client");
const dotenv_1 = require("dotenv");
const mappers_1 = require("../domain/mappers");
(0, dotenv_1.config)();
exports.notionClient = new client_1.Client({ auth: process.env.NOTION_API_KEY });
const NOTION_DATABASE_ID = "e9a17e9f569944f2bbde3bfe0929cddc";
const fetchChineseCharacterById = async (id) => {
    const response = await exports.notionClient.pages.retrieve({
        page_id: id,
    });
    // @ts-ignore: Page type is slightly different from DatabaseObjectResponse type, but it should not matter for this use case
    const character = (0, mappers_1.mapNotionCharacterToChineseCharacter)(response);
    return character;
};
exports.fetchChineseCharacterById = fetchChineseCharacterById;
const fetchChineseCharactersFromDatabase = async (filters, numberOfCharacters) => {
    console.log("Fetching characters with filters:", JSON.stringify(filters, null, 2));
    const response = (await exports.notionClient.databases.query({
        database_id: NOTION_DATABASE_ID,
        page_size: numberOfCharacters,
        filter: filters,
    }));
    console.log("Raw fetched characters:", JSON.stringify(response.results));
    const cleanCharacters = response.results.map(mappers_1.mapNotionCharacterToChineseCharacter);
    console.log({
        "Fetched characters": cleanCharacters,
    });
    return cleanCharacters;
};
exports.fetchChineseCharactersFromDatabase = fetchChineseCharactersFromDatabase;
