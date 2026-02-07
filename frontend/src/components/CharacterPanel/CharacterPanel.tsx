import { Spinner } from "@radix-ui/themes";
import { ChineseCharacter } from "../types";
import { Card } from "../ui/card";
import { SessionPieChart } from "../SessionPieChart";
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
}: {
  data: ChineseCharacter | null;
  isLoading: boolean;
  showIdeogram: boolean;
  handleCheck: () => void | Promise<void>;
  handleReveal: () => void;
  handleUnknown: () => void | Promise<void>;
  knownCharacters: ChineseCharacter[];
  totalCount: number;
}) => {
  return (
    <Card className="flex-1 p-10 space-y-8 glass rounded-2xl shadow-2xl shadow-black/20">
      {isLoading ? (
        <div className="flex flex-col items-center py-12">
          <Spinner className="animate-spin" />
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2">
          <h2 className="text-4xl font-bold tracking-tight">
            {data?.translation}
          </h2>
          <div className="text-sm font-medium text-muted-foreground tracking-wide uppercase">
            {data?.type} / {data?.importance}
          </div>
          {showIdeogram && (
            <div className="flex flex-col items-center mt-4 gap-3">
              <div className="text-7xl font-bold bg-gradient-to-br from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                {data?.character}
              </div>
              <div className="text-lg text-muted-foreground italic">
                {data?.example}
              </div>
            </div>
          )}
        </div>
      )}
      <div className="flex flex-col items-center space-y-4">
        <ControlButtons
          handleCheck={handleCheck}
          handleReveal={handleReveal}
          handleUnknown={handleUnknown}
          isLoading={isLoading}
          showIdeogram={showIdeogram}
        />
        <div className="w-full">
          <SessionPieChart
            knownCount={knownCharacters.length}
            totalCount={totalCount}
          />
        </div>
      </div>
    </Card>
  );
};
