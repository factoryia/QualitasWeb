"use client";

import Link from "next/link";
import { useAuthStore } from "@/features/auth/store/auth.store";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, BriefcaseBusiness } from "lucide-react";

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);

  const quickLinks = [
    {
      title: "Usuarios",
      description: "Gestionar usuarios, roles y grupos",
      href: "/usuarios",
      icon: Users,
    },{
      title: "Organizacion",
      description: "Configurar identidad institucional, sedes y estructura organizacional",
      href: "/organizacion",
      icon: BriefcaseBusiness,
    }
  ];

  return (
    <div>
      <p className="text-sm font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
        Administración
      </p>
      <h1 className="mt-1 text-2xl font-bold text-slate-900 dark:text-slate-100">
        Dashboard
      </h1>
      <p className="mt-2 text-slate-600 dark:text-slate-400">
        Bienvenido, {user?.fullName || user?.email || "Usuario"}.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {quickLinks.map((item) => {
          const Icon = item.icon;
          return (
            <Card
              key={item.href}
              className="overflow-hidden border-slate-200 dark:border-slate-800"
            >
              <CardHeader className="pb-2">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="size-5" />
                  </div>
                  <div>
                    <CardTitle className="text-base">{item.title}</CardTitle>
                    <CardDescription className="text-sm">
                      {item.description}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Button variant="outline" size="sm" asChild>
                  <Link href={item.href}>Ir a {item.title}</Link>
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="mt-8 border-slate-200 dark:border-slate-800">
        <CardHeader>
          <CardTitle className="text-base">Resumen</CardTitle>
          <CardDescription>
            Accede a la gestión de Usuarios, Roles y Grupos desde el menú lateral o la tarjeta de arriba.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
