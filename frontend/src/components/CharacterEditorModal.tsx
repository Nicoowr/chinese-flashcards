"use client";

import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { CharacterImportance, CharacterType, ChineseCharacter } from "./types";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";

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
  "mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-slate-100 outline-hidden transition placeholder:text-slate-500 focus:border-cyan-400/70 focus:ring-2 focus:ring-cyan-400/20";

export const CharacterEditorModal = ({
  isOpen,
  mode,
  character,
  isSubmitting,
  onClose,
  onSubmit,
}: {
  isOpen: boolean;
  mode: "create" | "edit";
  character: ChineseCharacter | null;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (payload: CharacterEditorPayload) => Promise<void>;
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

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(nextOpen: boolean) => {
        if (!nextOpen && !isSubmitting) {
          onClose();
        }
      }}
    >
      <DialogContent className="overflow-hidden border-white/10 bg-slate-900/95 p-0 text-slate-100">
        <Card className="relative w-full overflow-hidden border-0 bg-transparent text-slate-100 shadow-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.22),_transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(59,130,246,0.18),_transparent_40%)]" />
        <div className="relative border-b border-white/10 px-8 py-7">
          <DialogHeader className="max-w-2xl pr-12">
              <div className="mb-3 inline-flex rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200">
                {mode === "create" ? "Add Character" : "Edit Current Card"}
              </div>
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
          <div className="space-y-5">
            <label className="block text-sm font-medium text-slate-200">
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

            <label className="block text-sm font-medium text-slate-200">
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

            <label className="block text-sm font-medium text-slate-200">
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
          </div>

          <div className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm font-medium text-slate-200">
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
                      className="bg-slate-950 text-slate-100"
                    >
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block text-sm font-medium text-slate-200">
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
                      className="bg-slate-950 text-slate-100"
                    >
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          <div className="lg:col-span-2 flex items-center justify-between border-t border-white/10 pt-2">
            <p className="text-sm text-slate-400">
              {mode === "create"
                ? "New cards are created with today's dates and high importance by default."
                : "Saving updates the current card instantly in the session."}
            </p>
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="ghost"
                disabled={isSubmitting}
                className="rounded-xl border border-white/10 bg-white/5 px-5 text-slate-200 hover:bg-white/10"
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="rounded-xl bg-linear-to-r from-cyan-400 to-blue-500 px-6 text-slate-950 shadow-lg shadow-cyan-950/40 hover:from-cyan-300 hover:to-blue-400"
              >
                {isSubmitting
                  ? "Saving..."
                  : mode === "create"
                    ? "Create Character"
                    : "Update Character"}
              </Button>
            </div>
          </div>
        </form>
        </Card>
      </DialogContent>
    </Dialog>
  );
};
