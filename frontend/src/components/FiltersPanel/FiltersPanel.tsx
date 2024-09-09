import { CharacterImportance, CharacterType } from "../types";
import { SelectCharacterImportance } from "./SelectCharacterImportance";
import { SelectCharacterType } from "./SelectCharacterType";

export const FiltersPanel = ({
  setCharacterType,
  setCharacterImportance,
}: {
  setCharacterType: (type: CharacterType | null) => void;
  setCharacterImportance: (importance: CharacterImportance | null) => void;
}) => {
  return (
    <div className="flex flex-col gap-1 w-1/4">
      <SelectCharacterType handleCharacterTypeChange={setCharacterType} />
      <SelectCharacterImportance
        handleCharacterImportanceChange={setCharacterImportance}
      />
    </div>
  );
};
