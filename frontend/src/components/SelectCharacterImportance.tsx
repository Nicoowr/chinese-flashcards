import { CharacterImportance } from "./types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

const characterImportanceOptions = [
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" },
];

export const SelectCharacterImportance = ({
  handleCharacterImportanceChange,
}: {
  handleCharacterImportanceChange: (
    handleCharacterImportanceChange: CharacterImportance
  ) => void;
}) => {
  return (
    <Select
      onValueChange={(value) =>
        handleCharacterImportanceChange(value as CharacterImportance)
      }
    >
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Importance" />
      </SelectTrigger>
      <SelectContent>
        {characterImportanceOptions.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
