"use client";

import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { CharacterImportance, CharacterType, ChineseCharacter } from "./types";
import { Body, Box, Button, Card, HStack, Loader, VStack } from "../design-system/components";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../design-system/components/dialog";

export type CharacterEditorPayload = {
  character: string;
  translation: string | null;
  example: string | null;
  addedAt: string | null;
  type: CharacterType;
  importance: CharacterImportance | null;
  lastSeenAt: string | null;
  numberOfCorrectAnswers: number;
  levelOfConfidence: "high" | "low";
};

const typeOptions: { value: CharacterType; label: string }[] = [
  { value: null, label: "Unspecified" },
  { value: "verb", label: "Verb" },
  { value: "noun", label: "Noun" },
  { value: "adjective", label: "Adjective" },
  { value: "adverb", label: "Adverb" },
  { value: "link", label: "Link" },
];

const importanceOptions: {
  value: CharacterImportance | null;
  label: string;
}[] = [
  { value: null, label: "Unspecified" },
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" },
];

type CharacterTypeField = Exclude<CharacterType, null> | "";

const toDateInput = (date: Date | null) =>
  date ? dayjs(date).format("YYYY-MM-DD") : "";

const today = () => dayjs().format("YYYY-MM-DD");

const inputClassName =
  "mt-2 w-full rounded-xl border border-border bg-background/70 px-4 py-3 text-base text-foreground outline-hidden transition placeholder:text-muted-foreground focus:border-ring/60 focus:ring-2 focus:ring-ring/20";

