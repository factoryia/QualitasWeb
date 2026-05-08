import React from "react";
import { KeyRound } from "lucide-react";
import Link from "next/link";

import { Logo } from "@/components/shared/logo";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

import { Copyright } from "./copyright";

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  description?: string;
  className?: string;
}

export function AuthLayout({
  children,
  title,
  description,
  className,
}: AuthLayoutProps) {
  return (
    <div className="relative z-10 flex w-full max-w-md flex-col items-center gap-6">
      <Card
        className={cn(
          "w-full gap-0  rounded-3xl border border-white/80 bg-linear-to-br from-white/95 via-white/80 to-sky-50/50 py-0 shadow-[0_10px_30px_rgba(0,0,0,0.05)] shadow-blue-500/15 ring-1 ring-white/90 backdrop-blur-xl",
          className,
        )}
      >
        <CardHeader className="space-y-3 px-8 pb-2 pt-8 text-center">
          <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-linear-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/30 ring-4 ring-white/90">
            <Logo className="mb-0 size-9 brightness-0 invert" />
          </div>
          <CardTitle className="text-2xl font-semibold tracking-tight text-slate-900">
            {title}
          </CardTitle>
          {description && (
            <CardDescription className="text-sm pb-4 leading-relaxed text-slate-500">
              {description}
            </CardDescription>
          )}
        </CardHeader>
        <CardContent className="space-y-4 px-8 pb-2 pt-2">{children}</CardContent>

        <div className="flex items-center justify-center px-8 pb-8 pt-2">
          <Link
            href="#"
            className="inline-flex items-center gap-2 text-xs font-medium text-slate-500 transition-colors hover:text-blue-600"
          >
            <KeyRound className="size-3.5 shrink-0 opacity-80" aria-hidden />
            ¿Olvidaste tu contraseña?
          </Link>
        </div>
      </Card>

      <Copyright />
    </div>
  );
}
