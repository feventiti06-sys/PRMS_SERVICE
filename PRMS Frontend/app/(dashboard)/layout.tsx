"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { PRMSHeader } from "@/features/prms/components/layout/prms-header";
import { PRMSSidebar } from "@/features/prms/components/layout/prms-sidebar";
import { AuthProvider } from "@/features/auth/contexts/auth-context";
import { useAuth } from "@/features/auth/contexts/auth-context";
import { Loader2, Shield } from "lucide-react";

function DashboardGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="mx-auto w-14 h-14 bg-red-600 rounded-lg flex items-center justify-center shadow">
            <Shield className="h-7 w-7 text-white" />
          </div>
          <div className="flex items-center justify-center space-x-2">
            <Loader2 className="h-5 w-5 animate-spin text-red-600" />
            <span className="text-gray-700 font-medium">Loading…</span>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect in flight — render nothing to avoid flash
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex h-screen">
        {/* Sidebar */}
        <PRMSSidebar />

        {/* Main content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <PRMSHeader />

          {/* Page content */}
          <main className="flex-1 overflow-auto bg-gray-50">
            <div className="container-fluid py-6">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

/**
 * Dashboard layout
 *
 * Wraps all /prms/* pages.  Mounts the AuthProvider so every component in
 * this subtree can call useAuth().
 *
 * Authentication architecture:
 *   Shared ERP Login → Keycloak → prms_dev_session (localStorage, dev only)
 *       → AuthProvider → DashboardGuard → PRMS pages
 *
 * The AuthProvider here reads from the dev session placeholder.
 * When the shared ERP/Keycloak integration is ready, swap the session source
 * inside AuthProvider (features/auth/contexts/auth-context.tsx) only.
 */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <DashboardGuard>{children}</DashboardGuard>
    </AuthProvider>
  );
}
