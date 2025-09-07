import { ActionIcon, Flex, Menu, Text } from "@mantine/core";
import { ChatList } from "./chat-list";
import { useInfoStore } from "../store/info";
import { IconDots } from "../icons";
import { modals } from "@mantine/modals";
import { spotlight } from "@mantine/spotlight";

export const Header = () => {
    const info = useInfoStore((s) => s.info);

    return (
        <Flex w="100%" p={4} px="xs" justify="space-between" align="center">
            <ChatList />
            <Text size="md" lh={0} fw={700}>
                {info.name}
            </Text>
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
