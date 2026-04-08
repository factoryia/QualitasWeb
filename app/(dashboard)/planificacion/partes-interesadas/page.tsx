"use client";

import { StakeholdersModule } from "@/feature/planning/components/stakeholders/StakeholdersModule";

export default function PartesInteresadasPage() {
  return (
    <main className="flex-1 overflow-auto p-6 md:p-8">
      <StakeholdersModule />
    </main>
  );
}

