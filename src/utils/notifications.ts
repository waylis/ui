import { notifications } from "@mantine/notifications";

const handleErr = (err: unknown) => {
    return String(err).replace("Error: ", "");
};

export const errNotify = (err: string | unknown) => {
    const message = typeof err === "string" ? err : handleErr(err);

    notifications.show({
        message,
        withBorder: true,
        withCloseButton: true,
        autoClose: 20_000,
        color: "red",
    });

    console.error(message);
};

export const okNotify = (message: string) => {
    notifications.show({
        message,
        withBorder: true,
        withCloseButton: true,
        color: "green",
    });
};

export const infoNotify = (message: string) => {
    notifications.show({
        message,
        withBorder: true,
        withCloseButton: true,
        color: "blue",
    });

    console.info(message);
};

export const warnNotify = (message: string) => {
    notifications.show({
        message,
        withBorder: true,
        withCloseButton: true,
        color: "yellow",
        autoClose: 9000,
    });

    console.warn(message);
};
