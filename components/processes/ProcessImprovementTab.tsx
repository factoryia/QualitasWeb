"use client";

import { useMemo, useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Copy, Loader2, PenLine, Plus, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
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
import type { ProcessDto } from "@/feature/process/types";
import { buildFindingDraft, titleFromFindingDraft } from "@/feature/improvement/build-finding-draft";
import {
  useActionDetail,
  useCreateImprovementAction,
  useDeleteImprovementAction,
  useImprovementActions,
} from "@/feature/actions/hooks/use-process-improvement-actions";
import { cn } from "@/lib/utils";

function priorityLabel(p: string) {
  const u = p.toLowerCase();
  if (u === "low") return "Baja";
  if (u === "medium") return "Media";
  if (u === "high") return "Alta";
  if (u === "critical") return "Crítica";
  if (u === "urgent") return "Urgente";
  return p;
}

function statusLabel(s: string) {
  const u = s.toLowerCase();
  const map: Record<string, string> = {
    planned: "Planificada",
    approved: "Aprobada",
    inprogress: "En curso",
    completed: "Completada",
    verified: "Verificada",
    closed: "Cerrada",
    onhold: "En pausa",
    rejected: "Rechazada",
  };
  return map[u] ?? s;
}

type Props = {
  process: ProcessDto;
};

export function ProcessImprovementTab({ process }: Props) {
  const { data: rows = [], isLoading, isError } = useImprovementActions(process.id);
  const createAct = useCreateImprovementAction(process.id, process.code);
  const deleteAct = useDeleteImprovementAction(process.id);

  const [draftOpen, setDraftOpen] = useState(false);
  const [draftHint, setDraftHint] = useState("");
  const [draftText, setDraftText] = useState("");

  const [registerOpen, setRegisterOpen] = useState(false);
  const [regTitle, setRegTitle] = useState("");
  const [regDesc, setRegDesc] = useState("");
  const [regCategory, setRegCategory] = useState<"Improvement" | "Corrective">("Improvement");
  const [regPriority, setRegPriority] = useState<"Low" | "Medium" | "High">("Medium");

  const [detailId, setDetailId] = useState<string | null>(null);
  const { data: detail, isFetching: detailLoading } = useActionDetail(detailId ?? undefined, !!detailId);

  const [deleteId, setDeleteId] = useState<string | null>(null);

  const countLabel = useMemo(() => {
    const n = rows.length;
    return `${n} registrado${n === 1 ? "" : "s"} para este proceso`;
  }, [rows.length]);

  const openRegister = () => {
    setRegTitle("");
    setRegDesc("");
    setRegCategory("Improvement");
    setRegPriority("Medium");
    setRegisterOpen(true);
  };

  const openDraft = () => {
    setDraftHint("");
    setDraftText("");
    setDraftOpen(true);
  };

  const generateDraft = () => {
    setDraftText(
      buildFindingDraft(process.name, process.processObjective, process.processScope, draftHint || null),
    );
  };

  const submitRegister = () => {
    const t = regTitle.trim();
    if (!t) return;
    createAct.mutate(
      { title: t, description: regDesc.trim() || null, category: regCategory, priority: regPriority },
      { onSuccess: () => setRegisterOpen(false) },
    );
  };

  const submitFromDraft = () => {
    const body = draftText.trim();
    if (!body) {
      toast.error("Genera o escribe un borrador primero");
      return;
    }
    const title = titleFromFindingDraft(body, `Hallazgo — ${process.name}`);
    createAct.mutate(
      { title, description: body, category: "Improvement", priority: "Medium" },
      {
        onSuccess: () => {
          setDraftOpen(false);
          setDraftText("");
          setDraftHint("");
        },
      },
    );
  };

  const copyDraft = async () => {
    if (!draftText.trim()) return;
    try {
      await navigator.clipboard.writeText(draftText);
      toast.success("Copiado al portapapeles");
    } catch {
      toast.error("No se pudo copiar");
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="min-w-0 space-y-1.5">
          <CardTitle className="text-base">Hallazgos de mejora continua</CardTitle>
          <CardDescription>{countLabel}</CardDescription>
        </div>
        <CardAction className="flex flex-wrap gap-2 justify-end">
          <Button variant="outline" size="sm" onClick={openDraft}>
            <PenLine className="h-3.5 w-3.5 mr-1" /> Redactar borrador
          </Button>
          <Button size="sm" onClick={openRegister}>
            <Plus className="h-3.5 w-3.5 mr-1" /> Registrar hallazgo
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="space-y-4">
        {isError ? (
          <p className="text-sm text-destructive">
            No se pudieron cargar los datos. Comprueba permisos de acceso o inténtalo de nuevo.
          </p>
        ) : null}

        {isLoading ? (
          <div className="flex justify-center py-12 text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : rows.length === 0 ? (
          <div className="rounded-lg border border-dashed py-12 text-center text-sm text-muted-foreground px-4">
            No hay hallazgos de mejora continua registrados para este proceso.
          </div>
        ) : (
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead>Prioridad</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Fecha</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r) => (
                  <TableRow
                    key={r.id}
                    className="cursor-pointer"
                    onClick={() => setDetailId(r.id)}
                  >
                    <TableCell className="font-mono text-xs">{r.code}</TableCell>
                    <TableCell className="max-w-[min(100vw,320px)]">
                      <span className="line-clamp-2 font-medium text-sm">{r.title}</span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[10px] font-normal">
                        {priorityLabel(r.priority)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="text-[10px] font-normal">
                        {statusLabel(r.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                      {format(new Date(r.createdOnUtc), "dd/MM/yyyy", { locale: es })}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        <Dialog open={draftOpen} onOpenChange={setDraftOpen}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Redactar borrador</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 py-1">
              <p className="text-sm text-muted-foreground">
                Se genera un texto en formato Criterio → Evidencia → Hallazgo usando el contexto del proceso.
              </p>
              <div className="space-y-2">
                <Label htmlFor="draft-hint">Indicaciones adicionales (opcional)</Label>
                <Textarea
                  id="draft-hint"
                  rows={2}
                  value={draftHint}
                  onChange={(e) => setDraftHint(e.target.value)}
                  placeholder="Contexto u observación breve…"
                />
              </div>
              <Button type="button" variant="secondary" size="sm" onClick={generateDraft}>
                Generar
              </Button>
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <Label htmlFor="draft-body">Borrador</Label>
                  {draftText.trim() ? (
                    <Button type="button" variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={copyDraft}>
                      <Copy className="h-3 w-3" /> Copiar
                    </Button>
                  ) : null}
                </div>
                <Textarea
                  id="draft-body"
                  rows={10}
                  value={draftText}
                  onChange={(e) => setDraftText(e.target.value)}
                  placeholder="Pulsa «Generar» o escribe aquí…"
                  className="font-mono text-xs leading-relaxed"
                />
              </div>
            </div>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button variant="outline" onClick={() => setDraftOpen(false)}>
                Cerrar
              </Button>
              <Button onClick={() => void submitFromDraft()} disabled={createAct.isPending || !draftText.trim()}>
                {createAct.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Registrar en el proceso"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={registerOpen} onOpenChange={setRegisterOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Registrar hallazgo</DialogTitle>
            </DialogHeader>
            <div className="grid gap-3 py-2">
              <div className="grid gap-2">
                <Label htmlFor="reg-title">Título</Label>
                <Input
                  id="reg-title"
                  value={regTitle}
                  onChange={(e) => setRegTitle(e.target.value)}
                  placeholder="Resumen breve"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="reg-desc">Detalle</Label>
                <Textarea
                  id="reg-desc"
                  rows={5}
                  value={regDesc}
                  onChange={(e) => setRegDesc(e.target.value)}
                  placeholder="Criterio, evidencia y hallazgo (libre o pegado desde un borrador)…"
                />
              </div>
              <div className="grid gap-2 sm:grid-cols-2 sm:gap-3">
                <div className="grid gap-2">
                  <Label>Clasificación</Label>
                  <Select
                    value={regCategory}
                    onValueChange={(v) => setRegCategory(v as "Improvement" | "Corrective")}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Improvement">Oportunidad de mejora</SelectItem>
                      <SelectItem value="Corrective">Correctiva / no conformidad</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Prioridad</Label>
                  <Select
                    value={regPriority}
                    onValueChange={(v) => setRegPriority(v as "Low" | "Medium" | "High")}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Low">Baja</SelectItem>
                      <SelectItem value="Medium">Media</SelectItem>
                      <SelectItem value="High">Alta</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setRegisterOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={submitRegister} disabled={!regTitle.trim() || createAct.isPending}>
                {createAct.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Guardar"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={!!detailId} onOpenChange={(o) => !o && setDetailId(null)}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{detail?.code ?? "Hallazgo"}</DialogTitle>
            </DialogHeader>
            {detailLoading && !detail ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : detail ? (
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground">Título</p>
                  <p className="font-medium">{detail.title}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">{priorityLabel(detail.priority)}</Badge>
                  <Badge variant="secondary">{statusLabel(detail.status)}</Badge>
                  <Badge variant="outline" className="font-normal">
                    {detail.category === "Improvement" ? "Oportunidad" : detail.category === "Corrective" ? "Correctiva" : detail.category}
                  </Badge>
                </div>
                {detail.description ? (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Detalle</p>
                    <pre className="whitespace-pre-wrap rounded-md bg-muted/50 p-3 text-xs leading-relaxed font-sans">
                      {detail.description}
                    </pre>
                  </div>
                ) : null}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No se pudo cargar el detalle.</p>
            )}
            <DialogFooter className="flex-col-reverse gap-2 sm:flex-row sm:justify-between sm:items-center">
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="sm:mr-auto"
                disabled={!detailId || deleteAct.isPending}
                onClick={() => detailId && setDeleteId(detailId)}
              >
                <Trash2 className="h-4 w-4 mr-1" /> Eliminar
              </Button>
              <Button variant="outline" onClick={() => setDetailId(null)}>
                Cerrar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Eliminar este registro?</AlertDialogTitle>
              <AlertDialogDescription>
                Se eliminará el hallazgo vinculado a este proceso. Esta acción no se puede deshacer.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                className={cn("bg-destructive text-destructive-foreground hover:bg-destructive/90")}
                onClick={() => {
                  if (!deleteId) return;
                  const rid = deleteId;
                  deleteAct.mutate(rid, {
                    onSuccess: () => {
                      setDeleteId(null);
                      setDetailId((cur) => (cur === rid ? null : cur));
                    },
                  });
                }}
              >
                Eliminar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
}
