import { useEffect } from "react";
import { useNotificationStore } from "@/stores/notification-store";

export function useNotifications() {
  const store = useNotificationStore();

  useEffect(() => {
    // In production, connect to Socket.IO here
    // const socket = io(API_BASE_URL);
    // socket.on('notification', (notification) => {
    //   store.addNotification(notification);
    // });
    // return () => { socket.disconnect(); };
  }, []);

  return store;
}
