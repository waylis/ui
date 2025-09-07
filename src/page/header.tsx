import { ActionIcon, Flex, Menu, Text } from "@mantine/core";
import { ChatList } from "./chat-list";
import { useInfoStore } from "../store/info";
import { IconDots } from "../icons";
import { modals } from "@mantine/modals";
import { spotlight } from "@mantine/spotlight";
import { useChatStore } from "../store/chats";
import { trimLongText } from "../utils/string";

export const Header = () => {
    const info = useInfoStore((s) => s.info);
    const activeChat = useChatStore((s) => s.activeChat);

    return (
        <Flex w="100%" p={4} px="xs" gap={8} justify="space-between" align="center">
            <ChatList />
            <Flex maw="100%" gap={8} justify="center" align="center">
                <Text size="md" lh={0} fw={700}>
                    {info.name}
                </Text>
                {activeChat && <Text size="sm">{`(${trimLongText(activeChat?.name)})`}</Text>}
            </Flex>
            <HeaderMenu />
        </Flex>
    );
};

const HeaderMenu = () => {
    const openSettingsModal = () =>
        modals.openContextModal({
            modal: "settings",
            title: "Settings",
            size: "lg",
            innerProps: undefined,
        });

    return (
        <Menu width={200}>
            <Menu.Target>
                <ActionIcon color="default" variant="transparent">
                    <IconDots />
                </ActionIcon>
            </Menu.Target>

            <Menu.Dropdown>
                <Menu.Item onClick={openSettingsModal}>Settings</Menu.Item>
                <Menu.Item onClick={spotlight.open}>Pick command</Menu.Item>
            </Menu.Dropdown>
        </Menu>
    );
};
