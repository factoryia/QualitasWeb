"use client";

import { useDeferredValue, useMemo, useState } from "react";
import { useQueries } from "@tanstack/react-query";
import { Copy, ExternalLink, FileText, Link2, Loader2, Plus, Trash2 } from "lucide-react";
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
import { Switch } from "@/components/ui/switch";
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
import { documentsApi } from "@/feature/process/api/documents-control";
import {
  useCreateProcessDocument,
  useDeleteProcessDocument,
  useDocumentsCatalog,
  useProcessDocumentRoles,
  useProcessDocuments,
  useUpdateProcessDocument,
} from "@/feature/process/hooks/use-processes";
import type { DocumentDto, ProcessDocumentDto } from "@/feature/process/types";
import {
  documentLocationForCopy,
  isAbsoluteHttpUrl,
  resolveDocumentBrowseHref,
} from "@/lib/document-links";

type ProcessDocumentsTabProps = {
  processId: string;
};

export function ProcessDocumentsTab({ processId }: ProcessDocumentsTabProps) {
  const { data: links = [], isLoading: loadingLinks, isError: linksError } = useProcessDocuments(processId);
  const { data: roles = [], isError: rolesError } = useProcessDocumentRoles();
  const [docSearch, setDocSearch] = useState("");
  const deferredSearch = useDeferredValue(docSearch);
  const { data: catalogDocs = [], isFetching: loadingCatalog } = useDocumentsCatalog(deferredSearch);

  const createLink = useCreateProcessDocument(processId);
  const updateLink = useUpdateProcessDocument(processId);
  const deleteLink = useDeleteProcessDocument(processId);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [pickDocumentId, setPickDocumentId] = useState<string>("");
  const [pickRoleId, setPickRoleId] = useState<string>("");
  const [pickMandatory, setPickMandatory] = useState(false);
  const [pickNotes, setPickNotes] = useState("");
  const [removeTarget, setRemoveTarget] = useState<ProcessDocumentDto | null>(null);

  const sortedRoles = useMemo(
    () => [...roles].filter((r) => r.isActive).sort((a, b) => a.order - b.order),
    [roles],
  );

  const missingDocIds = useMemo(() => {
    const fromCatalog = new Set(catalogDocs.map((d) => d.id));
    const ids = [...new Set(links.map((l) => l.documentId))];
    return ids.filter((id) => !fromCatalog.has(id));
  }, [links, catalogDocs]);

  const detailQueries = useQueries({
    queries: missingDocIds.map((id) => ({
      queryKey: ["documents", "byId", id] as const,
      queryFn: () => documentsApi.getById(id),
      enabled: !!id,
      staleTime: 300_000,
    })),
  });

  const docById = useMemo(() => {
    const m = new Map<string, DocumentDto>();
    catalogDocs.forEach((d) => m.set(d.id, d));
    detailQueries.forEach((q, i) => {
      const id = missingDocIds[i];
      if (q.data && id) m.set(id, q.data);
    });
    return m;
  }, [catalogDocs, detailQueries, missingDocIds]);

  const openAdd = () => {
    setPickDocumentId("");
    setPickRoleId(sortedRoles[0]?.id ?? "");
    setPickMandatory(false);
    setPickNotes("");
    setDocSearch("");
    setDialogOpen(true);
  };

  const submitAdd = () => {
    if (!pickDocumentId || !pickRoleId) return;
    createLink.mutate(
      {
        processId,
        documentId: pickDocumentId,
        processDocumentRoleId: pickRoleId,
        isMandatory: pickMandatory,
        notes: pickNotes.trim() || null,
      },
      {
        onSuccess: () => {
          setDialogOpen(false);
        },
      },
    );
  };

  const permissionOrConfigError = linksError || rolesError;

  return (
    <Card>
      <CardHeader>
        <div className="min-w-0 space-y-1.5">
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="h-4 w-4 shrink-0" />
            Documentación del proceso
          </CardTitle>
          <CardDescription>Documentos del SGD vinculados a este proceso.</CardDescription>
        </div>
        <CardAction>
          <Button size="sm" onClick={openAdd} disabled={permissionOrConfigError || sortedRoles.length === 0}>
            <Plus className="h-4 w-4 mr-1" /> Vincular documento
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="space-y-4">
        {permissionOrConfigError ? (
          <p className="text-sm text-destructive">
            No se pudieron cargar los vínculos o el catálogo de roles. Comprueba permisos (documentos del
            proceso y catálogo) o vuelve a intentar.
          </p>
        ) : null}

        {sortedRoles.length === 0 && !rolesError ? (
          <p className="text-sm text-muted-foreground">
            No hay roles de documento configurados en el sistema. Solicita que se carguen en{" "}
            <span className="font-medium">process-document-roles</span>.
          </p>
        ) : null}

        {loadingLinks ? (
          <div className="flex justify-center py-12 text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : links.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed py-12 text-center text-sm text-muted-foreground">
            <Link2 className="h-8 w-8 opacity-50" />
            <p>Aún no hay documentos vinculados.</p>
            <Button variant="outline" size="sm" onClick={openAdd} disabled={sortedRoles.length === 0}>
              Vincular el primero
            </Button>
          </div>
        ) : (
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Documento</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead className="w-[100px]">Oblig.</TableHead>
                  <TableHead className="min-w-[160px]">Versión / acceso</TableHead>
                  <TableHead className="w-[56px]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {links.map((row) => {
                  const doc = docById.get(row.documentId);
                  const role = roles.find((r) => r.id === row.processDocumentRoleId);
                  const ver = doc?.currentVersion;
                  const verLabel = ver
                    ? `v${ver.versionNumber}${ver.documentStatusCode ? ` · ${ver.documentStatusCode}` : ""}`
                    : null;
                  const browseHref = resolveDocumentBrowseHref(doc);
                  const copyText = documentLocationForCopy(doc);
                  const rawLocation =
                    (ver?.storageUrl?.trim() || doc?.storagePath?.trim() || "").trim() || null;
                  const showRawSnippet =
                    !!rawLocation && !(browseHref && rawLocation === browseHref);
                  return (
                    <TableRow key={row.id}>
                      <TableCell>
                        <div className="font-medium">{doc?.code ?? row.documentId.slice(0, 8) + "…"}</div>
                        <div className="text-xs text-muted-foreground line-clamp-2">
                          {doc?.title ?? "Sin título en catálogo"}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{role?.name ?? "—"}</TableCell>
                      <TableCell>
                        <Switch
                          checked={row.isMandatory}
                          disabled={updateLink.isPending}
                          onCheckedChange={(v) =>
                            updateLink.mutate({
                              id: row.id,
                              payload: {
                                isMandatory: v,
                                sequence: row.sequence,
                                notes: row.notes,
                              },
                            })
                          }
                          aria-label="Documento obligatorio para el proceso"
                        />
                      </TableCell>
                      <TableCell className="text-sm align-top">
                        {!ver ? (
                          <span className="text-muted-foreground">—</span>
                        ) : (
                          <div className="flex flex-col gap-1.5 min-w-0 max-w-[min(100%,280px)]">
                            <span className="text-xs text-muted-foreground tabular-nums">{verLabel}</span>
                            {browseHref ? (
                              <a
                                href={browseHref}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline w-fit break-all"
                                title={browseHref}
                              >
                                <ExternalLink className="h-3 w-3 shrink-0" /> Ver documento
                              </a>
                            ) : null}
                            {showRawSnippet ? (
                              <code
                                className="text-[10px] leading-snug text-muted-foreground break-all block rounded bg-muted/50 px-1.5 py-1"
                                title={rawLocation}
                              >
                                {rawLocation}
                              </code>
                            ) : null}
                            {copyText ? (
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="h-7 w-fit text-xs gap-1"
                                onClick={async () => {
                                  try {
                                    await navigator.clipboard.writeText(copyText);
                                    toast.success(
                                      isAbsoluteHttpUrl(copyText)
                                        ? "URL copiada al portapapeles"
                                        : "Ruta copiada al portapapeles",
                                    );
                                  } catch {
                                    toast.error("No se pudo copiar");
                                  }
                                }}
                              >
                                <Copy className="h-3 w-3" /> Copiar ubicación
                              </Button>
                            ) : !browseHref ? (
                              <span className="text-xs text-muted-foreground">—</span>
                            ) : null}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          onClick={() => setRemoveTarget(row)}
                          aria-label="Quitar vínculo"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Vincular documento del SGD</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="doc-search">Buscar en catálogo</Label>
                <Input
                  id="doc-search"
                  value={docSearch}
                  onChange={(e) => setDocSearch(e.target.value)}
                  placeholder="Código o título…"
                />
                {loadingCatalog ? (
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Loader2 className="h-3 w-3 animate-spin" /> Cargando…
                  </p>
                ) : null}
              </div>
              <div className="space-y-2">
                <Label>Documento</Label>
                <Select value={pickDocumentId} onValueChange={setPickDocumentId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un documento" />
                  </SelectTrigger>
                  <SelectContent className="max-h-72">
                    {catalogDocs.map((d) => (
                      <SelectItem key={d.id} value={d.id}>
                        <span className="font-mono text-xs">{d.code}</span> — {d.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Rol respecto al proceso</Label>
                <Select value={pickRoleId} onValueChange={setPickRoleId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Rol" />
                  </SelectTrigger>
                  <SelectContent>
                    {sortedRoles.map((r) => (
                      <SelectItem key={r.id} value={r.id}>
                        {r.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <Switch id="mand" checked={pickMandatory} onCheckedChange={setPickMandatory} />
                <Label htmlFor="mand" className="font-normal cursor-pointer">
                  Obligatorio para el proceso
                </Label>
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notas (opcional)</Label>
                <Textarea id="notes" value={pickNotes} onChange={(e) => setPickNotes(e.target.value)} rows={2} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancelar
              </Button>
              <Button
                onClick={submitAdd}
                disabled={!pickDocumentId || !pickRoleId || createLink.isPending}
              >
                {createLink.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-1 animate-spin" /> Guardando…
                  </>
                ) : (
                  "Vincular"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <AlertDialog open={!!removeTarget} onOpenChange={(o) => !o && setRemoveTarget(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Quitar vínculo con el documento?</AlertDialogTitle>
              <AlertDialogDescription>
                El documento permanece en el SGD; solo se elimina la relación con este proceso.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                onClick={() => {
                  if (removeTarget) deleteLink.mutate(removeTarget.id, { onSuccess: () => setRemoveTarget(null) });
                }}
              >
                Quitar vínculo
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
}
