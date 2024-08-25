"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const notionFilter_1 = require("../notionFilter");
const dayjs_1 = __importDefault(require("dayjs"));
(0, vitest_1.describe)("characterNeedsRefresh", () => {
    (0, vitest_1.it)("should return true if character is not known", () => {
        const character = {
            levelOfConfidence: "low",
            lastSeenAt: (0, dayjs_1.default)().subtract(1, "year").toDate(),
            numberOfCorrectAnswers: 10,
        };
        (0, vitest_1.expect)((0, notionFilter_1.characterNeedsRefresh)(character)).toBe(true);
    });
    (0, vitest_1.it)("should return true if character was remembered ONCE and last seen more than 2 weeks agao", () => {
        const character = {
            levelOfConfidence: "high",
            lastSeenAt: (0, dayjs_1.default)().subtract(3, "weeks").toDate(),
            numberOfCorrectAnswers: 1,
        };
        (0, vitest_1.expect)((0, notionFilter_1.characterNeedsRefresh)(character)).toBe(true);
    });
    (0, vitest_1.it)("should return false if character was remembered ONCE and last seen less than 2 weeks ago", () => {
        const character = {
            levelOfConfidence: "high",
            lastSeenAt: (0, dayjs_1.default)().subtract(1, "weeks").toDate(),
            numberOfCorrectAnswers: 1,
        };
        (0, vitest_1.expect)((0, notionFilter_1.characterNeedsRefresh)(character)).toBe(false);
    });
    (0, vitest_1.it)("should return true if character was remembered TWICE and last seen more than 4 weeks ago", () => {
        const character = {
            levelOfConfidence: "high",
            lastSeenAt: (0, dayjs_1.default)().subtract(5, "weeks").toDate(),
            numberOfCorrectAnswers: 2,
        };
        (0, vitest_1.expect)((0, notionFilter_1.characterNeedsRefresh)(character)).toBe(true);
    });
});
