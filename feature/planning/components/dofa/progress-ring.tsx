"use client";

import { cn } from "@/lib/utils";

interface ProgressRingProps {
  value: number;
  size?: number;
  showLabel?: boolean;
  className?: string;
}

const COLOR_STROKE = (v: number) =>
  v >= 100
    ? "stroke-emerald-500"
    : v >= 60
      ? "stroke-sky-500"
      : v >= 30
        ? "stroke-amber-500"
        : "stroke-rose-500";

const COLOR_TEXT = (v: number) =>
  v >= 100
    ? "text-emerald-500"
    : v >= 60
      ? "text-sky-500"
      : v >= 30
        ? "text-amber-500"
        : "text-rose-500";

export function ProgressRing({
  value,
  size = 40,
  showLabel = true,
  className,
}: ProgressRingProps) {
  const v = Math.max(0, Math.min(100, value || 0));
  const r = size / 2 - 4;
  const circ = 2 * Math.PI * r;
  const offset = circ - (circ * v) / 100;
  const strokeClass = COLOR_STROKE(v);
  const textClass = COLOR_TEXT(v);

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className={cn(className)}
    >
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        className="stroke-border"
        strokeWidth="3"
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        className={cn(strokeClass, "transition-all duration-300")}
        strokeWidth="3"
        strokeDasharray={circ}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
      {showLabel && (
        <text
          x="50%"
          y="50%"
          textAnchor="middle"
          dominantBaseline="central"
          className={cn(textClass, "font-bold")}
          style={{ fontSize: size > 36 ? 9 : 7 }}
        >
          {v}%
        </text>
      )}
    </svg>
  );
}
