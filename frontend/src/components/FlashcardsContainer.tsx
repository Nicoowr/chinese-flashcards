"use client";

import { LogOut } from "lucide-react";
import { compact, uniq } from "lodash-es";
import { useState } from "react";
import { toast } from "sonner";
import {
  CharacterEditorModal,
  CharacterEditorPayload,
} from "./CharacterEditorModal";
import { CharacterPanelView as CharacterPanel } from "./CharacterPanel/CharacterPanel";
import { FiltersPanel } from "./FiltersPanel/FiltersPanel";
import {
  useCreateCharacter,
  useGenerateCharacterDetails,
  useSetCharacterKnown,
  useSetCharacterUnknown,
  useUpdateCharacter,
} from "./FlashcardsContainer.mutations";
import { useFetchChineseCharacter } from "./FlashcardsContainer.queries";
import { useAppState } from "./hooks/useAppState";
import { useKeyboardShortcuts } from "./hooks/useKeyboardShortcuts";
import { useOnConfigurationChange } from "./hooks/useOnConfgiurationChange";
import { Body, Box, Button, HStack, VStack } from "../design-system/components";
import { SessionCharacterLists } from "./session-character-lists";
import { ChineseCharacter } from "./types";
import { CharacterSearchModal } from "./CharacterSearchModal";

type FlashcardsContainerProps = {
  onLogout?: () => void;
  userEmail?: string;
};

