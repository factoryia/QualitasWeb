"use client";

import { useRouter } from "next/navigation";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { AuthGuard } from "@/features/auth/components/shared/auth-guard";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, logout } = useAuthStore();
  const router = useRouter();

  return (
    <AuthGuard>
      <div className="flex min-h-screen bg-slate-100">
        {/* Sidebar Placeholder */}
        <aside className="w-64 bg-white shadow-md hidden md:block">
          <div className="p-4 border-b">
            <h1 className="text-xl font-bold text-slate-800">Qualitas Nexus</h1>
            <p className="text-xs text-slate-500 mt-1">
              Tenant: <span className="font-medium text-blue-600">{user?.tenant}</span>
            </p>
          </div>
          <nav className="p-4 space-y-2">
            {/* Links de navegación */}
            <div className="text-sm font-medium text-slate-600">Dashboard</div>
            <div className="text-sm font-medium text-slate-600">Usuarios</div>
            <div className="text-sm font-medium text-slate-600">Configuración</div>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          <header className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-semibold text-slate-800">
              Bienvenido, {user?.fullName || user?.name || "Usuario"}
            </h2>
            <div className="flex items-center gap-4">
              <span className="text-sm text-slate-600">{user?.email}</span>
              <button 
                onClick={() => {
                  logout();
                  router.push("/login");
                }}
                className="text-sm text-red-600 hover:text-red-700 font-medium"
              >
                Cerrar Sesión
              </button>
            </div>
          </header>
          {children}
        </main>
      </div>
    </AuthGuard>
  );
}
