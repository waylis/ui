import { Button, Flex, Group, Image, Paper, ScrollArea, Space, Text, useMantineTheme } from "@mantine/core";
import { useEffect, useRef, useState, type FC, type RefObject } from "react";
import type { Command, FileMeta, Message, OptionLimits } from "@waylis/shared";
import { AppInfo } from "./app-info";
import { api } from "../api/api";
import { useChatStore } from "../store/chats";
import { useCommandStore } from "../store/commands";
import { useMessageStore } from "../store/messages";
import { useSettingsStore } from "../store/settings";
import { useLighterSchemeColor } from "../hooks/useColors";
import { formatBytes } from "../utils/number";
import { getMimeCategory } from "../utils/mime";
import { errNotify, warnNotify } from "../utils/notifications";
import { MarkdownPreview } from "../components/markdown-preview";
import ComponentErrorBoundary from "../components/component-error-boundary";
import styles from "./message-area.module.css";

export const MessageArea = () => {
  const isFirstRender = useRef(true);
  const viewport = useRef<HTMLDivElement | null>(null);
  const messages = useMessageStore((s) => s.messages);
  const lastMessageID = useMessageStore((s) => s.lastMessageID);
  const commands = useCommandStore((s) => s.commands);
  const maxWidth = useSettingsStore((s) => s.maxMessageWidth);
  const showMessageTimes = useSettingsStore((s) => s.showMessageTimes);
  const theme = useMantineTheme();

  const scrollToBottom = () => viewport.current?.scrollTo({ top: viewport.current!.scrollHeight, behavior: "smooth" });

  useEffect(() => {
    if (isFirstRender) {
      isFirstRender.current = false;
      setTimeout(() => scrollToBottom(), 300);
      return;
    }

    if (viewport.current) scrollToBottom();
  }, [lastMessageID]);

  return (
    <Flex flex={1} justify="center" style={{ overflowY: "auto" }}>
      {messages.length > 0 && (
        <ScrollArea scrollHideDelay={300} scrollbarSize={8} viewportRef={viewport} w="100%" px="sm">
          <Space h={4} />

          <Flex direction="column" maw={maxWidth} m="0 auto">
            <LoadMoreButton viewport={viewport} />
            {messages.map((message, index) => {
              const nextMessage = messages[index + 1];
              const isNextSystem = message.senderID === "system" && nextMessage?.senderID === "system";
              const isNextNoTimeDiff =
                nextMessage && new Date(nextMessage.createdAt).getTime() - new Date(message.createdAt).getTime() < 1000;

              return (
                <ComponentErrorBoundary>
                  <ChatMessage
                    key={message.id}
                    message={message}
                    messages={messages}
                    commands={commands}
                    primaryColor={theme.primaryColor}
                    withoutTime={!showMessageTimes || (isNextSystem && isNextNoTimeDiff)}
                  />
                </ComponentErrorBoundary>
              );
            })}
          </Flex>
        </ScrollArea>
      )}

      {messages.length === 0 && <AppInfo />}
    </Flex>
  );
};

