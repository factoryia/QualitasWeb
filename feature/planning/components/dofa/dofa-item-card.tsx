"use client";

import { useEffect, useRef, useState } from "react";
import { Pencil, X } from "lucide-react";
import type { DofaItemDto } from "@/feature/planning/api/dofa";

type Props = {
  item: DofaItemDto;
  onSave: (text: string) => Promise<void>;
  onDelete: () => void;
  readOnly: boolean;
};

export function ItemCard({ item, onSave, onDelete, readOnly }: Props) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(item.description);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (editing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
    }
  }, [editing]);

  const commit = async () => {
    const trimmed = draft.trim();
    if (!trimmed || trimmed === item.description) {
      setDraft(item.description);
      setEditing(false);
      return;
    }
    await onSave(trimmed);
    setEditing(false);
  };

  if (editing) {
    return (
      <textarea
        ref={textareaRef}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); commit(); }
          if (e.key === "Escape") { setDraft(item.description); setEditing(false); }
        }}
        rows={2}
        className="w-full text-sm bg-background border rounded-md px-2 py-1.5 outline-none focus:ring-2 focus:ring-ring resize-none"
      />
    );
  }

  return (
    <div className="group flex items-start gap-2 px-2 py-1.5 rounded-md hover:bg-muted/40 border border-transparent hover:border-border transition-colors">
      <p className="flex-1 text-sm text-foreground whitespace-pre-wrap break-words leading-snug">
        {item.description}
      </p>
      {!readOnly && (
        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          <button
            onClick={() => setEditing(true)}
            className="p-1 rounded hover:bg-muted"
            title="Editar"
            type="button"
          >
            <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
          </button>
          <button
            onClick={onDelete}
            className="p-1 rounded hover:bg-destructive/10 text-destructive"
            title="Eliminar"
            type="button"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
