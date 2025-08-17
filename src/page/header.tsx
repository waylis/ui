import { Button, Flex, Text } from "@mantine/core";
import { ChatList } from "./chat-list";

export const Header = () => {
    return (
        <Flex w="100%" p={4} justify="space-between" align="center">
            <ChatList />
            <Text></Text>
            <Button variant="transparent">&#x2022;&#x2022;&#x2022;</Button>
        </Flex>
    );
};
