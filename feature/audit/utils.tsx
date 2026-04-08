import { Badge } from "@/components/ui/badge";

export const getSeverityBadge = (severity: any) => {
  const sevStr = String(severity);
  switch (sevStr) {
    case "Information":
    case "3":
      return <Badge variant="outline" className="border-blue-200 text-blue-700 bg-blue-50">Info</Badge>;
    case "Warning":
    case "4":
      return <Badge variant="outline" className="border-amber-200 text-amber-700 bg-amber-50">Warning</Badge>;
    case "Error":
    case "5":
      return <Badge variant="outline" className="border-red-200 text-red-700 bg-red-50">Error</Badge>;
    case "Critical":
    case "6":
      return <Badge variant="destructive">Crítico</Badge>;
    default:
      return <Badge variant="outline" className="text-slate-500">Nivel {sevStr}</Badge>;
  }
};

export const getEventTypeLabel = (type: any) => {
  const typeStr = String(type);
  switch (typeStr) {
    case "EntityChange":
    case "1":
      return "Cambio Entidad";
    case "Security":
    case "2":
      return "Seguridad";
    case "Activity":
    case "3":
      return "Actividad";
    case "Exception":
    case "4":
      return "Excepción";
    default:
      return typeStr;
  }
};
