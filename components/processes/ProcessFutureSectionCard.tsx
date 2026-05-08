"use client";

import type { LucideIcon } from "lucide-react";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type Accent = "violet" | "amber" | "sky" | "slate";

const accentBar: Record<Accent, string> = {
  violet: "bg-violet-500",
  amber: "bg-amber-500",
  sky: "bg-sky-500",
  slate: "bg-slate-400",
};

/** Sección del workspace aún sin pantalla funcional: solo título y descripción breve. */
export function ProcessFutureSectionCard({
  title,
  description,
  icon: Icon,
  accent = "slate",
}: {
  title: string;
  description: string;
  icon: LucideIcon;
  accent?: Accent;
}) {
  return (
    <Card className="overflow-hidden border-dashed bg-muted/20">
      <div className={cn("h-1 w-full", accentBar[accent])} aria-hidden />
      <CardHeader className="pb-5">
        <div className="flex items-start gap-3 min-w-0">
          <div className="rounded-lg border bg-background p-2.5 shrink-0">
            <Icon className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="min-w-0 space-y-1">
            <CardTitle className="text-base leading-snug">{title}</CardTitle>
            <CardDescription className="text-sm leading-relaxed">{description}</CardDescription>
          </div>
        </div>
      </CardHeader>
    </Card>
  );
}