export const CharacterEditorModal = ({
  isOpen,
  mode,
  character,
  isSubmitting,
  onClose,
  onSubmit,
  onGenerateCharacterDetails,
  isGeneratingCharacterDetails,
}: {
  isOpen: boolean;
  mode: "create" | "edit";
  character: ChineseCharacter | null;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (payload: CharacterEditorPayload) => Promise<void>;
  onGenerateCharacterDetails: (character: string) => Promise<{
    translation: string;
    example: string;
    type: CharacterType;
  }>;
  isGeneratingCharacterDetails: boolean;
}) => {
  const [formState, setFormState] = useState({
    character: "",
    translation: "",
    example: "",
    addedAt: "",
    type: "" as CharacterTypeField,
    importance: "" as CharacterImportance | "",
    lastSeenAt: "",
    numberOfCorrectAnswers: "0",
    levelOfConfidence: "low" as "high" | "low",
  });
  const [isGeneratingLocal, setIsGeneratingLocal] = useState(false);
  const isGenerating = isGeneratingLocal || isGeneratingCharacterDetails;

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    setFormState({
      character: character?.character ?? "",
      translation: character?.translation ?? "",
      example: character?.example ?? "",
      addedAt:
        mode === "create"
          ? today()
          : toDateInput(character?.addedAt ?? null) || today(),
      type: (character?.type ?? "") as CharacterTypeField,
      importance: mode === "create" ? "high" : character?.importance ?? "high",
      lastSeenAt:
        mode === "create"
          ? today()
          : toDateInput(character?.lastSeenAt ?? null) || today(),
      numberOfCorrectAnswers: String(character?.numberOfCorrectAnswers ?? 0),
      levelOfConfidence: character?.levelOfConfidence ?? "low",
    });
  }, [character, isOpen, mode]);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const numberOfCorrectAnswers = Number(formState.numberOfCorrectAnswers);
    if (Number.isNaN(numberOfCorrectAnswers) || numberOfCorrectAnswers < 0) {
      return;
    }

    await onSubmit({
      character: formState.character.trim(),
      translation: formState.translation.trim() || null,
      example: formState.example.trim() || null,
      addedAt: formState.addedAt || null,
      type: formState.type || null,
      importance: formState.importance || null,
      lastSeenAt: formState.lastSeenAt || null,
      numberOfCorrectAnswers: Math.floor(numberOfCorrectAnswers),
      levelOfConfidence: formState.levelOfConfidence,
    });
  };

  const generateCharacterDetails = async () => {
    const characterValue = formState.character.trim();
    if (!characterValue) {
      return;
    }

    setIsGeneratingLocal(true);
    try {
      const generated = await onGenerateCharacterDetails(characterValue);
      setFormState((prev) => ({
        ...prev,
        translation: prev.translation.trim() ? prev.translation : generated.translation,
        example: prev.example.trim() ? prev.example : generated.example,
        type: (prev.type ? prev.type : (generated.type ?? "")) as CharacterTypeField,
      }));
    } finally {
      setIsGeneratingLocal(false);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(nextOpen: boolean) => {
        if (!nextOpen && !isSubmitting) {
          onClose();
        }
      }}
    >
      <DialogContent className="overflow-hidden border-border/70 bg-card/95 p-0 text-card-foreground">
        <Card className="relative w-full overflow-hidden border-0 bg-transparent text-card-foreground shadow-none">
        <Box className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.16),_transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(99,102,241,0.14),_transparent_40%)]" />
        <div className="relative border-b border-border/80 px-8 py-7">
          <DialogHeader className="max-w-2xl pr-12">
              <Body className="mb-3 inline-flex rounded-full border border-border bg-secondary/70 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-secondary-foreground">
                {mode === "create" ? "Add Character" : "Edit Current Card"}
              </Body>
              <DialogTitle>
                {mode === "create"
                  ? "Create a new study card"
                  : "Refine the current card"}
              </DialogTitle>
              <DialogDescription className="mt-2">
                The editor writes directly to the same dataset used by the flashcard session.
              </DialogDescription>
          </DialogHeader>
        </div>

        <form className="relative grid gap-6 px-8 py-7 lg:grid-cols-[1.25fr_0.9fr]" onSubmit={submit}>
          <VStack gap={20}>
            <label className="block text-sm font-medium text-foreground/90">
              Character
              <input
                required
                value={formState.character}
                onChange={(event) =>
                  setFormState((prev) => ({
                    ...prev,
                    character: event.target.value,
                  }))
                }
                className={`${inputClassName} text-3xl font-semibold tracking-wide`}
                placeholder="汉"
              />
            </label>

            <label className="block text-sm font-medium text-foreground/90">
              Translation
              <input
                value={formState.translation}
                onChange={(event) =>
                  setFormState((prev) => ({
                    ...prev,
                    translation: event.target.value,
                  }))
                }
                className={inputClassName}
                placeholder="han / Chinese"
              />
            </label>

            <div>
              <Button
                type="button"
                disabled={isGenerating || isSubmitting || !formState.character.trim()}
                onClick={generateCharacterDetails}
                className="rounded-xl border border-border bg-secondary/60 px-5 text-secondary-foreground hover:bg-secondary"
              >
                {isGenerating ? (
                  <Loader className="mr-2 text-secondary-foreground" />
                ) : (
                  <span className="mr-2 shrink-0" aria-hidden>✨</span>
                )}
                {isGenerating
                  ? "Generating..."
                  : "Generate translation, example & type"}
              </Button>
            </div>

            <label className="block text-sm font-medium text-foreground/90">
              Example
              <textarea
                value={formState.example}
                onChange={(event) =>
                  setFormState((prev) => ({
                    ...prev,
                    example: event.target.value,
                  }))
                }
                className={`${inputClassName} min-h-32 resize-none`}
                placeholder="Example sentence or mnemonic"
              />
            </label>
          </VStack>

          <VStack gap={20}>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm font-medium text-foreground/90">
                Type
                <select
                  value={formState.type}
                  onChange={(event) =>
                    setFormState((prev) => ({
                      ...prev,
                      type: (event.target.value || "") as CharacterTypeField,
                    }))
                  }
                  className={inputClassName}
                >
                  {typeOptions.map((option) => (
                    <option
                      key={option.label}
                      value={option.value ?? ""}
                      className="bg-card text-card-foreground"
                    >
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block text-sm font-medium text-foreground/90">
                Importance
                <select
                  value={formState.importance}
                  onChange={(event) =>
                    setFormState((prev) => ({
                      ...prev,
                      importance: (event.target.value || "") as
                        | CharacterImportance
                        | "",
                    }))
                  }
                  className={inputClassName}
                >
                  {importanceOptions.map((option) => (
                    <option
                      key={option.label}
                      value={option.value ?? ""}
                      className="bg-card text-card-foreground"
                    >
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </VStack>

          <HStack className="lg:col-span-2 border-t border-border/80 pt-2" alignItems="center" justifyContent="space-between">
            <Body as="p" className="text-sm text-muted-foreground">
              {mode === "create"
                ? "New cards are created with today's dates and high importance by default."
                : "Saving updates the current card instantly in the session."}
            </Body>
            <HStack alignItems="center" gap={12}>
              <Button
                type="button"
                variant="ghost"
                disabled={isSubmitting}
                className="rounded-xl border border-border bg-secondary/50 px-5 text-secondary-foreground hover:bg-secondary"
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="rounded-xl bg-linear-to-r from-blue-400 to-indigo-400 px-6 text-primary-foreground shadow-lg shadow-indigo-950/30 hover:from-blue-300 hover:to-indigo-300"
              >
                {isSubmitting
                  ? "Saving..."
                  : mode === "create"
                    ? "Create Character"
                    : "Update Character"}
              </Button>
            </HStack>
          </HStack>
        </form>
        </Card>
      </DialogContent>
    </Dialog>
  );
};
