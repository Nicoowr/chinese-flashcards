"use client";

import dynamic from "next/dynamic";
import { useMemo } from "react";

const ReactECharts = dynamic(() => import("echarts-for-react"), {
  ssr: false,
});

export const SessionPieChart = ({
  knownCount,
  totalCount,
}: {
  knownCount: number;
  totalCount: number;
}) => {
  const unknownCount = Math.max(totalCount - knownCount, 0);

  const option = useMemo(() => {
    return {
      backgroundColor: "transparent",
      tooltip: {
        trigger: "item",
      },
      legend: { show: false },
      series: [
        {
          name: "Session",
          type: "pie",
          radius: ["40%", "70%"],
          avoidLabelOverlap: true,
          label: { show: false },
          labelLine: { show: false },
          data: [
            {
              value: knownCount,
              name: "Known",
              itemStyle: { color: "#22c55e" },
            },
            {
              value: unknownCount,
              name: "Unknown",
              itemStyle: { color: "#ef4444" },
            },
          ],
        },
      ],
    } as const;
  }, [knownCount, unknownCount]);

  return (
    <div className="w-full flex justify-center">
      <div className="w-44 h-44">
        <ReactECharts
          option={option as any}
          style={{ height: "100%", width: "100%" }}
        />
      </div>
    </div>
  );
};
