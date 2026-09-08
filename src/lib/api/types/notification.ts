import type { ChatWsEvent } from "@/lib/api/types/chat";

export type AppNotification = {  id: string;
  user_id: string;
  type: string;
  title: string;
  body: string;
  link: string;
  read: boolean;
  created_at: string;
};

export type NotificationsResponse = {
  notifications: AppNotification[];
  unread_count: number;
};

export type NotificationCreatedEvent = {
  type: "notification.created";
  notification: AppNotification;
  unread_count: number;
};

export type NotificationReadEvent = {
  type: "notification.read";
  id: string;
  unread_count: number;
};

export type NotificationsAllReadEvent = {
  type: "notifications.all_read";
  unread_count: number;
};

export type NotificationWsEvent =
  | NotificationCreatedEvent
  | NotificationReadEvent
  | NotificationsAllReadEvent;

export type { ChatWsEvent };
