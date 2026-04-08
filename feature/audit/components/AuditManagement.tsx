"use client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { FileSearch, Activity } from "lucide-react";
import { AuditSummaryCards } from "./AuditSummaryCards";
import { AuditCharts } from "./AuditCharts";
import { AuditLatestEvents } from "./AuditLatestEvents";
import { AuditLogsView } from "./AuditLogsView";
import { useAuditSummary } from "../hooks/use-audit";

export function AuditManagement() {
  const { data: summary, isPending: summaryPending } = useAuditSummary();

  return (
    <main className="flex-1 overflow-auto p-6 md:p-8">
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
          <TabsList className="inline-flex h-10 items-center justify-center rounded-md p-1 text-muted-foreground bg-slate-100/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
            <TabsTrigger
              value="general"
              className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 gap-2"
            >
              <FileSearch className="w-4 h-4" />
              <span className="hidden sm:inline">Auditoría General</span>
              <span className="sm:hidden">Gestión</span>
            </TabsTrigger>
            <TabsTrigger
              value="logs"
              className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 gap-2"
            >
              <Activity className="w-4 h-4" />
              <span className="hidden sm:inline">Logs</span>
              <span className="sm:hidden">Logs</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="mt-6 animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
            <div className="space-y-6">
              <AuditSummaryCards summary={summary} isLoading={summaryPending} />
              <AuditCharts summary={summary} isLoading={summaryPending} />
              <AuditLatestEvents />
            </div>
          </TabsContent>

          <TabsContent value="logs" className="mt-6">
            <AuditLogsView />
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
