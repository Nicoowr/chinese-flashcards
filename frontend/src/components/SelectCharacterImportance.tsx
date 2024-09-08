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
    handleCharacterImportanceChange: string
  ) => void;
}) => {
  return (
    <Select onValueChange={(value) => handleCharacterImportanceChange(value)}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Character importance" />
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
