"use client";

import { toast } from "sonner";
import { ChineseCharacter } from "./types";
import { Button } from "./ui/button";

const copyCharactersToClipboard = async (characters: ChineseCharacter[]) => {
  const text = characters.map((c) => c.character).join("\n");
  await navigator.clipboard.writeText(text);
  toast.success("Copied to clipboard");
};

const CharacterList = ({
  title,
  characters,
  accentColor,
}: {
  title: string;
  characters: ChineseCharacter[];
  accentColor: "green" | "red";
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
          <h3 className={`text-xs font-semibold uppercase tracking-wider ${colorClasses}`}>
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
          <ul className="space-y-0.5 select-all cursor-text">
            {characters.map((character) => (
              <li
                key={character.id}
                className="text-sm leading-relaxed text-foreground/80"
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
}: {
  knownCharacters: ChineseCharacter[];
  unknownCharacters: ChineseCharacter[];
}) => {
  return (
    <div className="w-72 shrink-0 flex gap-3 max-h-[80vh] self-start">
      <CharacterList
        title="Known"
        characters={knownCharacters}
        accentColor="green"
      />
      <CharacterList
        title="Unknown"
        characters={unknownCharacters}
        accentColor="red"
      />
    </div>
  );
};
