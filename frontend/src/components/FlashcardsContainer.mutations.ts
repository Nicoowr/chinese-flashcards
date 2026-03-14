import { useMutation } from "react-query";
import { toast } from "sonner";
import { authenticatedApiFetch } from "../lib/supabaseClient";
import { ChineseCharacter } from "./types";

type CharacterMutationResponse = Omit<ChineseCharacter, "addedAt" | "lastSeenAt"> & {
  addedAt: string | null;
  lastSeenAt: string | null;
};

type CharacterUpsertPayload = {
  character: string;
  translation: string | null;
  example: string | null;
  addedAt: string | null;
  type: "verb" | "noun" | "adjective" | "adverb" | "link" | null;
  importance: "high" | "medium" | "low" | null;
  lastSeenAt: string | null;
  numberOfCorrectAnswers: number;
  levelOfConfidence: "high" | "low";
};

type GeneratedCharacterDetails = {
  translation: string;
  example: string;
  type: "verb" | "noun" | "adjective" | "adverb" | "link" | null;
};

const toCharacter = (
  response: CharacterMutationResponse
): ChineseCharacter => ({
  ...response,
  addedAt: response.addedAt ? new Date(`${response.addedAt}T00:00:00.000Z`) : null,
  lastSeenAt: response.lastSeenAt
    ? new Date(`${response.lastSeenAt}T00:00:00.000Z`)
    : null,
});

const setCharacterUnknown = async (id: string) => {
  const response = await authenticatedApiFetch("/api/character-unknown", {
    method: "POST",
    body: JSON.stringify({ id }),
  });
  if (!response.ok) {
    throw new Error("Network response was not ok");
  }
  return response.json();
};

const setCharacterKnown = async (id: string) => {
  const response = await authenticatedApiFetch("/api/character-known", {
    method: "POST",
    body: JSON.stringify({ id }),
  });
  if (!response.ok) {
    throw new Error("Network response was not ok");
  }
  return response.json();
};

const createCharacter = async (
  payload: CharacterUpsertPayload
): Promise<ChineseCharacter> => {
  const response = await authenticatedApiFetch("/api/admin/characters", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const error = (await response.json()) as { error?: string };
    throw new Error(error.error ?? "Create character failed");
  }
  return toCharacter((await response.json()) as CharacterMutationResponse);
};

const updateCharacter = async ({
  id,
  ...payload
}: CharacterUpsertPayload & { id: string }): Promise<ChineseCharacter> => {
  const response = await authenticatedApiFetch(`/api/admin/characters/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const error = (await response.json()) as { error?: string };
    throw new Error(error.error ?? "Update character failed");
  }
  return toCharacter((await response.json()) as CharacterMutationResponse);
};

const generateCharacterDetails = async (
  character: string
): Promise<GeneratedCharacterDetails> => {
  const response = await authenticatedApiFetch("/api/generate-character-details", {
    method: "POST",
    body: JSON.stringify({ character }),
  });

  if (!response.ok) {
    const error = (await response.json()) as { error?: string };
    throw new Error(error.error ?? "Generate character details failed");
  }

  return (await response.json()) as GeneratedCharacterDetails;
};

export const useSetCharacterUnknown = () => {
  const {
    mutateAsync: handleCharacterUnknown,
    isLoading: isCharacterUnknownLoading,
  } = useMutation(setCharacterUnknown, {
    onError: (error) => {
      console.error(error);
      toast.error("Set character unknown failed, please try again.");
    },
  });
  return { handleCharacterUnknown, isCharacterUnknownLoading };
};

export const useSetCharacterKnown = () => {
  const {
    mutateAsync: handleCharacterKnown,
    isLoading: isCharacterKnownLoading,
  } = useMutation(setCharacterKnown, {
    onError: (error) => {
      console.error(error);
      toast.error("Set character known failed, please try again.");
    },
  });
  return { handleCharacterKnown, isCharacterKnownLoading };
};

export const useCreateCharacter = () => {
  const {
    mutateAsync: handleCreateCharacter,
    isLoading: isCreateCharacterLoading,
  } = useMutation(createCharacter, {
    onError: (error) => {
      console.error(error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Create character failed, please try again."
      );
    },
  });

  return { handleCreateCharacter, isCreateCharacterLoading };
};

export const useUpdateCharacter = () => {
  const {
    mutateAsync: handleUpdateCharacter,
    isLoading: isUpdateCharacterLoading,
  } = useMutation(updateCharacter, {
    onError: (error) => {
      console.error(error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Update character failed, please try again."
      );
    },
  });

  return { handleUpdateCharacter, isUpdateCharacterLoading };
};

export const useGenerateCharacterDetails = () => {
  const {
    mutateAsync: handleGenerateCharacterDetails,
    isLoading: isGenerateCharacterDetailsLoading,
  } = useMutation(generateCharacterDetails, {
    onError: (error) => {
      console.error(error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Generate character details failed, please try again."
      );
    },
  });

  return {
    handleGenerateCharacterDetails,
    isGenerateCharacterDetailsLoading,
  };
};
