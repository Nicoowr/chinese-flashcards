import { setCharacterToKnown } from "../dependencies/notion";

export const handler = async (event: { body: string }) => {
  console.log("Event", event);
  const payload = JSON.parse(event.body);
  await setCharacterToKnown(payload.id);

  return {
    statusCode: 200,
    body: JSON.stringify({
      id: payload.id,
    }),
  };
};
