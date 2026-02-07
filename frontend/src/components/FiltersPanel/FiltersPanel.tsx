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
    <div className="flex flex-col gap-4 w-48 shrink-0 self-start">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Filters
      </h3>
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-muted-foreground">Type</label>
          <SelectCharacterType handleCharacterTypeChange={setCharacterType} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-muted-foreground">Importance</label>
          <SelectCharacterImportance
            handleCharacterImportanceChange={setCharacterImportance}
          />
        </div>
      </div>
    </div>
  );
};
