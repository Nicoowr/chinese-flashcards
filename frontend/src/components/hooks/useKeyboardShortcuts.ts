import { useEffect } from "react";

export const useKeyboardShortcuts = ({
  handleCheck,
  handleReveal,
  handleUnknown,
  isReviewing,
  onExitReview,
}: {
  handleCheck: () => void;
  handleReveal: () => void;
  handleUnknown: () => void;
  isReviewing: boolean;
  onExitReview: () => void;
}) => {
  useEffect(() => {
    const handleKeyDown = async (event: KeyboardEvent) => {
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
  }, [handleCheck, handleReveal, handleUnknown, isReviewing, onExitReview]);
};
