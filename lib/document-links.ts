import type { DocumentDto } from "@/feature/process/types";

function trim(s: string | null | undefined) {
  return (s ?? "").trim();
}

/** URL absoluta típica (http/https). */
export function isAbsoluteHttpUrl(s: string): boolean {
  return /^https?:\/\//i.test(s);
}

/**
 * Resuelve un enlace para abrir el fichero o recurso del documento.
 * - Usa `currentVersion.storageUrl` o `document.storagePath` si ya son http(s).
 * - Si son rutas relativas, opcionalmente antepone `NEXT_PUBLIC_DOCUMENT_FILES_BASE_URL` (sin slash final).
 */
export function resolveDocumentBrowseHref(doc: DocumentDto | undefined): string | null {
  if (!doc) return null;
  const fromVersion = trim(doc.currentVersion?.storageUrl);
  const fromDoc = trim(doc.storagePath);
  const candidate = fromVersion || fromDoc;
  if (!candidate) return null;
  if (isAbsoluteHttpUrl(candidate)) return candidate;

  const base =
    typeof process !== "undefined"
      ? process.env.NEXT_PUBLIC_DOCUMENT_FILES_BASE_URL?.replace(/\/$/, "")
      : undefined;
  if (!base) return null;

  const path = candidate.replace(/^\/+/, "");
  return `${base}/${path}`;
}

/** Texto útil para portapapeles: URL resuelta o, si no hay, la ruta/URL tal cual en metadatos. */
export function documentLocationForCopy(doc: DocumentDto | undefined): string {
  if (!doc) return "";
  const href = resolveDocumentBrowseHref(doc);
  if (href) return href;
  return trim(doc.currentVersion?.storageUrl) || trim(doc.storagePath);
}
