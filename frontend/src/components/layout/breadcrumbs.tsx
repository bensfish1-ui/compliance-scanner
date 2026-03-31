"use client";

import { usePathname } from "next/navigation";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

const routeLabels: Record<string, string> = {
  dashboard: "Dashboard",
  regulations: "Regulations",
  projects: "Projects",
  audits: "Audits",
  risks: "Risk Register",
  policies: "Policies",
  documents: "Documents",
  "ai-copilot": "AI Copilot",
  workflows: "Workflows",
  reports: "Reports",
  settings: "Settings",
  new: "New",
  builder: "Builder",
  kanban: "Kanban",
  calendar: "Calendar",
};

export function Breadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length <= 1) return null;

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {segments.map((segment, index) => {
          const href = "/" + segments.slice(0, index + 1).join("/");
          const isLast = index === segments.length - 1;
          const label = routeLabels[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);

          // Skip dynamic route segments like [id] patterns
          if (segment.startsWith("[")) return null;

          return (
            <BreadcrumbItem key={href}>
              {index > 0 && <BreadcrumbSeparator />}
              {isLast ? (
                <BreadcrumbPage>{label}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink href={href}>{label}</BreadcrumbLink>
              )}
            </BreadcrumbItem>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
