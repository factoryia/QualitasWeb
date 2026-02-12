"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { Loader2 } from "lucide-react";

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const { isAuthenticated, accessToken } = useAuthStore();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Si no está autenticado, redirigir al login
    if (!isAuthenticated || !accessToken) {
      router.push("/login");
    }
    setIsChecking(false);
  }, [isAuthenticated, accessToken, router]);

  // Mostrar loader mientras se verifica el estado (para evitar parpadeos)
  

  // Si no está autenticado (y ya terminó de chequear), retornar null (el useEffect ya redirigió)
  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
