"use client";

import { PRMSHeader } from "./prms-header";
import { PRMSSidebar } from "./prms-sidebar";

interface PRMSLayoutProps {
  children: React.ReactNode;
}

export function PRMSLayout({ children }: PRMSLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex h-screen">
        {/* Sidebar */}
        <PRMSSidebar />

        {/* Main content area */}
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
