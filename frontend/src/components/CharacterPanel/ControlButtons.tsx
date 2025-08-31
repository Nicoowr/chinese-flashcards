import { Button } from "../ui/button";
import { CheckIcon } from "../ui/CheckIcon";
import { XIcon } from "../ui/XIcon";

export const ControlButtons = ({
  handleCheck,
  handleReveal,
  handleUnknown,
  handleBack,
  canGoBack,
  isLoading,
  showIdeogram,
}: {
  handleCheck: () => void;
  handleReveal: () => void;
  handleUnknown: () => void;
  handleBack: () => void;
  canGoBack: boolean;
  isLoading: boolean;
  showIdeogram: boolean;
}) => {
  return (
    <div className="flex justify-center gap-6">
      <Button
        variant="secondary"
        disabled={isLoading || !canGoBack}
        onClick={handleBack}
        className="text-lg px-6 py-3"
      >
        Back
      </Button>
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
