import { create } from "zustand";
import type { Chat } from "../api/types";
import { api } from "../api/api";

interface ChatStore {
    chats: Chat[];
    activeChat: Chat | null;

    page: number;
    limit: number;
    endReached: boolean;

    fetchChats(activeChatID?: string): Promise<Chat[]>;
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

    async fetchChats(activeChatID?: string) {
        const chats = await api.getChats(get().page, get().limit);

        if (chats.length && !get().activeChat) {
            const activeChat = chats.find((c) => c.id === activeChatID) || chats[0];
            set({ chats, activeChat });
        } else {
            set({ chats });
        }

        return chats;
    },

    setActiveChat(chat: Chat | null) {
        const url = new URL(window.location.href);
        chat ? url.searchParams.set("chat", chat.id) : url.searchParams.delete("chat");
        window.history.replaceState({}, "", url);

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
