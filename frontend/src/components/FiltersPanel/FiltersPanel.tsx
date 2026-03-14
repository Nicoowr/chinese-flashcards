import { Body, VStack } from "../../design-system/components";
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
    <VStack className="w-48 shrink-0 self-start" gap={16}>
      <Body as="h3" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Filters
      </Body>
      <VStack gap={12}>
        <VStack gap={6}>
          <Body as="label" className="text-xs text-muted-foreground">
            Type
          </Body>
          <SelectCharacterType handleCharacterTypeChange={setCharacterType} />
        </VStack>
        <VStack gap={6}>
          <Body as="label" className="text-xs text-muted-foreground">
            Importance
          </Body>
          <SelectCharacterImportance
            handleCharacterImportanceChange={setCharacterImportance}
          />
        </VStack>
      </VStack>
    </VStack>
  );
};
