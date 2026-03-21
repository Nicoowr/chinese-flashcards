import { useEffect } from "react";

const isTypingContext = (target: EventTarget | null) => {
  const element = target as HTMLElement | null;
  return (
    element?.tagName === "INPUT" ||
    element?.tagName === "TEXTAREA" ||
    element?.tagName === "SELECT" ||
    element?.isContentEditable
  );
};

export const useSearchTableShortcut = ({
  onOpenSearch,
  isDisabled = false,
}: {
  onOpenSearch: () => void;
  isDisabled?: boolean;
}) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const isFindShortcut = (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "f";
      if (!isFindShortcut || isDisabled || isTypingContext(event.target)) {
        return;
      }

      event.preventDefault();
      onOpenSearch();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isDisabled, onOpenSearch]);
};
