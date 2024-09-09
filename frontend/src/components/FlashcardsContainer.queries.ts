import { useQuery } from "react-query";
import { CharacterImportance, CharacterType, ChineseCharacter } from "./types";

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
  const { data, refetch, isFetching } = useQuery<ChineseCharacter>(
    ["chineseCharacter", characterType, characterImportance],
    () =>
      fetchChineseCharacter({
        characterType: characterType,
        characterImportance,
      }),
    {
      refetchOnWindowFocus: false,
    }
  );

  return { data, refetch, isFetching };
};
