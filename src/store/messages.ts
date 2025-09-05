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
    limit?: number;
    lastMessageID?: string;

    fetchMessages(chatID: string): Promise<Message[]>;
    sendMessage(params: CreateUserMessageParams): Promise<Message>;
    appendMessage(msg: Message): void;
    setCurrentReply(message: Message): void;
    setPage(page: number): void;
    resetMessages(): void;
}

export const useMessageStore = create<MessageStore>()((set, get) => ({
    messages: [],
    currentReply: null,

    page: 1,
    endReached: false,

    async fetchMessages(chatID: string) {
        const page = get().page;
        const messages = await api.getMessages(chatID, page);

        if (page === 1) {
            const lastSystemMessage = messages.find((m) => m.senderID === "system");
            const currentReply = lastSystemMessage
                ? { to: lastSystemMessage.id, restriction: lastSystemMessage.replyRestriction }
                : null;

            set({ messages: messages.reverse(), currentReply, lastMessageID: messages.at(-1)?.id });
        } else {
            set({ messages: [...messages.reverse(), ...get().messages] });
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

    setPage(page: number) {
        set({ page });
    },

    resetMessages() {
        set({ messages: [], page: 1, currentReply: null });
    },
}));
