import type { ChatWsEvent } from "@/lib/api/types/chat";
import type { NotificationWsEvent } from "@/lib/api/types/notification";
import type { VoiceCallWsEvent } from "@/lib/api/types/voice-call";
import type { GroupCallWsEvent } from "@/lib/api/types/group-call";
import { connectNotificationsWs, sendAppWs } from "./ws-client";

export type AppWsEvent = NotificationWsEvent | ChatWsEvent | VoiceCallWsEvent | GroupCallWsEvent | { type: string };

type WsSubscriber = {
  onEvent: (ev: AppWsEvent) => void;
  onReconnect?: () => void;
};

const subscribers = new Set<WsSubscriber>();
let disconnectFn: (() => void) | null = null;

function ensureConnection() {
  if (disconnectFn) return;
  disconnectFn = connectNotificationsWs({
    onEvent: (ev) => {
      for (const sub of subscribers) {
        sub.onEvent(ev as AppWsEvent);
      }
    },
    onReconnect: () => {
      for (const sub of subscribers) {
        sub.onReconnect?.();
      }
    },
  });
}

export function subscribeAppWs(subscriber: WsSubscriber): () => void {
  subscribers.add(subscriber);
  ensureConnection();
  return () => {
    subscribers.delete(subscriber);
    if (subscribers.size === 0 && disconnectFn) {
      disconnectFn();
      disconnectFn = null;
    }
  };
}

/** Ensure the shared stream is up, then send a client→server frame. */
export function sendOnAppWs(payload: Record<string, unknown>): boolean {
  ensureConnection();
  return sendAppWs(payload);
}
