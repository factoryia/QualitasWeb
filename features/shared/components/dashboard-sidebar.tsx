"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Shield,
  UsersRound,
  LogOut,
  ChevronRight,
  ChevronLeft,
  User,
  Settings,
  Zap,
  Building2,
  FileText,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/features/auth/store/auth.store";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type SidebarItem = {
  href: string;
  label: string;
  icon: React.ElementType;
  permission: string | null;
  subItems?: Array<{ href: string; label: string; icon: React.ElementType }>;
};

// Enlaces siempre visibles para usuarios autenticados. Las acciones dentro de cada página (crear, editar, eliminar) siguen protegidas por permisos.
const SIDEBAR_SECTIONS: Array<{ title: string; items: SidebarItem[] }> = [
  {
    title: "HOME",
    items: [
      {
        href: "/",
        label: "Dashboard",
        icon: LayoutDashboard,
        permission: null,
      },
    ],
  },
  {
    title: "ADMINISTRACIÓN",
    items: [
      { href: "/usuarios", label: "Usuarios", icon: Users, permission: null },
      {
        href: "/organizacion",
        label: "Organización",
        icon: Building2,
        permission: null,
      },
    ],
  },
  {
    title: "NORMATIVIDAD",
    items: [
      {
        href: "/normatividad/marcos-normativos",
        label: "Marcos Normativos",
        icon: FileText,
        permission: null,
      },
      {
        href: "/normatividad/mipg",
        label: "MIPG",
        icon: Shield,
        permission: null,
      },
      {
        href: "/normatividad/cumplimiento",
        label: "Cumplimiento",
        icon: CheckCircle2,
        permission: null,
      },
    ],
  },
] as const;

interface DashboardSidebarProps {
  onMobileClose?: () => void;
  mobileOpen?: boolean;
}

