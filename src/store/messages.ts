import { create } from "zustand";
import type { Message, ReplyRestriction } from "@waylis/shared";
import type { CreateUserMessageParams } from "../api/types";
import { api } from "../api/api";

export interface CurrentReply {
  to: string;
  restriction?: ReplyRestriction;
}

interface MessageStore {
  messages: Message[];
  currentReply: CurrentReply | null;

  limit: number;
  endReached: boolean;
  lastMessageID?: string;

  fetchMessages(chatID: string): Promise<Message[]>;
  sendMessage(params: CreateUserMessageParams): Promise<Message>;
  appendMessage(msg: Message): void;
  setPageLimit(limit: number): void;
  setCurrentReply(message: Message): void;
  resetMessages(): void;
}

export const useMessageStore = create<MessageStore>()((set, get) => ({
  messages: [],
  currentReply: null,
  endReached: false,
  limit: 20,

  async fetchMessages(chatID: string) {
    const offset = get().messages.length;
    const limit = get().limit;
    const messages = await api.getMessages(chatID, offset, limit);
    const endReached = messages.length < limit;

    if (offset === 0) {
      const lastSystemMessage = messages.find((m) => m.senderID === "system");
      const currentReply = lastSystemMessage
        ? { to: lastSystemMessage.id, restriction: lastSystemMessage.replyRestriction }
        : null;

      set({ messages: messages.reverse(), currentReply, lastMessageID: messages.at(-1)?.id, endReached });
    } else {
      set({ messages: [...messages.reverse(), ...get().messages], endReached });
    }

    return messages;
  },

  async sendMessage(params: CreateUserMessageParams) {
    const message = await api.sendMessage(params);
    set({ messages: [...get().messages, message], lastMessageID: message.id });
    return message;
  },

  appendMessage(message: Message) {
    set({ messages: [...get().messages, message], lastMessageID: message.id });
  },

  setCurrentReply(message: Message) {
    set({
      currentReply: {
        to: message.id,
        restriction: message.replyRestriction,
      },
    });
  },

  setPageLimit(limit: number) {
    set({ limit });
  },

  resetMessages() {
    set({ messages: [], currentReply: null, endReached: false });
  },
}));
