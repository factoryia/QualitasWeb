"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileSearch, Activity } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { SystemLogs } from "@/features/auditoria/components/LogsSistema";
import { AuditGeneral } from "@/features/auditoria/components/AuditGeneral";
import { useAuditSummaryQuery } from "@/features/auditoria/hooks/use-auditoria-query";

function AuditoriaPageSkeleton() {
  return (
    <div className="space-y-4">
      <div>
        <Skeleton className="h-7 w-40 mb-2" />
        <Skeleton className="h-4 w-96 max-w-full" />
      </div>
      <div className="flex gap-1 p-1 rounded-lg bg-muted/50 w-fit">
        <Skeleton className="h-9 w-32 rounded-md" />
        <Skeleton className="h-9 w-20 rounded-md" />
      </div>
      <div className="mt-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton className="h-48 rounded-xl" />
          <Skeleton className="h-48 rounded-xl" />
        </div>
        <Skeleton className="h-64 rounded-xl" />
      </div>
    </div>
  );
}

export default function AuditoriasPage() {
  const { data: summary, isLoading, isPending } = useAuditSummaryQuery();

  if (isLoading || isPending) {
    return <AuditoriaPageSkeleton />;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-[22px] font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Auditoría
          </h1>
          <p className="text-sm text-muted-foreground">
            Programas, ejecución, equipo auditor y hallazgos.
          </p>
        </div>
      </div>
      <Tabs defaultValue="general" className="w-full">
        <TabsList className="bg-slate-100/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
          <TabsTrigger value="general" className="gap-2">
            <FileSearch size={16} />
            <span className="hidden sm:inline">Auditoría General</span>
            <span className="sm:hidden">Gestión</span>
          </TabsTrigger>
          <TabsTrigger value="logs" className="gap-2">
            <Activity size={16} />
            Logs
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="mt-6">
          <div className="animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
            <AuditGeneral />
          </div>
        </TabsContent>
        <TabsContent value="logs" className="mt-6">
          <div className="animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
            <SystemLogs />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
