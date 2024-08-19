import { updateChineseCharacterLastSeenAt } from "../dependencies/notion";

export const handler = async (event: { body: string }) => {
  console.log("Event", event);
  const payload = JSON.parse(event.body);
  await updateChineseCharacterLastSeenAt(payload.id);

  console.log("Updated character last seen at with ID:", payload.id);

  return {
    statusCode: 200,
    body: {},
  };
};
