"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  AlertTriangle,
  ArrowLeft,
  Check,
  ChevronDown,
  LayoutGrid,
  Loader2,
  Pencil,
  Plus,
  Settings2,
  X,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { DofaItemDto } from "@/feature/planning/api/dofa";
import {
  useBscPerspectivesQuery,
  useDofaAnalysisQuery,
  useDofaCreateItemMutation,
  useDofaDeactivateItemMutation,
  useDofaUpdateItemMutation,
} from "@/feature/planning/hooks/use-dofa";
import { DOFA_PERSPECTIVE_TABS } from "./dofa-constants";
import { improveText } from "./dofa-text";
import { PerspectiveManager } from "./perspective-manager";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type DofaCategory = "Fortaleza" | "Debilidad" | "Oportunidad" | "Amenaza";

type PerspectiveTab = {
  key: string;
  label: string;
  description: string;
};

type QuadrantConfig = {
  category: DofaCategory;
  label: string;
  textClass: string;
  borderClass: string;
  fillClass: string;
};

// ---------------------------------------------------------------------------
// Constants — colour tokens mapped to Tailwind (no Lovable CSS vars available)
// ---------------------------------------------------------------------------

const QUADRANTS: QuadrantConfig[] = [
  {
    category: "Fortaleza",
    label: "Fortalezas",
    textClass: "text-green-700 dark:text-green-400",
    borderClass: "border-green-400/40",
    fillClass: "bg-green-500",
  },
  {
    category: "Debilidad",
    label: "Debilidades",
    textClass: "text-red-700 dark:text-red-400",
    borderClass: "border-red-400/40",
    fillClass: "bg-red-500",
  },
  {
    category: "Oportunidad",
    label: "Oportunidades",
    textClass: "text-blue-700 dark:text-blue-400",
    borderClass: "border-blue-400/40",
    fillClass: "bg-blue-500",
  },
  {
    category: "Amenaza",
    label: "Amenazas",
    textClass: "text-amber-700 dark:text-amber-400",
    borderClass: "border-amber-400/40",
    fillClass: "bg-amber-500",
  },
];

// ---------------------------------------------------------------------------
// ItemCard — inline editable
// ---------------------------------------------------------------------------

function ItemCard({
  item,
  onSave,
  onDelete,
  readOnly,
}: {
  item: DofaItemDto;
  onSave: (text: string) => Promise<void>;
  onDelete: () => void;
  readOnly: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(item.description);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (editing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
    }
  }, [editing]);

  const commit = async () => {
    const trimmed = draft.trim();
    if (!trimmed || trimmed === item.description) {
      setDraft(item.description);
      setEditing(false);
      return;
    }
    await onSave(trimmed);
    setEditing(false);
  };

  if (editing) {
    return (
      <textarea
        ref={textareaRef}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            commit();
          }
          if (e.key === "Escape") {
            setDraft(item.description);
            setEditing(false);
          }
        }}
        rows={2}
        className="w-full text-sm bg-background border rounded-md px-2 py-1.5 outline-none focus:ring-2 focus:ring-ring resize-none"
      />
    );
  }

  return (
    <div className="group flex items-start gap-2 px-2 py-1.5 rounded-md hover:bg-muted/40 border border-transparent hover:border-border transition-colors">
      <p className="flex-1 text-sm text-foreground whitespace-pre-wrap break-words leading-snug">
        {item.description}
      </p>
      {!readOnly && (
        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          <button
            onClick={() => setEditing(true)}
            className="p-1 rounded hover:bg-muted"
            title="Editar"
            type="button"
          >
            <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
          </button>
          <button
            onClick={onDelete}
            className="p-1 rounded hover:bg-destructive/10 text-destructive"
            title="Eliminar"
            type="button"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// AddFactorInput — click-to-activate inline input
// ---------------------------------------------------------------------------

function AddFactorInput({
  category,
  onAdd,
  compact = false,
}: {
  category: DofaCategory;
  onAdd: (text: string) => Promise<void>;
  compact?: boolean;
}) {
  const [active, setActive] = useState(false);
  const [text, setText] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (active && inputRef.current) inputRef.current.focus();
  }, [active]);

  const commit = async () => {
    const t = text.trim();
    if (!t) {
      setActive(false);
      setText("");
      return;
    }
    await onAdd(t);
    setText("");
    setActive(false);
  };

  if (!active) {
    const labelMap: Record<DofaCategory, string> = {
      Fortaleza: "fortaleza",
      Debilidad: "debilidad",
      Oportunidad: "oportunidad",
      Amenaza: "amenaza",
    };
    return (
      <button
        onClick={() => setActive(true)}
        type="button"
        className={cn(
          "w-full flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground py-1.5 rounded-md hover:bg-background/60 transition-colors",
          compact ? "justify-center" : "justify-start px-2",
        )}
      >
        <Plus className="h-3.5 w-3.5" />
        {compact ? "" : `Agregar ${labelMap[category]}`}
      </button>
    );
  }

  return (
    <Input
      ref={inputRef}
      value={text}
      onChange={(e) => setText(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === "Enter") commit();
        if (e.key === "Escape") {
          setText("");
          setActive(false);
        }
      }}
      placeholder="Escribe y presiona Enter..."
      className="h-8 text-sm"
    />
  );
}

