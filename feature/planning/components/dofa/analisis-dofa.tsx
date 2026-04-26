"use client";

import { useState } from "react";
import { DofaDetail } from "./dofa-detail";
import { DofaList } from "./dofa-list";

/**
 * DofaModule — root component used by app/(dashboard)/planificacion/analisis-dofa/page.tsx.
 * Routes between list view and detail view using local state (no URL params needed).
 */
export function AnalisisDofa() {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  if (selectedId) {
    return (
      <DofaDetail
        analysisId={selectedId}
        onBack={() => setSelectedId(null)}
      />
    );
  }

  return <DofaList onSelect={setSelectedId} />;
}
