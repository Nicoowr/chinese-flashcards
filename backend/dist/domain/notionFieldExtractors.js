"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractNumber = exports.extractStatusValue = exports.extractMultiSelectFirstValue = exports.extractSelectValue = exports.extractNotionDate = exports.extractNotionRichText = exports.extractNotionTitle = void 0;
const notionPropertyIsTitleDatabaseProperty = (property) => {
    return property.type === "title";
};
const extractNotionTitle = (property) => {
    if (notionPropertyIsTitleDatabaseProperty(property)) {
        return property.title[0].plain_text;
    }
    throw new Error("Property is not a title: " + JSON.stringify(property));
};
exports.extractNotionTitle = extractNotionTitle;
const notionPropertyIsRichTextDatabaseProperty = (property) => {
    return property.type === "rich_text";
};
const extractNotionRichText = (property) => {
    if (notionPropertyIsRichTextDatabaseProperty(property)) {
        return property.rich_text.map((text) => text.plain_text).join("");
    }
    throw new Error("Property is not a rich text: " + JSON.stringify(property));
};
exports.extractNotionRichText = extractNotionRichText;
const notionPropertyIsDateDatabaseProperty = (property) => {
    return property.type === "date";
};
const extractNotionDate = (property) => {
    if (notionPropertyIsDateDatabaseProperty(property)) {
        return property.date ? new Date(property.date.start) : null;
    }
    throw new Error("Property is not a date: " + JSON.stringify(property));
};
exports.extractNotionDate = extractNotionDate;
const notionPropertyIsSelectPropertyItemObject = (property) => {
    return property.type === "select";
};
const extractSelectValue = (property) => {
    if (notionPropertyIsSelectPropertyItemObject(property)) {
        return property.select?.name ?? null;
    }
    throw new Error("Property is not a select: " + JSON.stringify(property));
};
exports.extractSelectValue = extractSelectValue;
const notionPropertyIsMultiSelectPropertyItemObject = (property) => {
    return property.type === "multi_select";
};
const extractMultiSelectFirstValue = (property) => {
    if (notionPropertyIsMultiSelectPropertyItemObject(property)) {
        return property.multi_select[0]?.name ?? null;
    }
    throw new Error("Property is not a multi select: " + JSON.stringify(property));
};
exports.extractMultiSelectFirstValue = extractMultiSelectFirstValue;
const notionPropertyIsStatusPropertyItemObject = (property) => {
    return property.type === "status";
};
const extractStatusValue = (property) => {
    if (notionPropertyIsStatusPropertyItemObject(property)) {
        return property.status?.name;
    }
    throw new Error("Property is not a status: " + JSON.stringify(property));
};
exports.extractStatusValue = extractStatusValue;
const notionPropertyIsNumberDatabaseProperty = (property) => {
    return property.type === "number";
};
const extractNumber = (property) => {
    if (notionPropertyIsNumberDatabaseProperty(property)) {
        return property.number;
    }
    throw new Error("Property is not a number: " + JSON.stringify(property));
};
exports.extractNumber = extractNumber;
