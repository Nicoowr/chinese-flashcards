"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const setCharacterToUnknown_1 = require("../domain/setCharacterToUnknown");
const handler = async (event) => {
    console.log("Event", event);
    const payload = JSON.parse(event.body);
    await (0, setCharacterToUnknown_1.setCharacterToUnknown)(payload.id);
    return {
        statusCode: 200,
        body: JSON.stringify({
            id: payload.id,
        }),
    };
};
exports.handler = handler;