export function FlashcardsContainer({ onLogout, userEmail }: FlashcardsContainerProps = {}) {
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
  const [editorState, setEditorState] = useState<{
    mode: "create" | "edit";
    character: ChineseCharacter | null;
  } | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { handleCharacterUnknown } = useSetCharacterUnknown();
  const { handleCharacterKnown } = useSetCharacterKnown();
  const { handleCreateCharacter, isCreateCharacterLoading } = useCreateCharacter();
  const { handleUpdateCharacter, isUpdateCharacterLoading } = useUpdateCharacter();
  const { handleGenerateCharacterDetails, isGenerateCharacterDetailsLoading } =
    useGenerateCharacterDetails();
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
    const newState = shiftForward({
      currentCharacter,
      nextCharacter,
    });
    await handleCharacterKnown(oldId);
    await prefetchNextCharacter();
    if (newState.currentCharacter === null) {
      const fetched = await fetchCharacter();
      setCurrentCharacter(fetched);
      if (fetched) {
        setSeenCharacterIds((prev) =>
          uniq(compact([...prev, fetched.id]))
        );
        await prefetchNextCharacter();
      } else {
        toast.error("No more cards available.");
      }
    }
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
    const newState = shiftForward({
      currentCharacter,
      nextCharacter,
    });
    await handleCharacterUnknown(oldId);
    await prefetchNextCharacter();
    if (newState.currentCharacter === null) {
      const fetched = await fetchCharacter();
      setCurrentCharacter(fetched);
      if (fetched) {
        setSeenCharacterIds((prev) =>
          uniq(compact([...prev, fetched.id]))
        );
        await prefetchNextCharacter();
      } else {
        toast.error("No more cards available.");
      }
    }
  };

  const replaceCharacterInList = (
    characters: ChineseCharacter[],
    updatedCharacter: ChineseCharacter
  ) =>
    characters.map((character) =>
      character.id === updatedCharacter.id ? updatedCharacter : character
    );

  const applyCharacterUpdate = (updatedCharacter: ChineseCharacter) => {
    setCurrentCharacter((previousCharacter) =>
      previousCharacter?.id === updatedCharacter.id
        ? updatedCharacter
        : previousCharacter
    );
    setNextCharacter((previousCharacter) =>
      previousCharacter?.id === updatedCharacter.id
        ? updatedCharacter
        : previousCharacter
    );
    setKnownCharacters((previousCharacters) =>
      replaceCharacterInList(previousCharacters, updatedCharacter)
    );
    setUnknownCharacters((previousCharacters) =>
      replaceCharacterInList(previousCharacters, updatedCharacter)
    );
  };

  const handleCharacterEditorSubmit = async (payload: CharacterEditorPayload) => {
    if (editorState?.mode === "edit" && editorState.character) {
      const updatedCharacter = await handleUpdateCharacter({
        id: editorState.character.id,
        ...payload,
      });
      applyCharacterUpdate(updatedCharacter);
      toast.success("Character updated.");
      setEditorState(null);
      return;
    }

    const createdCharacter = await handleCreateCharacter(payload);
    toast.success("Character created.");
    if (!currentCharacter) {
      setCurrentCharacter(createdCharacter);
      setSeenCharacterIds((previousIds) => [...previousIds, createdCharacter.id]);
    }
    setEditorState(null);
  };

  useKeyboardShortcuts({
    handleCheck,
    handleReveal,
    handleUnknown,
    isReviewing,
    onExitReview: exitReview,
    isDisabled: Boolean(editorState),
  });

  const isLoading = currentCharacter === null;
  const uniqueSeenCount = seenCharacterIds.length;
  const isEditorSubmitting =
    isCreateCharacterLoading || isUpdateCharacterLoading;

  return (
    <VStack className="dark min-h-screen w-full bg-background text-card-foreground relative overflow-hidden" alignItems="center" justifyContent="center">
      <Box className="absolute inset-0 bg-linear-to-br from-blue-950/30 via-background to-indigo-950/20 pointer-events-none" />
      <HStack className="absolute top-4 left-4 z-10" alignItems="center" gap={12}>
        {onLogout ? (
          <Button
            variant="ghost"
            className="glass rounded-xl px-4 py-2 text-sm font-medium text-muted-foreground transition hover:text-foreground"
            onClick={onLogout}
            type="button"
          >
            <LogOut className="mr-1 h-4 w-4" />
            Sign out
          </Button>
        ) : null}
      </HStack>
      <HStack className="absolute top-4 right-4 z-10" alignItems="center" gap={12}>
        <Button
          variant="ghost"
          className="glass rounded-xl px-4 py-2 text-sm font-medium text-muted-foreground transition hover:text-foreground"
          onClick={() => setIsSearchOpen(true)}
          type="button"
        >
          Search & edit
        </Button>
        {userEmail ? (
          <Body className="glass rounded-xl px-4 py-2 text-sm text-muted-foreground">{userEmail}</Body>
        ) : null}
        <Body className="glass rounded-xl px-4 py-2 text-sm font-medium text-muted-foreground shadow-lg">
          <Body className="text-foreground font-semibold">{uniqueSeenCount}</Body>{" "}
          seen
        </Body>
      </HStack>
      <HStack className="relative w-full max-w-7xl px-6" gap={24}>
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
          onAddCharacter={() =>
            setEditorState({
              mode: "create",
              character: null,
            })
          }
          onEditCharacter={() =>
            currentCharacter
              ? setEditorState({
                  mode: "edit",
                  character: currentCharacter,
                })
              : undefined
          }
        />
        <SessionCharacterLists
          knownCharacters={knownCharacters}
          unknownCharacters={unknownCharacters}
          onCharacterClick={startReview}
        />
      </HStack>
      <CharacterEditorModal
        isOpen={Boolean(editorState)}
        mode={editorState?.mode ?? "create"}
        character={editorState?.character ?? null}
        isSubmitting={isEditorSubmitting}
        onClose={() => {
          if (!isEditorSubmitting) {
            setEditorState(null);
          }
        }}
        onSubmit={handleCharacterEditorSubmit}
        onGenerateCharacterDetails={handleGenerateCharacterDetails}
        isGeneratingCharacterDetails={isGenerateCharacterDetailsLoading}
      />
      <CharacterSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onEditCharacter={(character) => {
          setEditorState({
            mode: "edit",
            character,
          });
        }}
      />
    </VStack>
  );
}
