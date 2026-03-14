import { Spinner } from "@radix-ui/themes";
import { ArrowLeft, Pencil, Plus } from "lucide-react";
import {
  Body,
  Box,
  Button,
  Card,
  HStack,
  VStack,
} from "../../design-system/components";
import { SessionPieChart } from "../SessionPieChart";
import { ChineseCharacter } from "../types";
import { ControlButtons } from "./ControlButtons";

export const CharacterPanelView = ({
  data,
  isLoading,
  showIdeogram,
  handleCheck,
  handleReveal,
  handleUnknown,
  knownCharacters,
  totalCount,
  onBack,
  onAddCharacter,
  onEditCharacter,
}: {
  data: ChineseCharacter | null;
  isLoading: boolean;
  showIdeogram: boolean;
  handleCheck: () => void | Promise<void>;
  handleReveal: () => void;
  handleUnknown: () => void | Promise<void>;
  knownCharacters: ChineseCharacter[];
  totalCount: number;
  onBack?: () => void;
  onAddCharacter: () => void;
  onEditCharacter: () => void;
}) => {
  return (
    <Card className="flex-1 pt-16 px-10 pb-10 space-y-8 glass rounded-2xl shadow-2xl shadow-black/20 relative min-h-[420px]">
      {onBack && (
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-4 left-4 text-muted-foreground hover:text-foreground transition-colors"
          onClick={onBack}
        >
          <ArrowLeft className="w-5 h-5 mr-1" />
          Back
        </Button>
      )}
      <HStack
        className="absolute top-4 right-4 z-20"
        alignItems="center"
        gap={8}
      >
        <Button
          variant="outline"
          size="sm"
          className="border-white/10 bg-white/5 text-foreground hover:bg-white/10"
          onClick={onAddCharacter}
        >
          <Plus className="mr-1 h-4 w-4" />
          Add
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:text-foreground transition-colors"
          disabled={!data || isLoading}
          onClick={onEditCharacter}
        >
          <Pencil className="mr-1 h-4 w-4" />
          Edit
        </Button>
      </HStack>
      {isLoading ? (
        <VStack className="py-12" alignItems="center">
          <Spinner className="animate-spin" />
        </VStack>
      ) : (
        <VStack alignItems="center" gap={8}>
          <Body as="h2" className="text-4xl font-bold tracking-tight">
            {data?.translation}
          </Body>
          <Body className="text-sm font-medium text-muted-foreground tracking-wide uppercase">
            {data?.type} / {data?.importance}
          </Body>
          {showIdeogram && (
            <VStack className="mt-4" alignItems="center" gap={12}>
              <Body as="h1" className="text-7xl font-bold bg-linear-to-br from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                {data?.character}
              </Body>
              <Body as="p" className="text-lg text-muted-foreground italic">
                {data?.example}
              </Body>
            </VStack>
          )}
        </VStack>
      )}
      <VStack className="space-y-4" alignItems="center">
        <ControlButtons
          handleCheck={handleCheck}
          handleReveal={handleReveal}
          handleUnknown={handleUnknown}
          isLoading={isLoading}
          showIdeogram={showIdeogram}
        />
        <Box className="w-full">
          <SessionPieChart
            knownCount={knownCharacters.length}
            totalCount={totalCount}
          />
        </Box>
      </VStack>
    </Card>
  );
};
