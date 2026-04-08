import { cn } from "@/lib/utils";

export function classificationPillClass(classification: string | null | undefined) {
  const value = (classification ?? "").toLowerCase();
  const isInternal = value === "interno" || value === "internal";
  const isExternal = value === "externo" || value === "external";
  if (isInternal) {
    return cn(
      "bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/30",
    );
  }
  if (isExternal) {
    return cn(
      "bg-orange-500/15 text-orange-700 dark:text-orange-400 border-orange-500/30",
    );
  }
  return cn("bg-muted text-muted-foreground border-border");
}

export function levelPillClass(level: string | null | undefined) {
  const value = (level ?? "").toLowerCase();
  if (value === "alto" || value === "high") {
    return cn("bg-red-500/15 text-red-700 dark:text-red-400 border-red-500/30");
  }
  if (value === "medio" || value === "medium") {
    return cn(
      "bg-orange-500/15 text-orange-700 dark:text-orange-400 border-orange-500/30",
    );
  }
  if (value === "bajo" || value === "low") {
    return cn(
      "bg-green-500/15 text-green-700 dark:text-green-400 border-green-500/30",
    );
  }
  return cn("bg-muted text-muted-foreground border-border");
}

export function statusPillClass(status: string | null | undefined) {
  const value = (status ?? "").toLowerCase();
  if (value === "activo") {
    return cn(
      "bg-green-500/15 text-green-700 dark:text-green-400 border-green-500/30",
    );
  }
  if (value === "inactivo") {
    return cn("bg-muted text-muted-foreground border-border");
  }
  if (value === "potencial") {
    return cn(
      "bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/30",
    );
  }
  if (value === "archivado") {
    return cn(
      "bg-indigo-500/15 text-indigo-700 dark:text-indigo-400 border-indigo-500/30",
    );
  }
  return cn("bg-muted text-muted-foreground border-border");
}

export function matrixCellStyle(influence: string, interest: string) {
  const i = influence.toLowerCase();
  const j = interest.toLowerCase();

  if (i === "alto" && j === "alto") {
    return {
      label: "COLABORAR",
      container: "bg-red-500/20 border-red-500/40",
      labelText: "text-red-700 dark:text-red-400",
    };
  }
  if (i === "alto" && j === "medio") {
    return {
      label: "MANTENER SATISFECHO",
      container: "bg-green-500/20 border-green-500/40",
      labelText: "text-green-700 dark:text-green-400",
    };
  }
  if (i === "alto" && j === "bajo") {
    return {
      label: "MONITOREAR",
      container: "bg-yellow-500/20 border-yellow-500/40",
      labelText: "text-yellow-700 dark:text-yellow-400",
    };
  }
  if (i === "medio" && j === "alto") {
    return {
      label: "IMPLICAR",
      container: "bg-orange-500/20 border-orange-500/40",
      labelText: "text-orange-700 dark:text-orange-400",
    };
  }
  if (i === "medio" && j === "medio") {
    return {
      label: "MANTENER",
      container: "bg-blue-500/20 border-blue-500/40",
      labelText: "text-blue-700 dark:text-blue-400",
    };
  }
  if (i === "medio" && j === "bajo") {
    return {
      label: "INFORMAR",
      container: "bg-cyan-500/20 border-cyan-500/40",
      labelText: "text-cyan-700 dark:text-cyan-400",
    };
  }
  if (i === "bajo" && j === "alto") {
    return {
      label: "SEGUIMIENTO",
      container: "bg-purple-500/20 border-purple-500/40",
      labelText: "text-purple-700 dark:text-purple-400",
    };
  }
  if (i === "bajo" && j === "medio") {
    return {
      label: "SEGUIMIENTO",
      container: "bg-indigo-500/20 border-indigo-500/40",
      labelText: "text-indigo-700 dark:text-indigo-400",
    };
  }
  return {
    label: "MONITOREAR",
    container: "bg-muted border-border",
    labelText: "text-muted-foreground",
  };
}

