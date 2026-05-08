"use client";

import * as Icons from "lucide-react";
import type { LucideIcon, LucideProps } from "lucide-react";

interface Props extends Omit<LucideProps, "ref" | "name"> {
  name: string | null | undefined;
}

/** Render dinámico de un ícono lucide-react por nombre. Fallback: Layers. */
export function ProcessTypeIcon({ name, ...rest }: Props) {
  const lookup = Icons as unknown as Record<string, LucideIcon>;
  const Resolved = (name && lookup[name]) || lookup.Layers;
  return <Resolved {...rest} />;
}
