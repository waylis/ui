import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";
import "@mantine/notifications/styles.css";
import "@mantine/spotlight/styles.css";
import "./index.css";

import { MantineProvider } from "@mantine/core";
import { ModalsProvider } from "@mantine/modals";
import { Notifications } from "@mantine/notifications";
import { Page } from "./page/page";

export default function App() {
    return (
        <MantineProvider defaultColorScheme="dark" theme={{ primaryColor: "green" }}>
            <ModalsProvider modalProps={{ centered: true, m: 0 }}>
                <Notifications position="top-center" />
                <Page />
            </ModalsProvider>
        </MantineProvider>
    );
}
