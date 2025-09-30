import { useEffect, useState } from "react";
import { Divider, Flex, LoadingOverlay } from "@mantine/core";
import type { Message } from "@waylis/shared";
import { Header } from "./header";
import { delay } from "../utils/async";
import { InputArea } from "./input-area";
import { useConfigStore } from "../store/config";
import { MessageArea } from "./message-area";
import { useChatStore } from "../store/chats";
import { useCommandStore } from "../store/commands";
import { useMessageStore } from "../store/messages";
import { errNotify } from "../utils/notifications";
import { useEventSourceStore } from "../store/events";

const SYSTEM_RESPONSE_DELAY_MS = 500;

export const Page = () => {
  const [loading, setLoading] = useState(false);
  const setChatPageLimit = useChatStore((s) => s.setPageLimit);
  const fetchChats = useChatStore((s) => s.fetchChats);
  const activeChat = useChatStore((s) => s.activeChat);
  const fetchConfig = useConfigStore((s) => s.fetchConfig);
  const setMessagePageLimit = useMessageStore((s) => s.setPageLimit);
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
      const [config] = await Promise.all([fetchConfig(), fetchCommands()]);

      setMessagePageLimit(config.defaultPageLimit);
      setChatPageLimit(config.defaultPageLimit);

      await fetchChats();

      addEventHandler("newSystemResponse", async (e) => {
        const messages = JSON.parse(e.data) as Message[];
        let lastAt = useMessageStore.getState().lastUserReplyAt || new Date();

        for (const message of messages) {
          const diff = Date.now() - lastAt.getTime();
          if (diff < SYSTEM_RESPONSE_DELAY_MS) {
            await delay(SYSTEM_RESPONSE_DELAY_MS - diff);
          }

          appendMessage(message);
          setCurrentReply(message);
          lastAt = new Date();
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
