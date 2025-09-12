import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";
import "@mantine/notifications/styles.css";
import "@mantine/spotlight/styles.css";
import "./index.css";

import { MantineProvider } from "@mantine/core";
import { ModalsProvider } from "@mantine/modals";
import { Notifications } from "@mantine/notifications";
import { Page } from "./page/page";
import { ChatSettingsModal, AppSettingsModal } from "./page/settings";
import { useSettingsStore } from "./store/settings";

export default function App() {
  const primaryColor = useSettingsStore((s) => s.primaryColor);

  return (
    <MantineProvider defaultColorScheme="dark" theme={{ primaryColor }}>
      <ModalsProvider
        modalProps={{ centered: true, m: 0 }}
        modals={{ appSettings: AppSettingsModal, chatSettings: ChatSettingsModal }}
      >
        <Notifications position="top-center" />
        <Page />
      </ModalsProvider>
    </MantineProvider>
  );
}
