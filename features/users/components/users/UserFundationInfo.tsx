// features/users/components/UserFoundationInfo.tsx
import { useQuery } from "@tanstack/react-query";
import { usersService } from "@/features/users/services/users.service";
// Componente para mostrar el NOMBRE del Cargo
export function PositionName({ id, auth }: { id?: string, auth: any }) {
  const { data, isLoading } = useQuery({
    queryKey: ['foundation', 'position', id],
    queryFn: () => usersService.getPosition(id!, auth),
    enabled: !!id && !!auth,
  });
  if (isLoading) return <span className="animate-pulse text-muted-foreground italic">...</span>;
  return <span>{data?.name || "---"}</span>;
}

// Componente para mostrar el NOMBRE del Área
export function AreaName({ id, auth }: { id?: string, auth: any }) {
  const { data, isLoading } = useQuery({
    queryKey: ['foundation', 'area', id],
    queryFn: () => usersService.getArea(id!, auth),
    enabled: !!id && !!auth,
  });
  if (isLoading) return <span className="animate-pulse text-muted-foreground italic">...</span>;
  return <span>{data?.name || "---"}</span>;
}