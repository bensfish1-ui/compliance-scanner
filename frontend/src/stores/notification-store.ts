import { create } from "zustand";
import type { Notification } from "@/types";

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Notification) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [
    {
      id: "1",
      type: "warning",
      title: "GDPR Deadline Approaching",
      message: "The GDPR compliance audit is due in 3 days",
      read: false,
      actionUrl: "/audits/1",
      createdAt: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: "2",
      type: "info",
      title: "New Regulation Published",
      message: "Digital Services Act update has been published by EU Commission",
      read: false,
      actionUrl: "/regulations/2",
      createdAt: new Date(Date.now() - 7200000).toISOString(),
    },
    {
      id: "3",
      type: "success",
      title: "Audit Completed",
      message: "SOC 2 Type II audit has been completed successfully",
      read: true,
      actionUrl: "/audits/3",
      createdAt: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: "4",
      type: "error",
      title: "Action Overdue",
      message: "CAPA-2024-015 remediation is 5 days overdue",
      read: false,
      actionUrl: "/audits/4",
      createdAt: new Date(Date.now() - 43200000).toISOString(),
    },
  ],
  unreadCount: 3,
  addNotification: (notification) =>
    set((state) => ({
      notifications: [notification, ...state.notifications],
      unreadCount: state.unreadCount + 1,
    })),
  markAsRead: (id) =>
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      ),
      unreadCount: Math.max(0, state.unreadCount - 1),
    })),
  markAllAsRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
      unreadCount: 0,
    })),
  removeNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
      unreadCount: state.notifications.find((n) => n.id === id && !n.read)
        ? state.unreadCount - 1
        : state.unreadCount,
    })),
  clearAll: () => set({ notifications: [], unreadCount: 0 }),
}));
