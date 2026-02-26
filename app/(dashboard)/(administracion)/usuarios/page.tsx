"use client";

import { useState } from "react";
import { Users as UsersIcon, Shield, FolderTree, Lightbulb } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { RolesTab } from "@/features/users/components/RolesTab";
import { GroupsTab } from "@/features/users/components/GroupsTab";
import { UsersTab } from "@/features/users/components/users/UsersTab";
// Importamos Tabs para la versión móvil
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const sections = [
  { id: "usuarios", label: "Usuarios", icon: UsersIcon },
  { id: "roles", label: "Roles", icon: Shield },
  { id: "grupos", label: "Grupos", icon: FolderTree },
] as const;

type Section = (typeof sections)[number]["id"];

export default function UsuariosPage() {
  const [activeSection, setActiveSection] = useState<Section>("usuarios");

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full min-h-[calc(100vh-4rem)]">
      
      {/* --- VISTA MÓVIL: PILLS --- */}
      <div className="lg:hidden w-full flex justify-center pt-2">
        <Tabs 
          value={activeSection} 
          onValueChange={(value) => setActiveSection(value as Section)} 
          className="w-fit"
        >
          <TabsList className="bg-muted/50 p-1 h-auto gap-1 border">
            {sections.map((s) => (
              <TabsTrigger
                key={s.id}
                value={s.id}
                className="gap-2 px-4 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <s.icon className="h-4 w-4" />
                <span className="text-xs sm:text-sm">{s.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {/* --- VISTA DESKTOP: SIDEBAR --- */}
      <aside className="hidden lg:flex w-52 shrink-0 flex-col gap-4">
        <div className="space-y-1">
          {sections.map((s) => (
            <button
              key={s.id}
              onClick={() => setActiveSection(s.id)}
              className={cn(
                "flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                activeSection === s.id
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <s.icon className="h-4 w-4" />
              {s.label}
            </button>
          ))}
        </div>

        <Card className="border-dashed mt-auto lg:mt-0">
          <CardContent className="p-4 space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Lightbulb className="h-4 w-4 text-amber-500" />
              Consejo
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {activeSection === "roles"
                ? "Ten cuidado al editar permisos del sistema, podrías bloquear funcionalidades críticas."
                : "Asigna roles específicos a cada usuario para controlar el acceso a los módulos del sistema."}
            </p>
          </CardContent>
        </Card>
      </aside>

      {/* --- CONTENIDO PRINCIPAL --- */}
      <main className="flex-1 min-w-0">
        <div className="animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
          {activeSection === "usuarios" && <UsersTab />}
          {activeSection === "roles" && <RolesTab />}
          {activeSection === "grupos" && <GroupsTab />}
        </div>
      </main>
    </div>
  );
}