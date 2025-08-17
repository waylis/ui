import { useMantineColorScheme, useMantineTheme } from "@mantine/core";

export const useDarkenSchemeColor = () => {
    const scheme = useMantineColorScheme();
    const theme = useMantineTheme();

    const color = scheme.colorScheme === "dark" ? theme.colors.dark[6] : theme.colors.gray[1];
    return color;
};

export const useSchemeColor = () => {
    const scheme = useMantineColorScheme();
    const theme = useMantineTheme();

    const color = scheme.colorScheme === "dark" ? theme.colors.dark[7] : theme.white;
    return color;
};
