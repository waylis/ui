import { create } from "zustand";
import { api } from "../api/api";
import { errNotify } from "../utils/notifications";

type EventHandler = (event: MessageEvent) => void;

const MAX_HEARTBEAT_TIMEOUT = 20_000;

interface EventSourceStore {
  eventSource?: EventSource;
  lastHeartbeatAt: Date;
  heartbeatIntervalID?: number;

  open: () => EventSource;
  addEventHandler: (eventName: string, handler: EventHandler) => void;
  close: () => void;
}

export const useEventSourceStore = create<EventSourceStore>((set, get) => ({
  eventSource: undefined,
  lastHeartbeatAt: new Date(),

  open() {
    get().eventSource?.close();
    const eventSource = new EventSource(api.endpoint("events"));

    eventSource.onerror = () => {
      errNotify("Unable to connect to the server. Please try again later.");
    };

    eventSource.addEventListener("heartbeat", () => {
      set({ lastHeartbeatAt: new Date() });
    });

    const heartbeatIntervalID = setInterval(() => {
      if (get().eventSource && new Date().getTime() - get().lastHeartbeatAt.getTime() > MAX_HEARTBEAT_TIMEOUT) {
        errNotify("Connection to the server lost. Try reloading the page.");
        clearInterval(heartbeatIntervalID);
      }
    }, 2000);

    set({ eventSource, heartbeatIntervalID });
    return eventSource;
  },

  addEventHandler: (eventName: string, handler: EventHandler) => {
    let { eventSource } = get();

    if (!eventSource) {
      eventSource = get().open();
    }

    eventSource.addEventListener(eventName, handler);
  },

  close: () => {
    const { eventSource } = get();
    if (eventSource) {
      eventSource.close();
      set({ eventSource: undefined });
    }
  },
}));
