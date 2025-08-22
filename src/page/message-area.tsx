import { Flex, Paper, ScrollArea, Space, Text, useMantineTheme } from "@mantine/core";
import { useEffect, useRef, type FC } from "react";
import type { Command, Message, OptionLimits } from "../api/types";
import { useMessageStore } from "../store/messages";
import { useLighterSchemeColor } from "../hooks/useColors";
import { useCommandStore } from "../store/commands";

export const MessageArea = () => {
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
                            <ChatMessage
                                key={m.id}
                                message={m}
                                messages={messages}
                                commands={commands}
                                primaryColor={theme.primaryColor}
                            />
                        ))}
                    </Flex>
                </ScrollArea>
            )}

            {messages.length === 0 && <WelcomeLabel />}
        </Flex>
    );
};

const WelcomeLabel = () => {
    const bgColor = useLighterSchemeColor();

    return (
        <Flex justify="center" align="center">
            <Paper bg={bgColor} radius="md" p="xl" ta="center">
                <Text fw="bolder" c="dimmed">
                    Welcome
                </Text>
                <Text c="dimmed">To start choose a command</Text>
            </Paper>
        </Flex>
    );
};

interface ChatMessageProps {
    message: Message;
    messages: Message[];
    commands: Command[];
    primaryColor: string;
}

const ChatMessage: FC<ChatMessageProps> = ({ message, messages, commands, primaryColor }) => {
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
            const value = message.body.content;
            if (!message.replyTo) return value;

            const sys = messages.find((m) => m.id === message.replyTo);
            if (!sys) return value;

            return (
                (sys.replyRestriction?.bodyLimits as OptionLimits).options.find((o) => o.value === value)?.label ??
                value
            );
        }

        if (message.body.type === "options") {
            const values = message.body.content;
            if (!message.replyTo) return values;

            const sys = messages.find((m) => m.id === message.replyTo);
            if (!sys) return values;

            let labels: string[] = [];
            for (const value of values) {
                const label =
                    (sys.replyRestriction?.bodyLimits as OptionLimits).options.find((o) => o.value === value)?.label ??
                    value;

                labels.push(label);
            }

            return labels.join(", ");
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