export function DashboardSidebar({
  onMobileClose,
  mobileOpen = false,
}: DashboardSidebarProps) {
  const pathname = usePathname();
  const logout = useAuthStore((s) => s.logout);
  const user = useAuthStore((s) => s.user);
  const [collapsed, setCollapsed] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(() => {
    // Inicializar con las secciones que deberían estar expandidas según la ruta actual
    const initial = new Set<string>();
    if (pathname.startsWith("/normatividad")) {
      initial.add("/normatividad");
    }
    return initial;
  });

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  const toggleSection = (href: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(href)) {
      newExpanded.delete(href);
    } else {
      newExpanded.add(href);
    }
    setExpandedSections(newExpanded);
  };

  const isExpanded = (href: string) => {
    return expandedSections.has(href) || pathname.startsWith(href);
  };

  // Actualizar estado expandido cuando cambia la ruta
  useEffect(() => {
    if (
      pathname.startsWith("/normatividad") &&
      !expandedSections.has("/normatividad")
    ) {
      setExpandedSections((prev) => new Set(prev).add("/normatividad"));
    }
  }, [pathname, expandedSections]);

  return (
    <aside
      className={cn(
        "fixed md:relative z-50 h-full bg-card border-r border-border flex flex-col",
        "transition-all duration-300 ease-in-out",
        collapsed ? "w-16 min-w-[64px]" : "w-64 min-w-[256px]",
        mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
      )}
    >
      {/* Logo */}
      <div className="h-14 flex items-center gap-3 px-4 border-b border-border shrink-0">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-sm shrink-0">
          <Zap className="h-[18px] w-[18px] text-primary-foreground" />
        </div>
        {!collapsed && (
          <span className="text-base font-bold text-foreground tracking-tight whitespace-nowrap">
            Qualitas
          </span>
        )}
      </div>

      {/* Nav */}
      <ScrollArea className="flex-1 py-2 px-3">
        {SIDEBAR_SECTIONS.map((section, gi) => (
          <div key={gi} className="mb-1">
            {section.title && !collapsed && (
              <div className="text-[10.5px] font-semibold uppercase tracking-wider text-muted-foreground px-2 pt-4 pb-1.5">
                {section.title}
              </div>
            )}
            {section.title && collapsed && (
              <div className="h-px bg-border mx-2 my-2" />
            )}
            {section.items.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              const hasSubItems = item.subItems && item.subItems.length > 0;
              const expanded = hasSubItems && isExpanded(item.href);

              if (hasSubItems && !collapsed) {
                return (
                  <div key={item.href} className="mb-0.5">
                    <button
                      onClick={() => toggleSection(item.href)}
                      className={cn(
                        "w-full flex items-center justify-between gap-2.5 rounded-lg px-2.5 py-[7px]",
                        "transition-colors text-sm relative group",
                        active
                          ? "bg-accent text-accent-foreground font-medium"
                          : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
                      )}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon
                          className={`h-[18px] w-[18px] shrink-0 ${active ? "text-primary" : ""}`}
                        />
                        <span className="truncate text-[13.5px]">
                          {item.label}
                        </span>
                      </div>
                      {expanded ? (
                        <ChevronUp className="h-3.5 w-3.5 shrink-0" />
                      ) : (
                        <ChevronDown className="h-3.5 w-3.5 shrink-0" />
                      )}
                    </button>
                    {expanded && (
                      <div className="ml-4 mt-0.5 space-y-0.5">
                        {item.subItems!.map((subItem) => {
                          const SubIcon = subItem.icon;
                          const subActive = isActive(subItem.href);
                          return (
                            <Link
                              key={subItem.href}
                              href={subItem.href}
                              onClick={() => onMobileClose?.()}
                              className={cn(
                                "w-full flex items-center gap-2.5 rounded-lg px-2.5 py-[7px]",
                                "transition-colors text-sm",
                                subActive
                                  ? "bg-accent text-accent-foreground font-medium"
                                  : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
                              )}
                            >
                              <SubIcon
                                className={`h-[16px] w-[16px] shrink-0 ${subActive ? "text-primary" : ""}`}
                              />
                              <span className="truncate text-[13px]">
                                {subItem.label}
                              </span>
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              }

              const btn = (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => onMobileClose?.()}
                  className={cn(
                    "w-full flex items-center gap-2.5 rounded-lg px-2.5 py-[7px] mb-0.5",
                    "transition-colors text-sm relative group",
                    active
                      ? "bg-accent text-accent-foreground font-medium"
                      : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
                    collapsed ? "justify-center px-0" : "",
                  )}
                >
                  <Icon
                    className={`h-[18px] w-[18px] shrink-0 ${active ? "text-primary" : ""}`}
                  />
                  {!collapsed && (
                    <span className="truncate text-[13.5px]">{item.label}</span>
                  )}
                </Link>
              );

              if (collapsed) {
                return (
                  <Tooltip key={item.href} delayDuration={0}>
                    <TooltipTrigger asChild>{btn}</TooltipTrigger>
                    <TooltipContent side="right" className="text-xs">
                      {item.label}
                    </TooltipContent>
                  </Tooltip>
                );
              }
              return btn;
            })}
          </div>
        ))}
      </ScrollArea>

      {/* Footer */}
      <div className="border-t border-border p-3 shrink-0">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-accent/50 cursor-pointer transition-colors">
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                <User className="h-4 w-4 text-muted-foreground" />
              </div>
              {!collapsed && (
                <div className="overflow-hidden min-w-0">
                  <div className="text-[13px] font-semibold text-foreground truncate">
                    {user?.email?.split("@")[0] ?? "Usuario"}
                  </div>
                  <div className="text-[11px] text-muted-foreground truncate">
                    {user?.email}
                  </div>
                </div>
              )}
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            side={collapsed ? "right" : "top"}
            align="start"
            className="w-48"
          >
            <DropdownMenuItem asChild>
              <Link href="/perfil" className="flex items-center">
                <User className="h-4 w-4 mr-2" /> Mi Perfil
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/configuracion" className="flex items-center">
                <Settings className="h-4 w-4 mr-2" /> Configuración
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={logout}
              className="text-destructive focus:text-destructive flex items-center"
            >
              <LogOut className="h-4 w-4 mr-2" /> Cerrar sesión
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <div
          className={cn(
            "flex gap-1 mt-2",
            collapsed ? "flex-col items-center" : "justify-end",
          )}
        >
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground"
            onClick={() => setCollapsed((c) => !c)}
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </aside>
  );
}
