"use client";

import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface EmptyBlockProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  cta?: React.ReactNode;
  className?: string;
}

export function EmptyBlock({ icon: Icon, title, description, cta, className }: EmptyBlockProps) {
  return (
    <div className={cn("flex flex-col items-center text-center py-8", className)}>
      <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground mb-3">
        <Icon className="h-6 w-6" />
      </div>
      <p className="text-sm font-semibold">{title}</p>
      {description && (
        <p className="text-xs text-muted-foreground max-w-xs mt-1">{description}</p>
      )}
      {cta && <div className="mt-3">{cta}</div>}
    </div>
  );
}
