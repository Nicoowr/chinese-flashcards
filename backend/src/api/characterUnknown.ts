import { setCharacterToUnknown } from "../domain/setCharacterToUnknown";

export const handler = async (event: { body: string }) => {
  console.log("Event", event);
  const payload = JSON.parse(event.body);
  await setCharacterToUnknown(payload.id);

  return {
    statusCode: 200,
    body: JSON.stringify({
      id: payload.id,
    }),
  };
};
