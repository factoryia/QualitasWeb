"use client";

import { cn } from "@/lib/utils";
import type { GoalDto } from "@/feature/planning/api/dofa";

interface GoalProgressBarProps {
  goal: Pick<
    GoalDto,
    "currentValue" | "baselineValue" | "targetValue" | "unit" | "progressPercentage"
  >;
  className?: string;
}

const TONE = (v: number) => {
  if (v >= 100) return { text: "text-emerald-500", bg: "bg-emerald-500" };
  if (v >= 60) return { text: "text-sky-500", bg: "bg-sky-500" };
  if (v >= 30) return { text: "text-amber-500", bg: "bg-amber-500" };
  return { text: "text-rose-500", bg: "bg-rose-500" };
};

export function GoalProgressBar({ goal, className }: GoalProgressBarProps) {
  const pct = Math.max(0, Math.min(100, goal.progressPercentage ?? 0));
  const tone = TONE(pct);
  const unit = goal.unit ?? "";

  return (
    <div className={cn("space-y-1", className)}>
      <div className="flex justify-between items-center text-xs">
        <span className="text-muted-foreground">
          {goal.currentValue} {unit} / {goal.targetValue} {unit}
        </span>
        <span className={cn("font-mono font-semibold", tone.text)}>{pct}%</span>
      </div>
      <div className="h-1.5 bg-border rounded-full overflow-hidden">
        <div
          className={cn("h-full transition-all duration-300", tone.bg)}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="flex justify-between text-[10px] text-muted-foreground">
        <span>Base: {goal.baselineValue}</span>
        <span>Meta: {goal.targetValue}</span>
      </div>
    </div>
  );
}
