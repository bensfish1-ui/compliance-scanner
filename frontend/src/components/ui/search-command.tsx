"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  FileText,
  FolderKanban,
  ClipboardCheck,
  Shield,
  Bot,
  Settings,
  BarChart3,
  Search,
} from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "./command";

const navigationItems = [
  { title: "Dashboard", icon: BarChart3, href: "/dashboard" },
  { title: "Regulations", icon: BookOpen, href: "/regulations" },
  { title: "Projects", icon: FolderKanban, href: "/projects" },
  { title: "Audits", icon: ClipboardCheck, href: "/audits" },
  { title: "Risks", icon: Shield, href: "/risks" },
  { title: "Policies", icon: FileText, href: "/policies" },
  { title: "Documents", icon: FileText, href: "/documents" },
  { title: "AI Copilot", icon: Bot, href: "/ai-copilot" },
  { title: "Workflows", icon: Settings, href: "/workflows" },
  { title: "Reports", icon: BarChart3, href: "/reports" },
  { title: "Settings", icon: Settings, href: "/settings" },
];

const quickActions = [
  { title: "Add New Regulation", href: "/regulations/new" },
  { title: "Create Project", href: "/projects?action=new" },
  { title: "Schedule Audit", href: "/audits?action=new" },
  { title: "Generate Report", href: "/reports?action=generate" },
  { title: "Open AI Copilot", href: "/ai-copilot" },
];

export function SearchCommand() {
  const [open, setOpen] = React.useState(false);
  const router = useRouter();

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const onSelect = (href: string) => {
    setOpen(false);
    router.push(href);
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-lg border border-white/10 bg-navy-800/50 px-3 py-2 text-sm text-slate-400 hover:text-slate-300 hover:border-white/20 transition-colors w-64"
      >
        <Search className="h-4 w-4" />
        <span>Search...</span>
        <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border border-white/10 bg-navy-700/50 px-1.5 font-mono text-[10px] font-medium text-slate-500">
          <span className="text-xs">&#8984;</span>K
        </kbd>
      </button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Type to search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Navigation">
            {navigationItems.map((item) => (
              <CommandItem
                key={item.href}
                onSelect={() => onSelect(item.href)}
              >
                <item.icon className="mr-2 h-4 w-4 text-slate-400" />
                {item.title}
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Quick Actions">
            {quickActions.map((action) => (
              <CommandItem
                key={action.href}
                onSelect={() => onSelect(action.href)}
              >
                {action.title}
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
