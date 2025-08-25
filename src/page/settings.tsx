import {
  ColorSwatch,
  Flex,
  Group,
  Switch,
  Text,
  useMantineColorScheme,
  useMantineTheme,
} from "@mantine/core";
import { type ContextModalProps } from "@mantine/modals";
import { useState } from "react";
import { useSettingsStore } from "../store/settings";

export const SettingsModal = (_props: ContextModalProps) => {
  const theme = useMantineTheme();
  // const primaryColor = useSettingsStore((s) => s.primaryColor);
  const setPrimaryColor = useSettingsStore((s) => s.setPrimaryColor);
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const [isDark, setIsDark] = useState(colorScheme === "dark");
  return (
    <>
      <Flex justify="space-between">
        <Text>Enable dark theme</Text>

        <Switch
          width="100%"
          labelPosition="left"
          size="md"
          checked={isDark}
          color={theme.primaryColor}
          onChange={(event) => {
            const val = event.currentTarget.checked;
            toggleColorScheme();
            setIsDark(val);
          }}
        />
      </Flex>

      <Text mt="md">Change primary color</Text>
      <Group gap="xs" mt="sm">
        {Object.keys(theme.colors)
          .reverse()
          .map((color) => (
            <ColorSwatch
              radius="xs"
              size={theme.primaryColor === color ? 36 : 28}
              key={color}
              color={theme.colors[color][6]}
              onClick={() => {
                setPrimaryColor(color);
              }}
              style={{
                cursor: "pointer",
              }}
            />
          ))}
      </Group>
    </>
  );
};
