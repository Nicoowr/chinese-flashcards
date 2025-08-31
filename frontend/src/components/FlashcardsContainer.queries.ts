import { useQuery } from "react-query";
import { CharacterImportance, CharacterType, ChineseCharacter } from "./types";
import { toast } from "sonner";

const fetchChineseCharacter = async ({
  characterType,
  characterImportance,
}: {
  characterType: CharacterType | null;
  characterImportance: CharacterImportance | null;
}) => {
  const response = await fetch("/api/fetch-chinese-character", {
    method: "POST",
    body: JSON.stringify({ characterType, characterImportance }),
    headers: {
      "Content-Type": "application/json",
    },
  });
  if (!response.ok) {
    throw new Error("Network response was not ok");
  }
  return response.json();
};

export const useFetchChineseCharacter = ({
  characterType,
  characterImportance,
}: {
  characterType: CharacterType | null;
  characterImportance: CharacterImportance | null;
}) => {
  const { refetch, isFetching } = useQuery<ChineseCharacter>(
    ["chineseCharacter", characterType, characterImportance],
    () =>
      fetchChineseCharacter({
        characterType: characterType,
        characterImportance,
      }),
    {
      enabled: false,
      refetchOnWindowFocus: false,
    }
  );

  const fetchCharacter = async () => {
    try {
      const fetched = await refetch();
      return fetched.data ?? null;
    } catch (e) {
      console.error(e);
      toast.error("Failed to fetch card.");
      return null;
    }
  };

  return { fetchCharacter, isFetchingCharacter: isFetching };
};
