"use client";

import { useEffect, useRef, useState } from "react";
import { Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { DofaCategory } from "./dofa-types";

const LABEL_MAP: Record<DofaCategory, string> = {
  Fortaleza: "fortaleza",
  Debilidad: "debilidad",
  Oportunidad: "oportunidad",
  Amenaza: "amenaza",
};

type Props = {
  category: DofaCategory;
  onAdd: (text: string) => Promise<void>;
  compact?: boolean;
};

export function AddFactorInput({ category, onAdd, compact = false }: Props) {
  const [active, setActive] = useState(false);
  const [text, setText] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (active && inputRef.current) inputRef.current.focus();
  }, [active]);

  const commit = async () => {
    const t = text.trim();
    if (!t) { setActive(false); setText(""); return; }
    await onAdd(t);
    setText("");
    setActive(false);
  };

  if (!active) {
    return (
      <button
        onClick={() => setActive(true)}
        type="button"
        className={cn(
          "w-full flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground py-1.5 rounded-md hover:bg-background/60 transition-colors",
          compact ? "justify-center" : "justify-start px-2",
        )}
      >
        <Plus className="h-3.5 w-3.5" />
        {compact ? "" : `Agregar ${LABEL_MAP[category]}`}
      </button>
    );
  }

  return (
    <Input
      ref={inputRef}
      value={text}
      onChange={(e) => setText(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === "Enter") commit();
        if (e.key === "Escape") { setText(""); setActive(false); }
      }}
      placeholder="Escribe y presiona Enter..."
      className="h-8 text-sm"
    />
  );
}
