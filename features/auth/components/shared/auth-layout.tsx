import React from "react";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Copyright } from "@/features/auth/components/shared/copyright";
import { Logo } from "@/components/shared/logo";
import Link from "next/link";

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
    <div className="relative z-10 w-full max-w-md flex flex-col items-center gap-6">
      <Card
        className={cn(
          "w-full shadow-xl bg-white/80 backdrop-blur-xl",
          className,
        )}
      >
        <CardHeader className="space-y-1 pb-6">
          <Logo />
          <CardTitle className="text-2xl font-bold text-center text-slate-900">
            {title}
          </CardTitle>
          {description && (
            <CardDescription className="text-center text-slate-500 text-base">
              {description}
            </CardDescription>
          )}
        </CardHeader>
        <CardContent className="space-y-4">{children}</CardContent>

        {/* Footer inside card or below */}
        <div className="px-6 pb-6 pt-2 flex items-center justify-between text-xs text-slate-400">
          <Link href="#" className="hover:text-slate-600 transition-colors">
            ¿Olvidaste tu contraseña?
          </Link>
        </div>
      </Card>

      <Copyright />
    </div>
  );
}
