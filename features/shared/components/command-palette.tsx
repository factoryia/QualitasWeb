"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
}

const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Dashboard" },
  { href: "/usuarios", label: "Usuarios" },
  { href: "/roles", label: "Roles" },
  { href: "/grupos", label: "Grupos" },
  { href: "/organizacion", label: "Organización" },
];

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
}

export function CommandPalette({ open, onClose }: CommandPaletteProps) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const filtered = query.length > 0
    ? NAV_ITEMS.filter((i) => i.label.toLowerCase().includes(query.toLowerCase()))
    : NAV_ITEMS;

  const go = useCallback(
    (href: string) => {
      router.push(href);
      onClose();
      setQuery("");
    },
    [router, onClose]
  );

  useEffect(() => {
    if (open) {
      setQuery("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
      }
      if (e.key === "Escape" && open) {
        onClose();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-60 flex items-start justify-center pt-[18vh] bg-foreground/20 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-[520px] max-w-[calc(100vw-32px)] bg-card rounded-xl border border-border shadow-xl overflow-hidden animate-in zoom-in-95 slide-in-from-top-2 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
          <Search className="h-[18px] w-[18px] text-muted-foreground shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => { setQuery(e.target.value); setSelectedIndex(0); }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && filtered[selectedIndex]) {
                go(filtered[selectedIndex].href);
              }
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setSelectedIndex((s) => Math.min(s + 1, filtered.length - 1));
              }
              if (e.key === "ArrowUp") {
                e.preventDefault();
                setSelectedIndex((s) => Math.max(s - 1, 0));
              }
            }}
            placeholder="Buscar módulo..."
            className="flex-1 border-none outline-none text-[15px] bg-transparent text-foreground placeholder:text-muted-foreground"
          />
        </div>

        {/* Results */}
        <div className="max-h-80 overflow-y-auto p-1.5">
          {query.length === 0 && (
            <div className="text-[10.5px] font-semibold uppercase tracking-wider text-muted-foreground px-2.5 py-2">
              Navegación rápida
            </div>
          )}
          {filtered.slice(0, 12).map((item, i) => {
            const Icon = item.icon;
            return (
              <div
                key={item.href}
                className={cn(
                  "flex items-center gap-2.5 px-2.5 py-2 rounded-md cursor-pointer transition-colors",
                  i === selectedIndex ? "bg-accent" : "hover:bg-accent/50"
                )}
                onClick={() => go(item.href)}
                onMouseEnter={() => setSelectedIndex(i)}
              >
                {Icon && <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />}
                <span className="text-[13.5px] font-medium text-foreground">{item.label}</span>
              </div>
            );
          })}
          {filtered.length === 0 && (
            <div className="py-8 text-center text-sm text-muted-foreground">
              Sin resultados para "{query}"
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center gap-4 px-4 py-2.5 border-t border-border text-[11px] text-muted-foreground">
          <span><kbd className="font-mono text-[10px] bg-muted border border-border rounded px-1">↵</kbd> Abrir</span>
          <span><kbd className="font-mono text-[10px] bg-muted border border-border rounded px-1">↑↓</kbd> Navegar</span>
          <span><kbd className="font-mono text-[10px] bg-muted border border-border rounded px-1">esc</kbd> Cerrar</span>
        </div>
      </div>
    </div>
  );
}
