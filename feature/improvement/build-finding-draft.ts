/**
 * Borrador estructurado (Criterio → Evidencia → Hallazgo) a partir del contexto del proceso.
 * No llama a servicios externos.
 */
export function buildFindingDraft(
  processName: string,
  processObjective: string | null | undefined,
  processScope: string | null | undefined,
  userHint?: string | null,
): string {
  const name = (processName || "el proceso").trim();
  const obj = (processObjective ?? "").trim();
  const scope = (processScope ?? "").trim();
  const hint = (userHint ?? "").trim();

  const evidenceParts: string[] = [];
  if (obj) evidenceParts.push(`Objetivo declarado: ${obj.slice(0, 280)}${obj.length > 280 ? "…" : ""}`);
  if (scope) evidenceParts.push(`Alcance declarado: ${scope.slice(0, 280)}${scope.length > 280 ? "…" : ""}`);
  if (hint) evidenceParts.push(`Observación registrada: ${hint.slice(0, 400)}${hint.length > 400 ? "…" : ""}`);
  if (evidenceParts.length === 0) {
    evidenceParts.push(
      "La información de objetivo y alcance del proceso aún no permite contrastar evidencia documental detallada.",
    );
  }

  return [
    "**Criterio:** ISO 9001:2015 — cláusulas 4.4 y 6.2 (procesos y planificación para alcanzar resultados).",
    "",
    `**Evidencia:** ${evidenceParts.join(" ")}`,
    "",
    `**Hallazgo:** (Borrador para revisar) Se sugiere verificar la coherencia entre objetivo, alcance y despliegue operativo del proceso «${name}».`,
  ].join("\n");
}

/** Extrae un título corto para la acción a partir del borrador en Markdown. */
export function titleFromFindingDraft(draft: string, fallback: string): string {
  const lines = draft.split(/\r?\n/);
  for (const line of lines) {
    const m = line.match(/^\*\*Hallazgo:\*\*\s*(.+)$/i);
    if (m?.[1]) {
      const t = m[1].replace(/^\(Borrador[^)]*\)\s*/i, "").trim();
      if (t) return t.slice(0, 500);
    }
  }
  const first = lines.map((l) => l.trim()).find((l) => l.length > 0);
  if (first) return first.replace(/\*\*/g, "").slice(0, 500);
  return fallback.slice(0, 500);
}
