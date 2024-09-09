import { CharacterType } from "../types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

const characterTypeOptions: { value: CharacterType | "any"; label: string }[] =
  [
    { value: "any", label: "Any" },
    { value: "verb", label: "Verb" },
    { value: "noun", label: "Noun" },
    { value: "adjective", label: "Adjective" },
    { value: "adverb", label: "Adverb" },
    { value: "link", label: "Link" },
  ];

export const SelectCharacterType = ({
  handleCharacterTypeChange,
}: {
  handleCharacterTypeChange: (
    handleCharacterTypeChange: CharacterType | null
  ) => void;
}) => {
  return (
    <Select
      onValueChange={(value) =>
        handleCharacterTypeChange(
          value === "any" ? null : (value as CharacterType)
        )
      }
    >
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Type" />
      </SelectTrigger>
      <SelectContent>
        {characterTypeOptions.map((option) => (
          <SelectItem key={option.value} value={option.value ?? ""}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
