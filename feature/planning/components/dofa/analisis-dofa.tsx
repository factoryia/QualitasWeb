"use client";

import { useMemo, useState, type FormEvent } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { CreateDofaAnalysisCommand } from "@/feature/planning/api/dofa";
import { useDofaCreateAnalysisMutation } from "@/feature/planning/hooks/use-dofa";
import { useOrganizationsQuery } from "@/feature/organization/hooks/use-organizations";
import { useAuthStore } from "@/feature/auth/store/auth.store";
import { DofaCreateAnalysisDialog } from "./dofa-create-analysis-dialog";
import { DofaDetail } from "./dofa-detail";
import { DofaList } from "./dofa-list";
import { DofaPageHeader } from "./dofa-page-header";

type AnalysisDraft = {
  title: string;
  period: string;
  description: string;
};

export function AnalisisDofa() {
  const createAnalysisMutation = useDofaCreateAnalysisMutation();
  const tenantCode = useAuthStore((s) => s.user?.tenant ?? "root");
  const { data: organizations = [], isLoading: isOrgLoading } = useOrganizationsQuery();

  const organization = useMemo(() => {
    return organizations.find((o) => o.code === tenantCode) ?? organizations[0] ?? null;
  }, [organizations, tenantCode]);

  const organizationId = organization?.id ?? null;
  const organizationName = organization?.name ?? null;

  // Selected analysis — null = list view, string = detail view
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const [analysisDialogOpen, setAnalysisDialogOpen] = useState(false);
  const [analysisDraft, setAnalysisDraft] = useState<AnalysisDraft>({
    title: "",
    period: new Date().getFullYear().toString(),
    description: "",
  });

  const openCreateAnalysis = () => {
    const year = new Date().getFullYear();
    const baseTitle = organizationName
      ? `DOFA ${year} - ${organizationName}`
      : `DOFA ${year}`;
    setAnalysisDraft({ title: baseTitle, period: year.toString(), description: "" });
    setAnalysisDialogOpen(true);
  };

  const submitCreateAnalysis = async (e: FormEvent) => {
    e.preventDefault();
    if (!organizationId) return;
    const payload: CreateDofaAnalysisCommand = {
      title: analysisDraft.title.trim(),
      entityType: "Organization",
      entityId: organizationId,
      period: analysisDraft.period.trim() || null,
      description: analysisDraft.description.trim() || null,
    };
    if (!payload.title) return;
    const created = await createAnalysisMutation.mutateAsync(payload);
    if (created?.id) {
      setAnalysisDialogOpen(false);
      setSelectedId(created.id);
    }
  };

  return (
    <div className="space-y-6">
      <DofaPageHeader />

      <Card className="py-4 sm:py-6">
        <CardContent className="px-3 sm:px-6">
          {isOrgLoading ? (
            <div className="space-y-3 mt-4">
              <Skeleton className="h-10 w-[40%]" />
              <Skeleton className="h-[380px] w-full" />
            </div>
          ) : !organizationId ? (
            <div className="rounded-lg border bg-card p-10 text-center text-sm text-muted-foreground">
              No se encontró una organización para el tenant actual.
            </div>
          ) : selectedId ? (
            <DofaDetail
              analysisId={selectedId}
              onBack={() => setSelectedId(null)}
            />
          ) : (
            <div className="mt-4">
              <DofaList
                organizationId={organizationId}
                onSelect={setSelectedId}
                onCreateClick={openCreateAnalysis}
              />
            </div>
          )}
        </CardContent>
      </Card>

      <DofaCreateAnalysisDialog
        open={analysisDialogOpen}
        onOpenChange={setAnalysisDialogOpen}
        draft={analysisDraft}
        onDraftChange={(patch) => setAnalysisDraft((d) => ({ ...d, ...patch }))}
        onSubmit={submitCreateAnalysis}
        isBusy={createAnalysisMutation.isPending}
        canSubmit={
          !!organizationId &&
          !!analysisDraft.title.trim() &&
          !createAnalysisMutation.isPending
        }
      />
    </div>
  );
}
