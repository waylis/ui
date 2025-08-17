import { create } from "zustand";
import type { CreateUserMessageParams, Message, ReplyRestriction } from "../api/types";
import { api } from "../api/api";

export interface CurrentReply {
    to: string;
    restriction?: ReplyRestriction;
}

interface MessageStore {
    messages: Message[];
    currentReply: CurrentReply | null;

    page: number;
    limit: number;
    endReached: boolean;

    fetchMessages(chatID: string): Promise<Message[]>;
    sendMessage(params: CreateUserMessageParams): Promise<Message>;
    appendMessage(msg: Message): void;
    setCurrentReply(message: Message): void;
    resetMessages(): void;
}

export const useMessageStore = create<MessageStore>()((set, get) => ({
    messages: [],
    currentReply: null,

    page: 1,
    limit: 20,
    endReached: false,

    async fetchMessages(chatID: string) {
        const messages = await api.getMessages(chatID, get().page, get().limit);
        const lastSystemMessage = messages.find((m) => m.senderID === "system");
        const currentReply = lastSystemMessage
            ? { to: lastSystemMessage.id, restriction: lastSystemMessage.replyRestriction }
            : null;

        set({ messages: messages.reverse(), currentReply });
        return messages;
    },

    async sendMessage(params: CreateUserMessageParams) {
        const message = await api.sendMessage(params);
        set({ messages: [...get().messages, message] });
        return message;
    },

    appendMessage(message: Message) {
        set({ messages: [...get().messages, message] });
    },

    setCurrentReply(message: Message) {
        set({
            currentReply: {
                to: message.id,
                restriction: message.replyRestriction,
            },
        });
    },

    resetMessages() {
        set({ messages: [], page: 1, currentReply: null, endReached: false });
    },
}));
