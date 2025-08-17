import { Box, Button, Flex, Paper, Textarea } from "@mantine/core";
import { useState, type FC } from "react";
import { useMessageStore, type CurrentReply } from "../store/messages";
import type { Chat } from "../api/types";
import { useChatStore } from "../store/chats";
import { useCommandStore } from "../store/commands";
import { Spotlight, spotlight } from "@mantine/spotlight";
import { errNotify } from "../utils/notifications";

export const InputArea = () => {
    const currentReply = useMessageStore((s) => s.currentReply);
    const activeChat = useChatStore((s) => s.activeChat);

    return (
        <Flex w="100%" justify="center" pb="xs">
            <Paper w="100%" maw={765} p="sm" mih={100} radius="md" style={{ display: "flex", alignItems: "center" }}>
                {!currentReply?.restriction && <CommandPicker chat={activeChat} />}
                {currentReply?.restriction?.bodyType === "text" && (
                    <TextInput currentReply={currentReply} chat={activeChat!} />
                )}
            </Paper>
        </Flex>
    );
};

const TextInput: FC<{ chat: Chat; currentReply: CurrentReply }> = ({ chat, currentReply }) => {
    const [loading, setLoading] = useState(false);
    const [content, setContent] = useState("");
    const sendMessage = useMessageStore((s) => s.sendMessage);

    const sendText = async (content: string) => {
        setLoading(true);
        try {
            await sendMessage({ body: { type: "text", content }, chatID: chat.id, replyTo: currentReply.to });
        } catch (error) {
            errNotify(error);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyPress = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            if (content.length > 0) sendText(content);
        }
    };

    return (
        <Flex gap={8} w="100%" align="center">
            <Textarea
                variant="filled"
                w="100%"
                autoFocus
                value={content}
                onChange={(event) => setContent(event.currentTarget.value)}
                minRows={2}
                maxRows={6}
                autosize
                onKeyDown={handleKeyPress}
            />
            <Button onClick={() => sendText(content)} loading={loading}>
                OK
            </Button>
        </Flex>
    );
};

const CommandPicker: FC<{ chat: Chat | null }> = ({ chat }) => {
    const commands = useCommandStore((s) => s.commands);
    const sendMessage = useMessageStore((s) => s.sendMessage);
    const createChat = useChatStore((s) => s.createChat);

    const sendCommand = async (value: string) => {
        const currentChat = chat ?? (await createChat("My first chat"));
        await sendMessage({ body: { type: "command", content: value }, chatID: currentChat.id });
    };

    return (
        <Box w="100%">
            <Button fullWidth onClick={spotlight.open}>
                Choose command
            </Button>
            <Spotlight
                centered
                actions={commands.map((cmd) => ({
                    id: cmd.value,
                    label: cmd.label,
                    description: cmd.description,
                    onClick: () => sendCommand(cmd.value),
                }))}
                nothingFound="Nothing found..."
                highlightQuery
                searchProps={{ placeholder: "Search..." }}
            />
        </Box>
    );
};