// ---------------------------------------------------------------------------
// MatrixTable — desktop view
// ---------------------------------------------------------------------------

type GroupedItems = Record<string, Record<DofaCategory, DofaItemDto[]>>;

function MatrixTable({
  perspectives,
  grouped,
  onAdd,
  onUpdate,
  onDelete,
  readOnly,
}: {
  perspectives: PerspectiveTab[];
  grouped: GroupedItems;
  onAdd: (perspKey: string, category: DofaCategory, text: string) => Promise<void>;
  onUpdate: (item: DofaItemDto, text: string) => Promise<void>;
  onDelete: (item: DofaItemDto) => void;
  readOnly: boolean;
}) {
  return (
    <div className="relative border rounded-lg overflow-hidden bg-card">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr>
              <th className="sticky left-0 z-20 bg-muted/80 backdrop-blur text-left text-[11px] font-semibold uppercase tracking-wide text-muted-foreground px-3 py-2 border-b border-r min-w-[150px] w-[170px]">
                Perspectiva
              </th>
              {QUADRANTS.map((q) => (
                <th
                  key={q.category}
                  className={cn(
                    "text-left text-[11px] font-bold uppercase tracking-wide px-3 py-2 border-b border-r last:border-r-0 min-w-[180px]",
                    q.textClass,
                    "bg-muted/40",
                  )}
                >
                  <span className="inline-flex items-center gap-1.5">
                    <span className={cn("h-1.5 w-1.5 rounded-full", q.fillClass)} />
                    {q.label}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {perspectives.map((p) => (
              <tr key={p.key} className="border-b last:border-b-0 align-top">
                <td className="sticky left-0 z-10 bg-muted/30 backdrop-blur px-3 py-2.5 border-r">
                  <span className="text-sm font-medium text-foreground leading-tight">
                    {p.label}
                  </span>
                </td>
                {QUADRANTS.map((q) => {
                  const list = grouped[p.key]?.[q.category] ?? [];
                  return (
                    <td
                      key={q.category}
                      className="p-1.5 border-r last:border-r-0 align-top"
                    >
                      <div className="flex flex-col gap-1">
                        {list.map((item) => (
                          <ItemCard
                            key={item.id}
                            item={item}
                            onSave={(t) => onUpdate(item, t)}
                            onDelete={() => onDelete(item)}
                            readOnly={readOnly}
                          />
                        ))}
                        {!readOnly && (
                          <AddFactorInput
                            category={q.category}
                            onAdd={(t) => onAdd(p.key, q.category, t)}
                            compact
                          />
                        )}
                        {list.length === 0 && readOnly && (
                          <span className="text-[11px] text-muted-foreground/60 italic px-2 py-1">
                            Sin factores
                          </span>
                        )}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// MatrixMobileCards — mobile accordion view
// ---------------------------------------------------------------------------

function MatrixMobileCards({
  perspectives,
  grouped,
  onAdd,
  onUpdate,
  onDelete,
  readOnly,
}: {
  perspectives: PerspectiveTab[];
  grouped: GroupedItems;
  onAdd: (perspKey: string, category: DofaCategory, text: string) => Promise<void>;
  onUpdate: (item: DofaItemDto, text: string) => Promise<void>;
  onDelete: (item: DofaItemDto) => void;
  readOnly: boolean;
}) {
  const [openKey, setOpenKey] = useState<string | null>(perspectives[0]?.key ?? null);

  return (
    <div className="space-y-2">
      {perspectives.map((p) => {
        const isOpen = openKey === p.key;
        const total = QUADRANTS.reduce(
          (acc, q) => acc + (grouped[p.key]?.[q.category]?.length ?? 0),
          0,
        );

        return (
          <Collapsible
            key={p.key}
            open={isOpen}
            onOpenChange={(o) => setOpenKey(o ? p.key : null)}
          >
            <div className="rounded-lg border bg-card overflow-hidden">
              <CollapsibleTrigger asChild>
                <button
                  type="button"
                  className="w-full flex items-center justify-between gap-2 px-3 py-3 hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-sm font-semibold text-foreground truncate">
                      {p.label}
                    </span>
                    <Badge variant="secondary" className="text-[10px] h-5 shrink-0">
                      {total}
                    </Badge>
                  </div>
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 text-muted-foreground transition-transform",
                      isOpen && "rotate-180",
                    )}
                  />
                </button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="px-3 pb-3 space-y-3 border-t">
                  {QUADRANTS.map((q) => {
                    const list = grouped[p.key]?.[q.category] ?? [];
                    return (
                      <div key={q.category} className="space-y-1.5">
                        <div
                          className={cn(
                            "flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide pt-2",
                            q.textClass,
                          )}
                        >
                          <span className={cn("h-1.5 w-1.5 rounded-full", q.fillClass)} />
                          {q.label}
                          <span className="text-muted-foreground font-normal normal-case">
                            ({list.length})
                          </span>
                        </div>
                        <div className="space-y-1">
                          {list.map((item) => (
                            <ItemCard
                              key={item.id}
                              item={item}
                              onSave={(t) => onUpdate(item, t)}
                              onDelete={() => onDelete(item)}
                              readOnly={readOnly}
                            />
                          ))}
                          {!readOnly && (
                            <AddFactorInput
                              category={q.category}
                              onAdd={(t) => onAdd(p.key, q.category, t)}
                            />
                          )}
                          {list.length === 0 && readOnly && (
                            <span className="text-[11px] text-muted-foreground/60 italic px-2">
                              Sin factores
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CollapsibleContent>
            </div>
          </Collapsible>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// DofaDiagnostico — main component
// ---------------------------------------------------------------------------

type Props = {
  analysisId: string;
  readOnly?: boolean;
};

export function DofaDiagnostico({ analysisId, readOnly = false }: Props) {
  const analysisQuery = useDofaAnalysisQuery(analysisId);
  const { data: bscPerspectives = [] } = useBscPerspectivesQuery();
  const createItemMutation = useDofaCreateItemMutation();
  const updateItemMutation = useDofaUpdateItemMutation();
  const deactivateItemMutation = useDofaDeactivateItemMutation();

  const [activePerspective, setActivePerspective] = useState<string | null>(null);
  const [view, setView] = useState<"perspective" | "matrix">("perspective");
  const [confirmDelete, setConfirmDelete] = useState<DofaItemDto | null>(null);
  const [managerOpen, setManagerOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile (no hook dependency — avoids adding use-mobile.ts)
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    setIsMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  /**
   * Build perspective list from BSC backend data, falling back to hardcoded tabs.
   * NOTE: items still store perspective as a free string (tech debt — see README).
   */
  const perspectives = useMemo<PerspectiveTab[]>(() => {
    if (bscPerspectives.length > 0) {
      return [...bscPerspectives]
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
        .map((p) => ({
          key: p.name,
          label: p.name,
          description: p.description ?? `Perspectiva BSC: ${p.name}`,
        }));
    }
    return DOFA_PERSPECTIVE_TABS.map((t) => ({
      key: t.perspective,
      label: t.label,
      description: t.helper,
    }));
  }, [bscPerspectives]);

  // Set default active perspective
  useEffect(() => {
    if (!activePerspective && perspectives.length > 0) {
      setActivePerspective(perspectives[0].key);
    }
  }, [perspectives, activePerspective]);

  // Active items (filter deactivated)
  const allItems = useMemo(
    () => (analysisQuery.data?.items ?? []).filter((i) => i.isActive),
    [analysisQuery.data],
  );

  // Group by perspective × category
  const grouped = useMemo<GroupedItems>(() => {
    const map: GroupedItems = {};
    for (const p of perspectives) {
      map[p.key] = { Fortaleza: [], Debilidad: [], Oportunidad: [], Amenaza: [] };
    }
    for (const item of allItems) {
      if (!map[item.perspective]) {
        map[item.perspective] = { Fortaleza: [], Debilidad: [], Oportunidad: [], Amenaza: [] };
      }
      const cat = item.category as DofaCategory;
      if (map[item.perspective][cat]) map[item.perspective][cat].push(item);
    }
    return map;
  }, [perspectives, allItems]);

  const countFor = (key: string) =>
    QUADRANTS.reduce((acc, q) => acc + (grouped[key]?.[q.category]?.length ?? 0), 0);

  // Handlers
  const handleAdd = async (perspKey: string, category: DofaCategory, text: string) => {
    const existing = grouped[perspKey]?.[category] ?? [];
    const maxOrder = existing.reduce((acc, it) => Math.max(acc, it.order ?? 0), 0);
    await createItemMutation.mutateAsync({
      analysisId,
      payload: {
        perspective: perspKey,
        category,
        description: text,
        priority: "Media",
        impactLevel: "Medio",
        order: maxOrder + 1,
        responsibleId: null,
      },
    });
  };

  const handleUpdate = async (item: DofaItemDto, text: string) => {
    await updateItemMutation.mutateAsync({
      analysisId,
      itemId: item.id,
      payload: {
        perspective: item.perspective,
        category: item.category,
        description: text,
        priority: item.priority ?? "Media",
        impactLevel: item.impactLevel ?? "Medio",
        order: item.order ?? 0,
        responsibleId: item.responsibleId ?? null,
        isActive: true,
      },
    });
  };

  const handleDelete = async (item: DofaItemDto) => {
    await deactivateItemMutation.mutateAsync({ analysisId, itemId: item.id });
  };

  if (analysisQuery.isLoading) {
    return (
      <div className="flex h-64 items-center justify-center text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin mr-2" /> Cargando diagnóstico...
      </div>
    );
  }

  if (perspectives.length === 0) {
    return (
      <div className="p-12 text-center">
        <AlertTriangle className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
        <p className="text-sm text-muted-foreground">
          Este análisis aún no tiene perspectivas configuradas.
        </p>
      </div>
    );
  }

  const activeP = perspectives.find((p) => p.key === activePerspective);

  return (
    <div className="flex flex-col md:flex-row gap-4 p-3 sm:p-4">
      {/* ── Left sidebar: perspectives list ── */}
      {view !== "matrix" && (
        <aside className="w-full md:w-[240px] md:shrink-0 md:self-start border rounded-lg bg-card flex flex-col overflow-hidden">
          <div className="px-4 py-3 border-b flex items-center justify-between gap-2">
            <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Perspectivas BSC
            </h3>
            {!readOnly && (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-muted-foreground hover:text-foreground"
                onClick={() => setManagerOpen(true)}
                title="Gestionar perspectivas"
              >
                <Settings2 className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>

          <div className="flex-1 overflow-auto p-2 space-y-1 max-h-[40vh] md:max-h-none">
            {perspectives.map((p) => {
              const count = countFor(p.key);
              const isActive = view === "perspective" && p.key === activePerspective;
              const badgeClass =
                count === 0
                  ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
                  : count >= 4
                    ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                    : "bg-muted text-muted-foreground";

              return (
                <button
                  key={p.key}
                  onClick={() => {
                    setActivePerspective(p.key);
                    setView("perspective");
                  }}
                  type="button"
                  className={cn(
                    "w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm text-left transition-colors border-l-[3px]",
                    isActive
                      ? "bg-primary/10 border-l-primary text-foreground font-medium"
                      : "border-l-transparent hover:bg-muted/60 text-foreground",
                  )}
                >
                  <span className="flex-1 truncate">{p.label}</span>
                  <span
                    className={cn(
                      "inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full tabular-nums shrink-0",
                      badgeClass,
                    )}
                  >
                    {count === 0 && <AlertTriangle className="h-2.5 w-2.5" />}
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="p-2 border-t">
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => setView("matrix")}
            >
              <LayoutGrid className="h-4 w-4 mr-1.5" />
              Ver Matriz
            </Button>
          </div>
        </aside>
      )}

      {/* ── Right panel: perspective detail or matrix ── */}
      <main className="flex-1 min-w-0 overflow-auto">
        {view === "perspective" && activeP ? (
          <div className="p-4 sm:p-6 space-y-4">
            {/* Perspective header */}
            <header className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary shrink-0 text-lg font-bold">
                {activeP.label.charAt(0)}
              </div>
              <div className="min-w-0">
                <h2 className="text-lg font-bold text-foreground">
                  Perspectiva {activeP.label}
                </h2>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {activeP.description}
                </p>
              </div>
            </header>

            {/* 2×2 quadrant grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {QUADRANTS.map((q) => {
                const list = grouped[activeP.key]?.[q.category] ?? [];
                return (
                  <section
                    key={q.category}
                    className={cn(
                      "rounded-lg border overflow-hidden shadow-sm",
                      q.borderClass,
                      "bg-card",
                    )}
                  >
                    <header
                      className={cn(
                        "flex items-center gap-2 px-3 py-2 border-b bg-muted/30",
                        q.borderClass,
                      )}
                    >
                      <span className={cn("h-2 w-2 rounded-full", q.fillClass)} />
                      <h3
                        className={cn(
                          "text-xs font-bold uppercase tracking-wide",
                          q.textClass,
                        )}
                      >
                        {q.label}
                      </h3>
                      <Badge
                        variant="outline"
                        className={cn(
                          "ml-auto text-[10px] font-bold border bg-background",
                          q.textClass,
                          q.borderClass,
                        )}
                      >
                        {list.length}
                      </Badge>
                    </header>

                    <div className="p-2.5 space-y-1.5">
                      {list.length === 0 && !readOnly && (
                        <p className="text-xs text-muted-foreground italic px-2 py-1">
                          Sin factores aún. Agrega el primero.
                        </p>
                      )}
                      {list.map((item) => (
                        <ItemCard
                          key={item.id}
                          item={item}
                          onSave={(t) => handleUpdate(item, t)}
                          onDelete={() => setConfirmDelete(item)}
                          readOnly={readOnly}
                        />
                      ))}
                      {!readOnly && (
                        <AddFactorInput
                          category={q.category}
                          onAdd={(t) => handleAdd(activeP.key, q.category, t)}
                        />
                      )}
                    </div>
                  </section>
                );
              })}
            </div>
          </div>
        ) : (
          // Matrix view
          <div className="p-4 sm:p-6">
            <header className="mb-4 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
              <div className="flex items-start gap-3 min-w-0">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setView("perspective")}
                  className="shrink-0 -ml-2"
                >
                  <ArrowLeft className="h-4 w-4 mr-1.5" />
                  Volver
                </Button>
                <div className="min-w-0">
                  <h2 className="text-lg font-bold text-foreground">
                    Matriz DOFA Consolidada
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Vista cruzada de todas las perspectivas y tipos de factores
                    <span className="ml-2 text-xs font-medium tabular-nums">
                      · {allItems.length} factores
                    </span>
                  </p>
                </div>
              </div>
            </header>

            {isMobile ? (
              <MatrixMobileCards
                perspectives={perspectives}
                grouped={grouped}
                onAdd={handleAdd}
                onUpdate={handleUpdate}
                onDelete={(item) => setConfirmDelete(item)}
                readOnly={readOnly}
              />
            ) : (
              <MatrixTable
                perspectives={perspectives}
                grouped={grouped}
                onAdd={handleAdd}
                onUpdate={handleUpdate}
                onDelete={(item) => setConfirmDelete(item)}
                readOnly={readOnly}
              />
            )}
          </div>
        )}
      </main>

      {/* Delete confirmation */}
      <AlertDialog
        open={!!confirmDelete}
        onOpenChange={(o) => {
          if (!o) setConfirmDelete(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar factor</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Está seguro de eliminar este factor del diagnóstico? Esta acción no se
              puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (confirmDelete) {
                  await handleDelete(confirmDelete);
                  setConfirmDelete(null);
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Perspective manager dialog */}
      {managerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-background rounded-lg border shadow-lg w-full max-w-2xl max-h-[80vh] overflow-auto p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold">Gestionar perspectivas BSC</h2>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => setManagerOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <PerspectiveManager />
            <div className="flex justify-end pt-2">
              <Button size="sm" onClick={() => setManagerOpen(false)}>
                <Check className="h-4 w-4 mr-1" />
                Listo
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
