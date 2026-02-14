"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/features/auth/store/auth.store";

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const { isAuthenticated, accessToken } = useAuthStore();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    // Check for auth errors from axios interceptor
    const authError = sessionStorage.getItem('auth-error');
    if (authError) {
      sessionStorage.removeItem('auth-error');
      console.warn('[AUTH] Auth error detected from interceptor');
    }

    // Si no está autenticado, redirigir al login
    if (!isAuthenticated || !accessToken) {
      router.push("/login");
    }
  }, [isMounted, isAuthenticated, accessToken, router]);

  // Mostrar contenido vacío mientras se monta el componente (hydration)
  if (!isMounted) {
    return <div className="min-h-screen bg-slate-100" />;
  }

  // Si no está autenticado (y ya terminó de chequear), retornar null (el useEffect ya redirigió)
  if (!isAuthenticated) {
    return <div className="min-h-screen bg-slate-100" />;
  }

  return <>{children}</>;
}
