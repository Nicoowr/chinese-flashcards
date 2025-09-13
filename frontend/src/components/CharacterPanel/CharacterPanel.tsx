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
  handleBack,
  canGoBack,
  knownCount,
  totalCount,
}: {
  data: ChineseCharacter | null;
  isLoading: boolean;
  showIdeogram: boolean;
  handleCheck: () => void | Promise<void>;
  handleReveal: () => void;
  handleUnknown: () => void | Promise<void>;
  handleBack: () => void | Promise<void>;
  canGoBack: boolean;
  knownCount: number;
  totalCount: number;
}) => {
  return (
    <Card className="w-3/4 p-10 space-y-8 bg-card">
      {isLoading ? (
        <div className="flex flex-col items-center">
          <Spinner className="animate-spin" />
        </div>
      ) : (
        <div className="flex flex-col items-center">
          <div className="flex flex-row items-center gap-4">
            <h2 className="text-4xl font-bold">{data?.translation}</h2>
            <div className="text-xl">{`(${data?.type} / ${data?.importance})`}</div>
          </div>
          {showIdeogram && (
            <>
              <div className="text-6xl font-bold mt-6">{data?.character}</div>
              <div className="text-xl mt-6">{data?.example}</div>
            </>
          )}
        </div>
      )}
      <div className="flex flex-col items-center space-y-2">
        <ControlButtons
          handleCheck={handleCheck}
          handleReveal={handleReveal}
          handleUnknown={handleUnknown}
          handleBack={handleBack}
          canGoBack={canGoBack}
          isLoading={isLoading}
          showIdeogram={showIdeogram}
        />
        <div className="w-full">
          <SessionPieChart knownCount={knownCount} totalCount={totalCount} />
        </div>
      </div>
    </Card>
  );
};
