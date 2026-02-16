"use client";

import { useEffect, useState } from "react";
import { AuthGuard } from "@/features/auth/components/shared/auth-guard";
import { DashboardSidebar } from "../../features/shared/components/dashboard-sidebar";
import { DashboardHeader } from "../../features/shared/components/dashboard-header";
import { TooltipProvider } from "@/components/ui/tooltip";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMounted, setIsMounted] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <div className="min-h-screen bg-background" />;
  }

  return (
    <AuthGuard>
      <TooltipProvider>
        <div className="flex h-screen w-full overflow-hidden bg-background">
          {/* Mobile overlay */}
          {mobileOpen && (
            <div
              className="fixed inset-0 z-40 bg-foreground/20 backdrop-blur-sm md:hidden"
              onClick={() => setMobileOpen(false)}
            />
          )}

          <DashboardSidebar onMobileClose={() => setMobileOpen(false)} mobileOpen={mobileOpen} />

          {/* Main area */}
          <div className="flex-1 flex flex-col overflow-hidden min-w-0">
            <DashboardHeader onMenuClick={() => setMobileOpen((o) => !o)} sidebarOpen={mobileOpen} />
            {/* Content */}
            <main className="flex-1 overflow-auto p-6 md:p-8">{children}</main>
          </div>
        </div>
      </TooltipProvider>
    </AuthGuard>
  );
}
