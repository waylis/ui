import {
    Box,
    Burger,
    Button,
    CloseButton,
    Drawer,
    Flex,
    Group,
    Paper,
    ScrollArea,
    Space,
    Text,
    TextInput,
    Tooltip,
    useMantineTheme,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useChatStore } from "../store/chats";
import { modals } from "@mantine/modals";
import { errNotify } from "../utils/notifications";
import styles from "./chat-list.module.css";
import { useState, type FC, type MouseEvent } from "react";
import type { Chat } from "../api/types";
import { useMessageStore } from "../store/messages";

export const ChatList = () => {
    const [opened, { open, close }] = useDisclosure(false);
    const chats = useChatStore((s) => s.chats);
    const activeChat = useChatStore((s) => s.activeChat);
    const theme = useMantineTheme();

    const deleteChat = useChatStore((s) => s.deleteChat);
    const setActiveChat = useChatStore((s) => s.setActiveChat);
    const resetMessages = useMessageStore((s) => s.resetMessages);

    const handleActiveChat = (chat: Chat) => {
        close();
        if (chat.id === activeChat?.id) return;

        resetMessages();
        setActiveChat(chat);
    };

    const handleCreateChat = () =>
        modals.open({
            modalId: "new_chat",
            title: "New chat",
            children: <NewChatModal closeList={close} />,
        });

    const handleDeleteChat = async (id: string) => {
        try {
            await deleteChat(id);
            resetMessages();
        } catch (error) {
            errNotify(error);
        }
    };

    const confirmDeleteChat = (e: MouseEvent, id: string) => {
        e.stopPropagation();
        modals.openConfirmModal({
            title: "Please confirm your action",
            children: (
                <Text size="sm">
                    Are you sure you want to delete this chat with all its messages? This action cannot be undone.
                </Text>
            ),
            labels: { confirm: "Confirm", cancel: "Cancel" },
            onConfirm: () => handleDeleteChat(id),
        });
    };

    return (
        <>
            <Drawer opened={opened} onClose={close} title="Your chats" scrollAreaComponent={ScrollArea.Autosize}>
                <Button variant="light" onClick={handleCreateChat} fullWidth>
                    New chat
                </Button>
                <Space h={16} />
                <ScrollArea scrollHideDelay={300} scrollbarSize={8} w="100%">
                    <Flex direction="column" gap="xs">
                        {chats.map((chat) => (
                            <Paper key={chat.id} className={styles.item} p={4} onClick={() => handleActiveChat(chat)}>
                                <Flex align="center" justify="space-between">
                                    <Text c={activeChat?.id === chat.id ? theme.primaryColor : undefined}>
                                        {chat.name}
                                    </Text>
                                    <Tooltip label="Delete">
                                        <CloseButton c="dimmed" onClick={(e) => confirmDeleteChat(e, chat.id)} />
                                    </Tooltip>
                                </Flex>
                                <Text size="sm" c="dimmed">
                                    {new Date(chat.createdAt).toLocaleString()}
                                </Text>
                            </Paper>
                        ))}
                    </Flex>
                </ScrollArea>
                <LoadMoreButton />
            </Drawer>

            <Burger onClick={open} size="sm" />
        </>
    );
};

const NewChatModal: FC<{ closeList: () => void }> = ({ closeList }) => {
    const [name, setName] = useState("");
    const [loading, setLoading] = useState(false);
    const createChat = useChatStore((s) => s.createChat);
    const setActiveChat = useChatStore((s) => s.setActiveChat);
    const resetMessages = useMessageStore((s) => s.resetMessages);

    const handleCreateChat = async () => {
        setLoading(true);
        try {
            const chat = await createChat(name || undefined);
            resetMessages();
            setActiveChat(chat);

            modals.close("new_chat");
            closeList();
        } catch (error) {
            errNotify(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box>
            <TextInput
                value={name}
                onChange={(event) => setName(event.currentTarget.value)}
                label="Name"
                placeholder="Enter chat name if you want"
            />

            <Group mt="md" justify="flex-end">
                <Button onClick={handleCreateChat} loading={loading}>
                    Create
                </Button>
            </Group>
        </Box>
    );
};

const LoadMoreButton = () => {
    const [loading, setLoading] = useState(false);
    const fetchChats = useChatStore((s) => s.fetchChats);
    const endReached = useChatStore((s) => s.endReached);

    const handleClick = async () => {
        setLoading(true);
        try {
            await fetchChats();
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
