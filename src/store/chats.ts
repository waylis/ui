import { create } from "zustand";
import type { Chat } from "@waylis/shared";
import { api } from "../api/api";
import { getQueryParam, setQueryParam } from "../utils/url";

interface ChatStore {
  chats: Chat[];
  activeChat: Chat | null;
  limit: number;
  endReached: boolean;

  fetchChats(): Promise<Chat[]>;
  createChat(name?: string): Promise<Chat>;
  deleteChat(id: string): Promise<Chat>;
  renameChat(id: string, name: string): Promise<Chat>;

  setPageLimit(limit: number): void;
  setActiveChat(chat: Chat | null): void;
}

export const useChatStore = create<ChatStore>()((set, get) => ({
  chats: [],
  activeChat: null,
  limit: 20,
  endReached: false,

  async fetchChats() {
    const offset = get().chats.length;
    const limit = get().limit;
    const chats = await api.getChats(offset, limit);
    const endReached = chats.length < limit;

    if (chats.length && !get().activeChat) {
      const activeChatID = getQueryParam("chat_id") ?? "";
      const activeChat = chats.find((c) => c.id === activeChatID) || chats[0];

      setQueryParam("chat_id", activeChat.id);
      set({ chats: [...get().chats, ...chats], activeChat, endReached });
    } else {
      set({ chats: [...get().chats, ...chats], endReached });
    }

    return chats;
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

  async renameChat(id: string, name: string) {
    const updated = await api.editChat(id, { name });
    set((state) => ({
      chats: state.chats.map((chat) => {
        return chat.id === id ? updated : chat;
      }),
    }));

    return updated;
  },

  setPageLimit(limit: number) {
    set({ limit });
  },

  setActiveChat(chat: Chat | null) {
    setQueryParam("chat_id", chat?.id ?? null);
    set({ activeChat: chat });
  },
}));
