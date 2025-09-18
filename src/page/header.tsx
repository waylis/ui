import { ActionIcon, Flex, Menu, Text } from "@mantine/core";
import { modals } from "@mantine/modals";
import { spotlight } from "@mantine/spotlight";
import { ChatList } from "./chat-list";
import { IconDots } from "../icons";
import { useConfigStore } from "../store/config";
import { useChatStore } from "../store/chats";
import { trimLongText } from "../utils/string";
import { MarkdownPreview } from "../components/markdown-preview";

export const Header = () => {
  const config = useConfigStore((s) => s.config);
  const activeChat = useChatStore((s) => s.activeChat);

  const openAppInfo = () => {
    modals.open({
      title: <Text fw={700}>{config.app.name}</Text>,
      children: <MarkdownPreview body={config.app.description || ""} />,
      size: "lg",
    });
  };

  return (
    <Flex w="100%" p={8} px="xs" gap={8} justify="space-between" align="center">
      <ChatList />
      <Flex maw="100%" gap={8} justify="center" align="center">
        <Text onClick={openAppInfo} size="md" lh={0} fw={700} style={{ cursor: "pointer" }}>
          {config.app.name}
        </Text>
        {activeChat && <Text size="sm" c="dimmed">{`${trimLongText(activeChat?.name)}`}</Text>}
      </Flex>
      <HeaderMenu />
    </Flex>
  );
};

const HeaderMenu = () => {
  const openAppSettingsModal = () =>
    modals.openContextModal({
      modal: "appSettings",
      title: "Settings",
      size: "lg",
      innerProps: undefined,
    });

  const openChatSettingsModal = () =>
    modals.openContextModal({
      modalId: "chat_settings",
      modal: "chatSettings",
      title: "Chat settings",
      size: "md",
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
        <Menu.Item onClick={openAppSettingsModal}>App Settings</Menu.Item>
        <Menu.Item onClick={openChatSettingsModal}>Chat Settings</Menu.Item>
        <Menu.Item onClick={spotlight.open}>Commands</Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
};
