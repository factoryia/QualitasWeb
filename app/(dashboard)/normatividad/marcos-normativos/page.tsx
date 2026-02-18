"use client";

import { MarcosNormativosTab } from "@/features/compliance/components/MarcosNormativosTab";

export default function MarcosNormativosPage() {
  return (
    <div className="space-y-4 px-1 sm:px-0">
      <div className="min-w-0">
        <h1 className="text-lg sm:text-[22px] font-bold tracking-tight text-foreground wrap-break-word">Marcos Normativos</h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
          Gestión de marcos regulatorios y normativos.
        </p>
      </div>
      <MarcosNormativosTab />
    </div>
  );
}
