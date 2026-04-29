"use client";

import { motion } from "framer-motion";

export function PortfolioDonut({ allocations, totalValue }: any) {
  let cumulativePercent = 0;
  const activeSlices = allocations.filter((a: any) => a.weight > 0);
  
  function getCoordinatesForPercent(percent: number) {
    const x = Math.cos(2 * Math.PI * percent);
    const y = Math.sin(2 * Math.PI * percent);
    return [x, y];
  }

  return (
    <div className="relative w-full aspect-square max-w-[300px] mx-auto">
      <svg viewBox="-1 -1 2 2" className="w-full h-full -rotate-90 drop-shadow-xl">
        {activeSlices.map((slice: any) => {
          if (slice.weight === 100) {
            return <motion.circle key={slice.sectorId} cx="0" cy="0" r="1" fill="transparent" stroke={slice.color} strokeWidth="0.5" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1 }} />;
          }

          const startPercent = cumulativePercent;
          const endPercent = cumulativePercent + slice.weight / 100;
          cumulativePercent = endPercent;

          const [startX, startY] = getCoordinatesForPercent(startPercent);
          const [endX, endY] = getCoordinatesForPercent(endPercent);
          const largeArcFlag = slice.weight / 100 > 0.5 ? 1 : 0;
          const pathData = `M ${startX} ${startY} A 1 1 0 ${largeArcFlag} 1 ${endX} ${endY}`;

          return (
            <motion.path key={slice.sectorId} d={pathData} fill="transparent" stroke={slice.color} strokeWidth="0.5" initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }} transition={{ duration: 1, delay: startPercent * 0.5 }} />
          );
        })}
        {activeSlices.length === 0 && <circle cx="0" cy="0" r="1" fill="transparent" stroke="currentColor" strokeWidth="0.5" className="text-muted/30" />}
      </svg>
      <div className="absolute inset-0 m-[15%] bg-card rounded-full shadow-inner flex flex-col items-center justify-center pointer-events-none">
        {totalValue !== undefined && (
          <>
            <span className="text-xs text-muted-foreground font-medium">총 평가액</span>
            <span className="text-2xl font-extrabold tracking-tight">{totalValue.toLocaleString()}원</span>
          </>
        )}
      </div>
    </div>
  );
}
