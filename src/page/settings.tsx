import { useState } from "react";
import {
  Box,
  Button,
  ColorInput,
  CopyButton,
  Fieldset,
  Group,
  Space,
  Switch,
  Text,
  TextInput,
  Tooltip,
  useMantineColorScheme,
  useMantineTheme,
} from "@mantine/core";
import { modals, type ContextModalProps } from "@mantine/modals";
import { useSettingsStore } from "../store/settings";
import { errNotify } from "../utils/notifications";
import { useChatStore } from "../store/chats";
import { api } from "../api/api";

export const AppSettingsModal = (_props: ContextModalProps) => {
  const theme = useMantineTheme();
  const activeChat = useChatStore((s) => s.activeChat);
  const primaryColor = useSettingsStore((s) => s.primaryColor);
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const [isDark, setIsDark] = useState(colorScheme === "dark");
  const setPrimaryColor = useSettingsStore((s) => s.setPrimaryColor);

  const availablePrimaryColors = Object.keys(theme.colors).map((name) => {
    return { name, value: theme.colors[name][6] };
  });

  const primaryColorHex = availablePrimaryColors.find((c) => c.name === primaryColor)?.value ?? theme.colors.blue[6];

  const getAccessLink = (userID: string) => {
    return `${window.location.origin + window.location.pathname}?user_id=${userID}`;
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch (error) {
      errNotify(error);
    }
  };

  const confirmNewUser = () => {
    modals.openConfirmModal({
      title: "Please confirm your action",
      children: (
        <Text size="sm">
          Are you sure you want to generate a new user? To return to the current user, you will need to use the
          corresponding access link.
        </Text>
      ),
      labels: { confirm: "Confirm", cancel: "Cancel" },
      onConfirm: async () => {
        await logout();
        window.location.reload();
      },
    });
  };

  return (
    <>
      <Fieldset legend="Appearance">
        <Switch
          label="Dark theme"
          width="100%"
          withThumbIndicator={false}
          labelPosition="right"
          description="Toggle between dark and light mode for the app."
          checked={isDark}
          color={theme.primaryColor}
          onChange={(event) => {
            const val = event.currentTarget.checked;
            toggleColorScheme();
            setIsDark(val);
          }}
        />
        <Space h={8} />
        <ColorInput
          disallowInput
          withPicker={false}
          label="Primary color"
          description="Choose the main color used for buttons, highlights, and other elements in the app."
          format="hex"
          value={primaryColorHex}
          onChange={(hex) => {
            const found = availablePrimaryColors.find((c) => c.value === hex);
            if (found) setPrimaryColor(found.name);
          }}
          swatches={availablePrimaryColors.map((c) => c.value)}
        />
      </Fieldset>
      <Space h={8} />
      <Fieldset legend="User">
        <TextInput
          label="Current user ID"
          description="Used for signing messages and chats."
          value={activeChat?.creatorID || "unknown"}
        />
        <Space h={8} />
        <Group justify="flex-end" gap={8}>
          <CopyButton value={getAccessLink(activeChat?.creatorID || "")}>
            {({ copied, copy }) => (
              <Tooltip label="Copy the link to instantly access this user">
                <Button disabled={!activeChat} onClick={copy} color="gray" variant="light">
                  {copied ? "Copied" : "Access Link"}
                </Button>
              </Tooltip>
            )}
          </CopyButton>
          <Tooltip label="Generate a new user">
            <Button color="gray" variant="light" onClick={confirmNewUser}>
              New
            </Button>
          </Tooltip>
        </Group>
      </Fieldset>
    </>
  );
};

export const ChatSettingsModal = () => {
  const activeChat = useChatStore((s) => s.activeChat);
  const setActiveChat = useChatStore((s) => s.setActiveChat);
  const renameChat = useChatStore((s) => s.renameChat);
  const [name, setName] = useState(activeChat?.name || "");
  const [loading, setLoading] = useState(false);

  const handleEditChat = async () => {
    if (!activeChat) return;
    setLoading(true);
    try {
      const updated = await renameChat(activeChat.id, name);
      setActiveChat(updated);
      modals.close("chat_settings");
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
        description="Enter a different name for the chat if you want."
        placeholder="Enter chat name"
      />

      <Group mt="md" justify="flex-end">
        <Button disabled={!name || !activeChat} onClick={handleEditChat} loading={loading}>
          Save
        </Button>
      </Group>
    </Box>
  );
};
