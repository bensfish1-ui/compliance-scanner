"use client";

import * as React from "react";
import { Bell, LogOut, Settings, User, Moon, Sun } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { SearchCommand } from "@/components/ui/search-command";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useNotificationStore } from "@/stores/notification-store";
import { useSidebarStore } from "@/stores/sidebar-store";
import { formatRelativeDate } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

const notificationTypeColors: Record<string, string> = {
  info: "bg-blue-500",
  warning: "bg-amber-500",
  error: "bg-red-500",
  success: "bg-emerald-500",
};

export function Header() {
  const router = useRouter();
  const { isCollapsed } = useSidebarStore();
  const { notifications, unreadCount, markAsRead, markAllAsRead } =
    useNotificationStore();

  return (
    <header
      className={cn(
        "sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-white/[0.06] bg-navy-900/80 backdrop-blur-xl px-6 transition-all duration-200",
        isCollapsed ? "ml-[72px]" : "ml-[256px]"
      )}
    >
      <SearchCommand />

      <div className="ml-auto flex items-center gap-3">
        {/* Notifications */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5 text-slate-400" />
              {unreadCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                  {unreadCount}
                </span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-96 p-0" align="end">
            <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-3">
              <h3 className="font-semibold text-white text-sm">Notifications</h3>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs text-primary-400 hover:text-primary-300 transition-colors"
                >
                  Mark all as read
                </button>
              )}
            </div>
            <ScrollArea className="max-h-[400px]">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-sm text-slate-500">
                  No notifications
                </div>
              ) : (
                <div className="divide-y divide-white/[0.04]">
                  {notifications.map((notification) => (
                    <button
                      key={notification.id}
                      onClick={() => {
                        markAsRead(notification.id);
                        if (notification.actionUrl) {
                          router.push(notification.actionUrl);
                        }
                      }}
                      className={cn(
                        "flex w-full gap-3 p-4 text-left transition-colors hover:bg-white/[0.02]",
                        !notification.read && "bg-primary-600/5"
                      )}
                    >
                      <div
                        className={cn(
                          "mt-1 h-2 w-2 shrink-0 rounded-full",
                          notificationTypeColors[notification.type]
                        )}
                      />
                      <div className="flex-1 min-w-0">
                        <p className={cn("text-sm font-medium", !notification.read ? "text-white" : "text-slate-300")}>
                          {notification.title}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5 truncate">
                          {notification.message}
                        </p>
                        <p className="text-xs text-slate-600 mt-1">
                          {formatRelativeDate(notification.createdAt)}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </ScrollArea>
          </PopoverContent>
        </Popover>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-white/[0.04] transition-colors">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="text-xs">JD</AvatarFallback>
              </Avatar>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-slate-200">John Doe</p>
                <p className="text-xs text-slate-500">Admin</p>
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push("/settings")}>
              <User className="mr-2 h-4 w-4" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push("/settings")}>
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => {
                localStorage.removeItem("access_token");
                router.push("/login");
              }}
              className="text-red-400 focus:text-red-300"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
