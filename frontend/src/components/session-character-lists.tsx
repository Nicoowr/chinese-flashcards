"use client";

import { toast } from "sonner";
import { ChineseCharacter } from "./types";
import { Button } from "../design-system/components/button";

const copyCharactersToClipboard = async (characters: ChineseCharacter[]) => {
  const text = characters.map((c) => c.character).join("\n");
  await navigator.clipboard.writeText(text);
  toast.success("Copied to clipboard");
};

const CharacterList = ({
  title,
  characters,
  accentColor,
  onCharacterClick,
}: {
  title: string;
  characters: ChineseCharacter[];
  accentColor: "green" | "red";
  onCharacterClick: (character: ChineseCharacter) => void;
}) => {
  const colorClasses =
    accentColor === "green" ? "text-emerald-400" : "text-red-400";

  const dotColor =
    accentColor === "green" ? "bg-emerald-400" : "bg-red-400";

  const isEmpty = characters.length === 0;

  return (
    <div className="flex flex-col min-h-0 flex-1">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${dotColor}`} />
          <h3 className={`text-sm font-semibold uppercase tracking-wider whitespace-nowrap ${colorClasses}`}>
            {title} ({characters.length})
          </h3>
        </div>
        {!isEmpty && (
          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
            onClick={() => copyCharactersToClipboard(characters)}
          >
            Copy
          </Button>
        )}
      </div>
      <div className="flex-1 overflow-y-auto rounded-lg glass p-2.5">
        {isEmpty ? (
          <p className="text-xs text-muted-foreground/60 italic">None yet</p>
        ) : (
          <ul className="space-y-0.5">
            {characters.map((character) => (
              <li
                key={character.id}
                className="text-base leading-relaxed text-foreground/80 cursor-pointer rounded px-1 hover:bg-white/10 transition-colors"
                onClick={() => onCharacterClick(character)}
              >
                {character.character}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export const SessionCharacterLists = ({
  knownCharacters,
  unknownCharacters,
  onCharacterClick,
}: {
  knownCharacters: ChineseCharacter[];
  unknownCharacters: ChineseCharacter[];
  onCharacterClick: (character: ChineseCharacter) => void;
}) => {
  return (
    <div className="w-96 shrink-0 flex gap-3 max-h-[80vh] self-start">
      <CharacterList
        title="Known"
        characters={knownCharacters}
        accentColor="green"
        onCharacterClick={onCharacterClick}
      />
      <CharacterList
        title="Unknown"
        characters={unknownCharacters}
        accentColor="red"
        onCharacterClick={onCharacterClick}
      />
    </div>
  );
};
