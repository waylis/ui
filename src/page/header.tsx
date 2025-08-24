import { Button, Flex, Text } from "@mantine/core";
import { ChatList } from "./chat-list";
import { useInfoStore } from "../store/info";

export const Header = () => {
    const info = useInfoStore((s) => s.info);

    return (
        <Flex w="100%" p={4} justify="space-between" align="center">
            <ChatList />
            <Text size="md" lh={0} fw={700}>
                {info.name}
            </Text>
            <Button variant="transparent">&#x2022;&#x2022;&#x2022;</Button>
        </Flex>
    );
};
