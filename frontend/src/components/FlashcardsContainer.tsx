"use client";

import { toast } from "sonner";
import { CharacterPanelView as CharacterPanel } from "./CharacterPanel/CharacterPanel";
import { FiltersPanel } from "./FiltersPanel/FiltersPanel";
import {
  useSetCharacterKnown,
  useSetCharacterUnknown,
} from "./FlashcardsContainer.mutations";
import { useFetchChineseCharacter } from "./FlashcardsContainer.queries";
import { useAppState } from "./hooks/useAppState";
import { useKeyboardShortcuts } from "./hooks/useKeyboardShortcuts";
import { useOnConfigurationChange } from "./hooks/useOnConfgiurationChange";
import { SessionCharacterLists } from "./session-character-lists";

export function FlashcardsContainer() {
  const {
    showIdeogram,
    setShowIdeogram,
    characterType,
    setCharacterType,
    characterImportance,
    setCharacterImportance,
    currentCharacter,
    setCurrentCharacter,
    nextCharacter,
    setNextCharacter,
    seenCharacterIds,
    setSeenCharacterIds,
    knownCharacters,
    setKnownCharacters,
    unknownCharacters,
    setUnknownCharacters,
    addKnownCharacter,
    addUnknownCharacter,
    shiftForward,
    isReviewing,
    startReview,
    exitReview,
    recategorizeReviewedCharacter,
  } = useAppState();
  const { handleCharacterUnknown } = useSetCharacterUnknown();
  const { handleCharacterKnown } = useSetCharacterKnown();
  const { fetchCharacter } = useFetchChineseCharacter({
    characterType,
    characterImportance,
  });

  useOnConfigurationChange({
    fetchCharacter,
    characterType,
    characterImportance,
    setShowIdeogram,
    setCurrentCharacter,
    setNextCharacter,
    setSeenCharacterIds,
    setKnownCharacters,
    setUnknownCharacters,
  });

  const prefetchNextCharacter = async () => {
    try {
      const fetched = await fetchCharacter();
      setNextCharacter(fetched);
    } catch (e) {
      toast.error("Failed to fetch next card.");
    }
  };

  const handleCheck = async () => {
    if (!currentCharacter) {
      console.error("No current character when handling check.");
      return;
    }
    if (isReviewing) {
      const character = recategorizeReviewedCharacter("known");
      if (character) {
        await handleCharacterKnown(character.id);
      }
      return;
    }
    setShowIdeogram(false);
    const oldId = currentCharacter.id;
    addKnownCharacter(currentCharacter);
    shiftForward({
      currentCharacter,
      nextCharacter,
    });
    await handleCharacterKnown(oldId);
    await prefetchNextCharacter();
  };
  const handleReveal = () => {
    setShowIdeogram((prevState) => !prevState);
  };
  const handleUnknown = async () => {
    if (!currentCharacter) {
      console.error("No current character when handling unknown.");
      return;
    }
    if (isReviewing) {
      const character = recategorizeReviewedCharacter("unknown");
      if (character) {
        await handleCharacterUnknown(character.id);
      }
      return;
    }
    setShowIdeogram(false);
    const oldId = currentCharacter.id;
    addUnknownCharacter(currentCharacter);
    shiftForward({
      currentCharacter,
      nextCharacter,
    });
    await handleCharacterUnknown(oldId);
    await prefetchNextCharacter();
  };

  useKeyboardShortcuts({
    handleCheck,
    handleReveal,
    handleUnknown,
    isReviewing,
    onExitReview: exitReview,
  });

  const isLoading = currentCharacter === null;
  const uniqueSeenCount = seenCharacterIds.length;

  return (
    <div className="dark flex flex-col items-center justify-center h-screen bg-background text-card-foreground relative overflow-hidden">
      <div className="absolute inset-0 bg-linear-to-br from-blue-950/30 via-background to-indigo-950/20 pointer-events-none" />
      <div className="absolute top-4 right-4 z-10 glass rounded-xl px-4 py-2 text-sm font-medium text-muted-foreground shadow-lg">
        <span className="text-foreground font-semibold">{uniqueSeenCount}</span>{" "}
        seen
      </div>
      <div className="relative flex w-full max-w-7xl gap-6 px-6">
        <FiltersPanel
          setCharacterType={setCharacterType}
          setCharacterImportance={setCharacterImportance}
        />
        <CharacterPanel
          data={currentCharacter ?? null}
          isLoading={isLoading}
          showIdeogram={showIdeogram}
          handleCheck={handleCheck}
          handleReveal={handleReveal}
          handleUnknown={handleUnknown}
          knownCharacters={knownCharacters}
          totalCount={uniqueSeenCount}
          onBack={isReviewing ? exitReview : undefined}
        />
        <SessionCharacterLists
          knownCharacters={knownCharacters}
          unknownCharacters={unknownCharacters}
          onCharacterClick={startReview}
        />
      </div>
    </div>
  );
}
