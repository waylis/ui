import { create } from "zustand";
import { api } from "../api/api";

type EventHandler = (event: MessageEvent) => void;

interface EventSourceStore {
    eventSource?: EventSource;
    addEventHandler: (eventName: string, handler: EventHandler) => void;
    closeEventSource: () => void;
}

export const useEventSourceStore = create<EventSourceStore>((set, get) => ({
    eventSource: undefined,

    addEventHandler: (eventName: string, handler: EventHandler) => {
        let { eventSource } = get();

        if (!eventSource) {
            eventSource = new EventSource(api.endpoint("events"));

            eventSource.onerror = () => {
                console.error("EventSource connection error");
            };

            set({ eventSource });
        }

        eventSource.addEventListener(eventName, handler);
    },

    closeEventSource: () => {
        const { eventSource } = get();
        if (eventSource) {
            eventSource.close();
            set({ eventSource: undefined });
        }
    },
}));
