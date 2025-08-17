import { Flex, Paper, ScrollArea, Space, Text, useMantineTheme } from "@mantine/core";
import { useEffect, useRef, type FC } from "react";
import type { Command, Message } from "../api/types";
import { useMessageStore } from "../store/messages";
import { useDarkenSchemeColor } from "../hooks/useColors";
import { useCommandStore } from "../store/commands";

export const ChatArea = () => {
    const viewport = useRef<HTMLDivElement | null>(null);
    const messages = useMessageStore((s) => s.messages);
    const commands = useCommandStore((s) => s.commands);
    const theme = useMantineTheme();

    const scrollToBottom = () =>
        viewport.current!.scrollTo({ top: viewport.current!.scrollHeight, behavior: "smooth" });

    useEffect(() => {
        if (viewport.current) scrollToBottom();
    }, [messages]);

    return (
        <Flex flex={1} justify="center" style={{ overflowY: "auto" }}>
            {messages.length > 0 && (
                <ScrollArea scrollHideDelay={300} scrollbarSize={8} viewportRef={viewport} w="100%" px="sm">
                    <Flex direction="column" maw={765} m="0 auto">
                        {messages.map((m) => (
                            <ChatMessage key={m.id} message={m} commands={commands} primaryColor={theme.primaryColor} />
                        ))}
                    </Flex>
                </ScrollArea>
            )}

            <Flex justify="center" align="center">
                {messages.length === 0 && (
                    <Paper radius="md" p="xl" ta="center">
                        <Text fw="bolder" c="dimmed">
                            Welcome
                        </Text>
                        <Text c="dimmed">To start choose a command</Text>
                    </Paper>
                )}
            </Flex>
        </Flex>
    );
};

interface ChatMessageProps {
    message: Message;
    commands: Command[];
    primaryColor: string;
}

const ChatMessage: FC<ChatMessageProps> = ({ message, commands, primaryColor }) => {
    const isUser = message.senderID !== "system";
    const bgColor = useDarkenSchemeColor();
    const isCommand = message.body.type === "command";

    const content = () => {
        if (isCommand) {
            const command = commands.find((c) => c.value === message.body.content);
            return command?.label || command?.value || "Unknown command";
        }

        return message.body.content as string;
    };

    return (
        <Paper bg={isUser ? bgColor : undefined} p="sm" my="xs" radius="md">
            <Text c={isCommand ? primaryColor : undefined}>{content()}</Text>
            <Space h={8} />
            <Text c="dimmed" size="xs" ta="right">
                {new Date(message.createdAt).toLocaleString()}
            </Text>
        </Paper>
    );
};
