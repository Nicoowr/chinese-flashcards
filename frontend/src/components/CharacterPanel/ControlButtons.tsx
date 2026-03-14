import { Button } from "../../design-system/components/button";
import { CheckIcon } from "../../design-system/components/CheckIcon";
import { XIcon } from "../../design-system/components/XIcon";

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
    <div className="flex justify-center gap-4">
      <Button
        disabled={isLoading}
        onClick={handleCheck}
        className="text-base px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/30 transition-all"
      >
        <CheckIcon className="h-5 w-5" />
        Known
      </Button>
      <Button
        variant="outline"
        onClick={handleReveal}
        className="text-base px-5 py-2.5 rounded-xl border-white/10 hover:bg-white/5 text-muted-foreground transition-all"
      >
        {showIdeogram ? "Hide" : "Reveal"}
      </Button>
      <Button
        disabled={isLoading}
        onClick={handleUnknown}
        className="text-base px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-900/30 transition-all"
      >
        <XIcon className="h-5 w-5" />
        Unknown
      </Button>
    </div>
  );
};
