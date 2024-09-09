import { useMutation } from "react-query";

const setCharacterUnknown = async (id: string) => {
  const response = await fetch("/api/character-unknown", {
    method: "POST",
    body: JSON.stringify({ id }),
    headers: {
      "Content-Type": "application/json",
    },
  });
  if (!response.ok) {
    throw new Error("Network response was not ok");
  }
  return response.json();
};

const setCharacterKnown = async (id: string) => {
  const response = await fetch("/api/character-known", {
    method: "POST",
    body: JSON.stringify({ id }),
    headers: {
      "Content-Type": "application/json",
    },
  });
  if (!response.ok) {
    throw new Error("Network response was not ok");
  }
  return response.json();
};


export const useSetCharacterUnknown = () => {
  const {
    mutateAsync: handleCharacterUnknown,
    isLoading: isCharacterUnknownLoading,
  } = useMutation(setCharacterUnknown);
  return { handleCharacterUnknown, isCharacterUnknownLoading };
};

export const useSetCharacterKnown = () => {
  const {
    mutateAsync: handleCharacterKnown,
    isLoading: isCharacterKnownLoading,
  } = useMutation(setCharacterKnown);
  return { handleCharacterKnown, isCharacterKnownLoading };
};