const LoadMoreButton: FC<{ viewport: RefObject<HTMLDivElement | null> }> = ({ viewport }) => {
  const [loading, setLoading] = useState(false);
  const fetchMessages = useMessageStore((s) => s.fetchMessages);
  const activeChat = useChatStore((s) => s.activeChat);
  const endReached = useMessageStore((s) => s.endReached);

  const handleClick = async () => {
    if (!activeChat) return;
    setLoading(true);
    const prev = viewport.current!.scrollHeight;

    try {
      await fetchMessages(activeChat.id);
      viewport.current!.scrollTo({ top: viewport.current!.scrollHeight - prev });
    } catch (error) {
      errNotify(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Group display={endReached ? "none" : undefined} py="xs" justify="center">
      <Button onClick={handleClick} loading={loading} size="xs" variant="transparent">
        Load more
      </Button>
    </Group>
  );
};

interface ChatMessageProps {
  message: Message;
  messages: Message[];
  commands: Command[];
  primaryColor: string;
  withoutTime?: boolean;
}

function resolveLabels(values: string[], message: Message, messages: Message[]): string[] {
  if (!message.replyTo) return values;

  const sys = messages.find((m) => m.id === message.replyTo);
  if (!sys) return values;

  const options = (sys.replyRestriction?.bodyLimits as OptionLimits).options;
  return values.map((v) => options.find((o) => o.value === v)?.label ?? v);
}

const ChatMessage: FC<ChatMessageProps> = ({ message, messages, commands, primaryColor, withoutTime }) => {
  const isUser = message.senderID !== "system";
  const bgColor = useLighterSchemeColor();
  const isCommand = message.body.type === "command";

  const content = () => {
    if (isCommand) {
      const command = commands.find((c) => c.value === message.body.content);
      return command?.label || command?.value || "Unknown command";
    }

    if (message.body.type === "boolean") return message.body.content ? "Yes" : "No";

    if (message.body.type === "datetime") return new Date(message.body.content).toLocaleString();

    if (message.body.type === "option") {
      return resolveLabels([message.body.content], message, messages)[0];
    }

    if (message.body.type === "options") {
      return resolveLabels(message.body.content, message, messages).join(", ");
    }

    if (message.body.type === "file") {
      return <FilePreview file={message.body.content} />;
    }

    if (message.body.type === "files") {
      return <FilesPreview files={message.body.content} />;
    }

    if (message.body.type === "markdown") {
      return <MarkdownPreview body={message.body.content} />;
    }

    return <Text style={{ overflowWrap: "anywhere" }}>{message.body.content.toString()}</Text>;
  };

  return (
    <Paper bg={isUser ? bgColor : undefined} p="sm" my="xs" radius="md">
      {["file", "files", "markdown", "text"].includes(message.body.type) ? (
        content()
      ) : (
        <Text c={isCommand ? primaryColor : undefined}>{content()}</Text>
      )}

      {!withoutTime && (
        <>
          <Space h={8} />
          <Text c="dimmed" size="xs" ta="right">
            {new Date(message.createdAt).toLocaleString()}
          </Text>
        </>
      )}
    </Paper>
  );
};

const FilePreview: FC<{ file: FileMeta }> = ({ file }) => {
  const [error, setError] = useState(false);
  const url = api.getFileURL(file.id);
  const category = getMimeCategory(file.mimeType);

  const handleDownload = async () => {
    try {
      await api.downloadFile(file.id);
    } catch (error) {
      warnNotify("The file could not be downloaded, it may have been deleted.");
    }
  };

  const FileCard = () => {
    return (
      <Flex gap="xs" align="center">
        <Text className={styles.file_title} fw="bold" onClick={handleDownload}>
          {file.name}
        </Text>
        <Text size="sm" c="dimmed">{`${formatBytes(file.size)}`}</Text>
      </Flex>
    );
  };

  if (error) return FileCard();

  return (
    <>
      {category === "image" && (
        <Image
          fit="contain"
          mah="50vh"
          radius="md"
          src={url}
          fallbackSrc="https://placehold.co/400x40/999/FFF?text=Image+deleted"
        />
      )}

      {category === "video" && (
        <video controls style={{ maxWidth: "100%", height: "auto", display: "block" }} onError={() => setError(true)}>
          <source src={url} type={file.mimeType} />
          Your browser is not support video playback.
        </video>
      )}

      {category === "audio" && (
        <audio controls style={{ width: "100%", display: "block" }} onError={() => setError(true)}>
          <source src={url} type={file.mimeType} />
          Your browser is not support audio playback.
        </audio>
      )}

      {category === "other" && FileCard()}
    </>
  );
};

const FilesPreview: FC<{ files: FileMeta[] }> = ({ files }) => {
  return (
    <Flex direction="column" gap="xs">
      {files.map((file) => (
        <FilePreview key={file.id} file={file} />
      ))}
    </Flex>
  );
};
