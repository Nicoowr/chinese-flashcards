import { useEffect } from "react";

export const useKeyboardShortcuts = ({
  handleCheck,
  handleReveal,
  handleUnknown,
  isReviewing,
  onExitReview,
  isDisabled = false,
}: {
  handleCheck: () => void;
  handleReveal: () => void;
  handleUnknown: () => void;
  isReviewing: boolean;
  onExitReview: () => void;
  isDisabled?: boolean;
}) => {
  useEffect(() => {
    const handleKeyDown = async (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const isTypingContext =
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        target?.tagName === "SELECT" ||
        target?.isContentEditable;

      if (isDisabled || isTypingContext) {
        return;
      }

      if (isReviewing && (event.key === "Escape" || event.key === "Backspace")) {
        event.preventDefault();
        onExitReview();
        return;
      }
      switch (event.key) {
        case "ArrowLeft":
          await handleCheck();
          break;
        case "ArrowRight":
          await handleUnknown();
          break;
        case "ArrowUp":
          handleReveal();
          break;
        default:
          break;
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [
    handleCheck,
    handleReveal,
    handleUnknown,
    isDisabled,
    isReviewing,
    onExitReview,
  ]);
};
