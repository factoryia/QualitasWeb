"use client";

import { cn } from "@/lib/utils";

interface TableSkeletonProps {
  rows?: number;
  cols?: number;
  className?: string;
}

export function TableSkeletonLogs({ rows = 10, cols = 6, className }: TableSkeletonProps) {
  return (
    <div className={cn("animate-pulse", className)}>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200 dark:border-slate-800">
            {Array.from({ length: cols }).map((_, i) => (
              <th key={i} className="px-4 py-3 text-left">
                <div className="h-4 w-24 rounded bg-slate-200 dark:bg-slate-700" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, rowIdx) => (
            <tr
              key={rowIdx}
              className="border-b border-slate-100 dark:border-slate-800"
            >
              {Array.from({ length: cols }).map((_, colIdx) => (
                <td key={colIdx} className="px-4 py-3">
                  <div
                    className={cn(
                      "h-4 rounded bg-slate-100 dark:bg-slate-800",
                      colIdx === cols - 1 ? "w-20 ml-auto" : "w-full max-w-xs"
                    )}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
