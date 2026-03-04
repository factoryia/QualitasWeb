import { cn } from "@/lib/utils";

// Definimos los estilos para cada estado que viene de la base de datos (o el mock)
const statusConfig: Record<string, { label: string; className: string }> = {
  activo: { 
    label: "Activo", 
    className: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200" 
  },
  inactivo: { 
    label: "Inactivo", 
    className: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 border-gray-200" 
  },
  en_revision: { 
    label: "En revisión", 
    className: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200" 
  },
};

interface ProcessStatusBadgeProps {
  status: string;
}

export function ProcessStatusBadge({ status }: ProcessStatusBadgeProps) {
  // Buscamos la configuración basada en el string 'status' (ej: 'activo')
  // Si no existe, usamos 'activo' por defecto
  const config = statusConfig[status] ?? statusConfig.activo;

  return (
    <span 
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold transition-colors",
        config.className
      )}
    >
      {config.label}
    </span>
  );
}