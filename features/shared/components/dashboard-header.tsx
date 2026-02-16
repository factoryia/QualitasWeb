"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Search, Bell, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CommandPalette } from "./command-palette";

interface DashboardHeaderProps {
  onMenuClick?: () => void;
  sidebarOpen?: boolean;
}

function getBreadcrumbs(pathname: string): { label: string; href?: string }[] {
  const crumbs: { label: string; href?: string }[] = [{ label: "Inicio", href: "/" }];
  
  if (pathname === "/") return [{ label: "Dashboard" }];
  
  if (pathname.startsWith("/usuarios")) {
    crumbs.push({ label: "Usuarios" });
  } else {
    crumbs.push({ label: pathname.split("/")[1] || "Página" });
  }
  
  return crumbs;
}

export function DashboardHeader({ onMenuClick, sidebarOpen = true }: DashboardHeaderProps) {
  const pathname = usePathname();
  const [cmdOpen, setCmdOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const crumbs = getBreadcrumbs(pathname);

  // Cmd+K shortcut
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
      <header className="h-14 bg-card border-b border-border flex items-center px-4 md:px-6 gap-3 shrink-0">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden h-8 w-8 text-muted-foreground"
          onClick={onMenuClick}
        >
          {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>

        {/* Breadcrumbs */}
        <nav className="flex items-center gap-0.5 flex-1 min-w-0">
          {crumbs.map((c, i) => (
            <span key={i} className="flex items-center gap-0.5">
              {i > 0 && <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50" />}
              {c.href ? (
                <Link
                  href={c.href}
                  className="text-[13px] text-muted-foreground hover:text-primary transition-colors"
                >
                  {c.label}
                </Link>
              ) : (
                <span
                  className={`text-[13px] whitespace-nowrap ${
                    i === crumbs.length - 1 ? "text-foreground font-semibold" : "text-muted-foreground"
                  }`}
                >
                  {c.label}
                </span>
              )}
            </span>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setCmdOpen(true)}
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border bg-muted/50 text-muted-foreground text-[13px] hover:border-muted-foreground/30 hover:bg-card transition-colors"
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
            onClick={() => setNotifOpen(true)}
          >
            <Bell className="h-[18px] w-[18px]" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full border-2 border-card" />
          </Button>
        </div>
      </header>

      {/* Command palette */}
      <CommandPalette open={cmdOpen} onClose={() => setCmdOpen(false)} />
    </>
  );
}
