"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { useSidebarStore } from "@/stores/sidebar-store";
import { isAuthenticated } from "@/lib/auth";
import { cn } from "@/lib/utils";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isCollapsed } = useSidebarStore();
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace("/login");
    } else {
      setChecked(true);
    }
  }, [router]);

  // Don't render dashboard until auth is verified
  if (!checked) {
    return (
      <div className="min-h-screen bg-navy-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500" />
      </div>
    );
  }

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
