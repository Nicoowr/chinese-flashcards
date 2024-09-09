"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mapNotionCharacterToChineseCharacter = exports.propertiesMappingFromDomainToNotion = exports.importanceMappingFromDomainToNotion = exports.levelOfConfidenceMappingFromDomainToNotion = exports.typesMappingFromDomainToNotion = void 0;
const notionFieldExtractors_1 = require("./notionFieldExtractors");
const typesMappingFromNotionToDomain = {
    Verb: "verb",
    Noun: "noun",
    Adjective: "adjective",
    Adverb: "adverb",
    Link: "link",
};
exports.typesMappingFromDomainToNotion = {
    verb: "Verb",
    noun: "Noun",
    adjective: "Adjective",
    adverb: "Adverb",
    link: "Link",
};
const levelsOfConfidenceMappingFromNotionToDomain = {
    "✅": "high",
    "❌": "low",
};
exports.levelOfConfidenceMappingFromDomainToNotion = {
    high: "✅",
    low: "❌",
};
const importanceMappingFromNotionToDomain = {
    High: "high",
    Medium: "medium",
    Low: "low",
};
exports.importanceMappingFromDomainToNotion = {
    high: "High",
    medium: "Medium",
    low: "Low",
};
exports.propertiesMappingFromDomainToNotion = {
    id: "id",
    character: "Character",
    translation: "Translation",
    example: "Example",
    addedAt: "Added At",
    type: "Type",
    importance: "Importance",
    lastSeenAt: "Last Seen At",
    numberOfCorrectAnswers: "Number Of Correct Answers",
    levelOfConfidence: "❤️",
};
const mapNotionCharacterToChineseCharacter = ({ id, properties, }) => {
    const character = (0, notionFieldExtractors_1.extractNotionTitle)(properties[exports.propertiesMappingFromDomainToNotion.character]);
    const translation = (0, notionFieldExtractors_1.extractNotionRichText)(properties[exports.propertiesMappingFromDomainToNotion.translation]);
    const example = (0, notionFieldExtractors_1.extractNotionRichText)(properties[exports.propertiesMappingFromDomainToNotion.example]);
    const addedAt = (0, notionFieldExtractors_1.extractNotionDate)(properties[exports.propertiesMappingFromDomainToNotion.addedAt]);
    const type = (0, notionFieldExtractors_1.extractMultiSelectFirstValue)(properties[exports.propertiesMappingFromDomainToNotion.type]);
    const importance = (0, notionFieldExtractors_1.extractSelectValue)(properties[exports.propertiesMappingFromDomainToNotion.importance]);
    const lastSeenAt = (0, notionFieldExtractors_1.extractNotionDate)(properties[exports.propertiesMappingFromDomainToNotion.lastSeenAt]);
    const numberOfCorrectAnswers = (0, notionFieldExtractors_1.extractNumber)(properties[exports.propertiesMappingFromDomainToNotion.numberOfCorrectAnswers]);
    const levelOfConfidence = (0, notionFieldExtractors_1.extractStatusValue)(properties[exports.propertiesMappingFromDomainToNotion.levelOfConfidence]);
    return {
        id,
        character,
        translation,
        example,
        addedAt,
        type: type ? typesMappingFromNotionToDomain[type] : null,
        importance: importance
            ? importanceMappingFromNotionToDomain[importance]
            : null,
        lastSeenAt,
        numberOfCorrectAnswers,
        levelOfConfidence: levelOfConfidence
            ? levelsOfConfidenceMappingFromNotionToDomain[levelOfConfidence]
            : null,
    };
};
exports.mapNotionCharacterToChineseCharacter = mapNotionCharacterToChineseCharacter;
