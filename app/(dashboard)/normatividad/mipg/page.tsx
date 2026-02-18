"use client";

import { Card, CardContent } from "@/components/ui/card";

export default function MIPGPage() {
  return (
    <div className="space-y-4 px-1 sm:px-0">
      <div className="min-w-0">
        <h1 className="text-lg sm:text-[22px] font-bold tracking-tight text-foreground wrap-break-word">MIPG</h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
          Gestión del Modelo Integrado de Planeación y Gestión (MIPG).
        </p>
      </div>
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          <p>Funcionalidad en desarrollo.</p>
        </CardContent>
      </Card>
    </div>
  );
}
