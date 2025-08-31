import { Divider, Flex, LoadingOverlay } from "@mantine/core";
import { Header } from "./header";
import { MessageArea } from "./message-area";
import { InputArea } from "./input-area";
import { useChatStore } from "../store/chats";
import { useEffect, useState } from "react";
import { useCommandStore } from "../store/commands";
import { useMessageStore } from "../store/messages";
import type { Message } from "../api/types";
import { errNotify } from "../utils/notifications";
import { useEventSourceStore } from "../store/events";
import { delay } from "../utils/async";
import { useInfoStore } from "../store/info";

export const Page = () => {
    const [loading, setLoading] = useState(false);
    const fetchChats = useChatStore((s) => s.fetchChats);
    const activeChat = useChatStore((s) => s.activeChat);
    const fetchInfo = useInfoStore((s) => s.fetchInfo);
    const fetchMessages = useMessageStore((s) => s.fetchMessages);
    const fetchCommands = useCommandStore((s) => s.fetchCommands);
    const addEventHandler = useEventSourceStore((s) => s.addEventHandler);
    const appendMessage = useMessageStore((s) => s.appendMessage);
    const setCurrentReply = useMessageStore((s) => s.setCurrentReply);

    const prepareMessages = async () => {
        if (!activeChat) return;
        setLoading(true);
        try {
            await fetchMessages(activeChat.id);
        } catch (error) {
            errNotify(error);
        } finally {
            setLoading(false);
        }
    };

    const loadResources = async () => {
        setLoading(true);
        try {
            await Promise.all([fetchInfo(), fetchCommands()]);
            await fetchChats();

            addEventHandler("newSystemResponse", async (e) => {
                const messages = JSON.parse(e.data) as Message[];
                for (const message of messages) {
                    await delay(500); // Need to prevent instant repsponses
                    appendMessage(message);
                    setCurrentReply(message);
                }
            });
        } catch (error) {
            errNotify(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadResources();
    }, []);

    useEffect(() => {
        prepareMessages(); // load messages every time when active chat is changed
    }, [activeChat]);

    return (
        <Flex h="100vh" direction="column" justify="space-between" style={{ overflow: "hidden" }}>
            <LoadingOverlay visible={loading} />

            <Header />
            <Divider />

            <MessageArea />

            <InputArea />
        </Flex>
    );
};
