import { create } from "zustand";
import type { Chat } from "../api/types";
import { api } from "../api/api";

interface ChatStore {
    chats: Chat[];
    activeChat: Chat | null;

    page: number;
    limit: number;
    endReached: boolean;

    fetchChats(): Promise<Chat[]>;
    setActiveChat(chat: Chat | null): void;
    createChat(name?: string): Promise<Chat>;
    deleteChat(id: string): Promise<Chat>;
}

export const useChatStore = create<ChatStore>()((set, get) => ({
    chats: [],
    activeChat: null,

    page: 1,
    limit: 20,
    endReached: false,

    async fetchChats() {
        const chats = await api.getChats(get().page, get().limit);

        if (chats.length && !get().activeChat) {
            set({ chats, activeChat: chats[0] });
        } else {
            set({ chats });
        }

        return chats;
    },

    setActiveChat(chat: Chat | null) {
        set({ activeChat: chat });
    },

    async createChat(name?: string) {
        const chat = await api.createChat(name);
        const chats = [chat, ...get().chats];

        if (!get().activeChat) {
            set({ chats, activeChat: chat });
        } else {
            set({ chats });
        }

        return chat;
    },

    async deleteChat(id: string) {
        const deleted = await api.deleteChat(id);
        const newList = get().chats.filter((c) => c.id !== deleted.id);

        if (deleted.id === get().activeChat?.id) {
            set({ chats: newList, activeChat: newList[0] || null });
        } else {
            set({ chats: newList });
        }

        return deleted;
    },
}));
