"use client";

import { toast } from "sonner";
import {
  Body,
  Box,
  Button,
  HStack,
  VStack,
} from "../design-system/components";
import { ChineseCharacter } from "./types";

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

  const dotColor = accentColor === "green" ? "bg-emerald-400" : "bg-red-400";

  const isEmpty = characters.length === 0;

  return (
    <VStack className="min-h-0 flex-1">
      <HStack className="mb-2" justifyContent="space-between" alignItems="center">
        <HStack alignItems="center" gap={8}>
          <Box className={`w-2 h-2 rounded-full ${dotColor}`} />
          <Body as="h3" className={`text-sm font-semibold uppercase tracking-wider whitespace-nowrap ${colorClasses}`}>
            {title} ({characters.length})
          </Body>
        </HStack>
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
      </HStack>
      <Box className="flex-1 overflow-y-auto rounded-lg glass p-2.5">
        {isEmpty ? (
          <Body as="p" className="text-xs text-muted-foreground/60 italic">
            None yet
          </Body>
        ) : (
          <VStack as="ul" className="space-y-0.5">
            {characters.map((character) => (
              <Body
                as="li"
                key={character.id}
                className="text-base leading-relaxed text-foreground/80 cursor-pointer rounded px-1 hover:bg-white/10 transition-colors"
                onClick={() => onCharacterClick(character)}
              >
                {character.character}
              </Body>
            ))}
          </VStack>
        )}
      </Box>
    </VStack>
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
    <HStack className="w-96 shrink-0 max-h-[80vh] self-start" gap={12}>
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
    </HStack>
  );
};
