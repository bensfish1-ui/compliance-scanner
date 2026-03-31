"use client";

import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { useSidebarStore } from "@/stores/sidebar-store";
import { cn } from "@/lib/utils";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isCollapsed } = useSidebarStore();

  return (
    <div className="min-h-screen bg-navy-900 bg-grid">
      <Sidebar />
      <Header />
      <main
        className={cn(
          "transition-all duration-200 p-6",
          isCollapsed ? "ml-[72px]" : "ml-[256px]"
        )}
      >
        <div className="mb-4">
          <Breadcrumbs />
        </div>
        {children}
      </main>
    </div>
  );
}
