"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Search, Bell } from "lucide-react";
import { AuthGuard } from "@/feature/auth/components/shared/auth-guard";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CommandPalette } from "@/components/shared/command-palette";
import { AppSidebar } from "@/components/shared/app-sidebar";

const queryClient = new QueryClient();

function getBreadcrumbs(pathname: string): { label: string; href?: string }[] {
  const crumbs: { label: string; href?: string }[] = [{ label: "Inicio", href: "/" }];

  if (pathname === "/") return [{ label: "Inicio", href: "/" }, { label: "Dashboard" }];

  if (pathname.startsWith("/usuarios")) {
    crumbs.push({ label: "Administración" });
    crumbs.push({ label: "Usuarios" });
  } else if (pathname.startsWith("/organizacion")) {
    crumbs.push({ label: "Administración" });
    crumbs.push({ label: "Organización" });
  } else if (pathname.startsWith("/procesos")) {
    crumbs.push({ label: "Control" });
    crumbs.push({ label: "Procesos" });
  } else if (pathname.startsWith("/planificacion/analisis-dofa")) {
    crumbs.push({ label: "Control" });
    crumbs.push({ label: "Análisis DOFA" });
  } else if (pathname.startsWith("/planificacion/partes-interesadas")) {
    crumbs.push({ label: "Control" });
    crumbs.push({ label: "Partes Interesadas" });
  }
    else if (pathname.startsWith("/normatividad")) {
    crumbs.push({ label: "Normatividad" });
    if (pathname.includes("/marcos")) {
      crumbs.push({ label: "Marcos Normativos" });
    } else if (pathname.includes("/mipg")) {
      crumbs.push({ label: "MIPG" });
    } else if (pathname.includes("/cumplimiento")) {
      crumbs.push({ label: "Cumplimiento" });
    }
  } else if (pathname.startsWith("/auditoria")) {
    crumbs.push({ label: "Control" });
    crumbs.push({ label: "Auditoría" });
  } else if (pathname.startsWith("/perfil")) {
    crumbs.push({ label: "Mi Perfil" });
  } else if (pathname.startsWith("/configuracion")) {
    crumbs.push({ label: "Configuración" });
  } else {
    const segment = pathname.split("/").filter(Boolean)[0];
    crumbs.push({
      label: segment ? segment.charAt(0).toUpperCase() + segment.slice(1) : "Página",
    });
  }

  return crumbs;
}

function DashboardHeaderContent() {
  const pathname = usePathname();
  const [cmdOpen, setCmdOpen] = useState(false);
  const crumbs = getBreadcrumbs(pathname);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setCmdOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 px-4">
        <SidebarTrigger className="-ml-1" />
        
        <Breadcrumb>
          <BreadcrumbList>
            {crumbs.map((c, i) => (
              <React.Fragment key={i}>
                {i > 0 && <BreadcrumbSeparator className="hidden sm:block" />}
                <BreadcrumbItem className={i === 0 ? "hidden sm:block" : ""}>
                  {c.href ? (
                    <BreadcrumbLink asChild>
                      <Link href={c.href}>{c.label}</Link>
                    </BreadcrumbLink>
                  ) : (
                    <BreadcrumbPage>{c.label}</BreadcrumbPage>
                  )}
                </BreadcrumbItem>
              </React.Fragment>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
        <div className="ml-auto flex items-center gap-1">
          <button
            onClick={() => setCmdOpen(true)}
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border bg-muted/50 text-muted-foreground text-sm hover:border-muted-foreground/30 hover:bg-card transition-colors"
          >
            <Search className="h-3.5 w-3.5" />
            <span>Buscar...</span>
            <kbd className="text-[10px] font-mono bg-card border border-border rounded px-1 py-px">⌘K</kbd>
          </button>
          <Button
            variant="ghost"
            size="icon"
            className="sm:hidden h-9 w-9 text-muted-foreground"
            onClick={() => setCmdOpen(true)}
          >
            <Search className="h-[18px] w-[18px]" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 text-muted-foreground relative"
          >
            <Bell className="h-[18px] w-[18px]" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full border-2 border-background" />
          </Button>
        </div>
      </header>
      <CommandPalette open={cmdOpen} onClose={() => setCmdOpen(false)} />
    </>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <div className="min-h-screen bg-background" />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <AuthGuard>
        <TooltipProvider>
          <SidebarProvider
            style={
              {
                "--sidebar-width": "15rem",
              } as React.CSSProperties
            }
          >
            <AppSidebar />
            <SidebarInset>
              <DashboardHeaderContent />
              <div className="flex flex-1 flex-col">
                <main className="flex-1 overflow-auto p-6 md:p-8 min-h-0">{children}</main>
              </div>
            </SidebarInset>
          </SidebarProvider>
        </TooltipProvider>
      </AuthGuard>
    </QueryClientProvider>
  );
}
