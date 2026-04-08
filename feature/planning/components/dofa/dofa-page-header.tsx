"use client";

import { Globe } from "lucide-react";

export function DofaPageHeader() {
  return (
    <div>
      <h1 className="text-2xl font-bold flex items-center gap-2">
        <Globe className="h-6 w-6 text-primary" />
        Análisis DOFA
      </h1>
      <p className="text-muted-foreground text-sm mt-1">
        Análisis estratégico por perspectivas del Balanced Scorecard
      </p>
    </div>
  );
}
