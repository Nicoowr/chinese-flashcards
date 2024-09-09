import { Button } from "../ui/button";
import { CheckIcon } from "../ui/CheckIcon";
import { XIcon } from "../ui/XIcon";

export const ControlButtons = ({
  handleCheck,
  handleReveal,
  handleUnknown,
  isLoading,
  showIdeogram,
}: {
  handleCheck: () => void;
  handleReveal: () => void;
  handleUnknown: () => void;
  isLoading: boolean;
  showIdeogram: boolean;
}) => {
  return (
    <div className="flex justify-center gap-6">
      <Button
        disabled={isLoading}
        onClick={handleCheck}
        className="text-lg px-6 py-3"
      >
        <CheckIcon className="h-6 w-6" />
        Check
      </Button>
      <Button
        variant="outline"
        onClick={handleReveal}
        className="text-lg px-6 py-3"
      >
        {showIdeogram ? "Hide" : "Reveal"}
      </Button>
      <Button
        disabled={isLoading}
        onClick={handleUnknown}
        className="text-lg px-6 py-3"
      >
        <XIcon className="h-6 w-6" />
        Unknown
      </Button>
    </div>
  );
};
