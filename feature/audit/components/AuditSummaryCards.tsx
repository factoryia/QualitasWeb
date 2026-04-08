"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AuditSummaryAggregateDto } from "../types";

interface AuditSummaryCardsProps {
  summary?: AuditSummaryAggregateDto;
  isLoading?: boolean;
}

export function AuditSummaryCards({ summary, isLoading }: AuditSummaryCardsProps) {
  // EventType: "Exception" is 4, "Security" is 2, "Activity" is 3
  const exceptions = summary?.eventsByType["Exception"] ?? 0;
  const security = summary?.eventsByType["Security"] ?? 0;
  const activity = summary?.eventsByType["Activity"] ?? 0;
  const total = Object.values(summary?.eventsByType || {}).reduce((acc, val) => acc + val, 0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card className="rounded-2xl border py-6 border-slate-200 dark:border-slate-800 shadow-sm">
        <CardContent className="px-6 pt-6 text-center">
          {isLoading ? (
            <Skeleton className="mx-auto h-9 w-24" />
          ) : (
            <span className="text-3xl font-bold text-black dark:text-white">
              {exceptions.toLocaleString()}
            </span>
          )}
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
            Excepciones
          </p>
        </CardContent>
      </Card>

      <Card className="rounded-2xl border py-6 border-slate-200 dark:border-slate-800 shadow-sm">
        <CardContent className="px-6 pt-6 text-center">
          {isLoading ? (
            <Skeleton className="mx-auto h-9 w-24" />
          ) : (
            <span className="text-3xl font-bold text-black dark:text-white">
              {security.toLocaleString()}
            </span>
          )}
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
            Seguridad
          </p>
        </CardContent>
      </Card>

      <Card className="rounded-2xl border py-6 border-slate-200 dark:border-slate-800 shadow-sm">
        <CardContent className="px-6 pt-6 text-center">
          {isLoading ? (
            <Skeleton className="mx-auto h-9 w-24" />
          ) : (
            <span className="text-3xl font-bold text-black dark:text-white">
              {total.toLocaleString()}
            </span>
          )}
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
            Actividad Total
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
