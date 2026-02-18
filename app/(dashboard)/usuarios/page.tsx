"use client";

import { useState } from "react";
import { UsersTab } from "@/features/users/components/UsersTab";
import { RolesTab } from "@/features/users/components/RolesTab";
import { GroupsTab } from "@/features/users/components/GroupsTab";
import { Users, Shield, UsersRound, Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";

const SIDEBAR_ITEMS = [
  { id: "usuarios", label: "Usuarios", icon: Users },
  { id: "roles", label: "Roles", icon: Shield },
  { id: "grupos", label: "Grupos", icon: UsersRound },
] as const;

export default function UsuariosPage() {
  const [activeTab, setActiveTab] = useState("usuarios");

  return (
    <div className="flex h-screen gap-0 -m-6 md:-m-8">
      {/* Sidebar de tabs */}
      <aside className="w-64 shrink-0  dark:bg-slate-900/50 flex flex-col">
    
        <div className="flex-1 overflow-y-auto p-4">
          <h2 className="mb-3 px-2 text-[10.5px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Secciones
          </h2>
          <nav className="space-y-0.5">
            {SIDEBAR_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveTab(item.id)}
                  className={cn(
                    "w-full flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-all duration-150",
                    "relative group",
                    isActive
                      ? "bg-blue-600 text-white font-medium shadow-sm"
                      : "text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800/50 dark:hover:text-slate-100"
                  )}
                >
                  <Icon
                    className={cn(
                      "h-[18px] w-[18px] shrink-0 transition-colors",
                      isActive
                        ? "text-white"
                        : "text-slate-500 group-hover:text-slate-700 dark:text-slate-400 dark:group-hover:text-slate-200"
                    )}
                  />
                  <span className="flex-1 text-left">{item.label}</span>
                  {isActive && (
                    <div className="h-1.5 w-1.5 rounded-full bg-white/80" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Caja de consejo */}
          <div className="mt-6 rounded-lg bg-slate-100 dark:bg-slate-800/50 p-4 border border-slate-200 dark:border-slate-700">
            <div className="flex items-start gap-3">
              <Lightbulb className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                Asigna roles específicos a cada usuario para controlar el acceso a los módulos del sistema.
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Contenido */}
      <div className="flex-1 min-w-0 overflow-y-auto p-6 md:p-8">
        <div className="animate-in fade-in-0 slide-in-from-right-4 duration-300">
          {activeTab === "usuarios" && <UsersTab />}
          {activeTab === "roles" && <RolesTab />}
          {activeTab === "grupos" && <GroupsTab />}
        </div>
      </div>
    </div>
  );
}
