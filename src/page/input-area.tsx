import { Button, Flex, MultiSelect, NumberInput, Paper, Select, Textarea } from "@mantine/core";
import { useState, type FC } from "react";
import { useMessageStore, type CurrentReply } from "../store/messages";
import type { Chat, DatetimeLimits, NumberLimits, OptionLimits, OptionsLimits } from "../api/types";
import { useChatStore } from "../store/chats";
import { useCommandStore } from "../store/commands";
import { Spotlight, spotlight } from "@mantine/spotlight";
import { errNotify, warnNotify } from "../utils/notifications";
import { DateTimePicker } from "@mantine/dates";

export const InputArea = () => {
    const currentReply = useMessageStore((s) => s.currentReply);
    const activeChat = useChatStore((s) => s.activeChat);

    return (
        <Flex w="100%" justify="center" pb="xs">
            <Paper w="100%" maw={765} p="sm" mih={100} radius="md" style={{ display: "flex", alignItems: "center" }}>
                {!currentReply?.restriction && <CommandPicker chat={activeChat} />}
                {currentReply?.restriction?.bodyType === "text" && (
                    <TextForm currentReply={currentReply} chat={activeChat!} />
                )}
                {currentReply?.restriction?.bodyType === "number" && (
                    <NumberForm currentReply={currentReply} chat={activeChat!} />
                )}
                {currentReply?.restriction?.bodyType === "boolean" && (
                    <BooleanForm currentReply={currentReply} chat={activeChat!} />
                )}
                {currentReply?.restriction?.bodyType === "datetime" && (
                    <DatetimeForm currentReply={currentReply} chat={activeChat!} />
                )}
                {currentReply?.restriction?.bodyType === "option" && (
                    <OptionForm currentReply={currentReply} chat={activeChat!} />
                )}
                {currentReply?.restriction?.bodyType === "options" && (
                    <OptionsForm currentReply={currentReply} chat={activeChat!} />
                )}
            </Paper>
        </Flex>
    );
};

const CommandPicker: FC<{ chat: Chat | null }> = ({ chat }) => {
    const commands = useCommandStore((s) => s.commands);
    const sendMessage = useMessageStore((s) => s.sendMessage);
    const createChat = useChatStore((s) => s.createChat);

    const sendCommand = async (value: string) => {
        const currentChat = chat ?? (await createChat("My first chat"));
        await sendMessage({ body: { type: "command", content: value }, chatID: currentChat.id });
    };

    return (
        <Flex w="100%" justify="center">
            <Button onClick={spotlight.open}>Choose command</Button>
            <Spotlight
                centered
                actions={commands.map((cmd) => ({
                    id: cmd.value,
                    label: cmd.label,
                    description: cmd.description,
                    onClick: () => sendCommand(cmd.value),
                }))}
                nothingFound="Nothing found..."
                highlightQuery
                searchProps={{ placeholder: "Search..." }}
            />
        </Flex>
    );
};

interface FormProps {
    chat: Chat;
    currentReply: CurrentReply;
}

const TextForm: FC<FormProps> = ({ chat, currentReply }) => {
    const [loading, setLoading] = useState(false);
    const [value, setValue] = useState("");
    const sendMessage = useMessageStore((s) => s.sendMessage);

    const sendText = async (content: string) => {
        setLoading(true);
        try {
            await sendMessage({ body: { type: "text", content }, chatID: chat.id, replyTo: currentReply.to });
        } catch (error) {
            errNotify(error);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyPress = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            if (value.length > 0) sendText(value);
        }
    };

    return (
        <Flex gap={8} w="100%" align="center" pos="relative">
            <Textarea
                variant="filled"
                w="100%"
                autoFocus
                value={value}
                onChange={(event) => setValue(event.currentTarget.value)}
                minRows={2}
                maxRows={6}
                size="md"
                autosize
                onKeyDown={handleKeyPress}
                rightSection={
                    <Button
                        variant="transparent"
                        pos="absolute"
                        right={0}
                        onClick={() => sendText(value)}
                        loading={loading}
                    >
                        OK
                    </Button>
                }
            />
        </Flex>
    );
};

const NumberForm: FC<FormProps> = ({ chat, currentReply }) => {
    const [value, setValue] = useState<string | number>("");
    const [loading, setLoading] = useState(false);
    const sendMessage = useMessageStore((s) => s.sendMessage);

    const sendNumber = async (content: number) => {
        setLoading(true);
        try {
            await sendMessage({ body: { type: "number", content }, chatID: chat.id, replyTo: currentReply.to });
        } catch (error) {
            errNotify(error);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            if (value !== "") sendNumber(+value);
        }
    };

    return (
        <Flex gap={8} w="100%" align="center" justify="center">
            <NumberInput
                allowDecimal={!(currentReply.restriction?.bodyLimits as NumberLimits)?.integerOnly}
                max={(currentReply.restriction?.bodyLimits as NumberLimits)?.max}
                min={(currentReply.restriction?.bodyLimits as NumberLimits)?.min}
                autoCorrect="off"
                autoComplete="off"
                size="md"
                value={value}
                onChange={setValue}
                placeholder="Enter a number"
                onKeyDown={handleKeyPress}
            />
            <Button
                size="md"
                disabled={value === ""}
                loading={loading}
                variant="transparent"
                onClick={() => sendNumber(+value)}
            >
                OK
            </Button>
        </Flex>
    );
};

const BooleanForm: FC<FormProps> = ({ chat, currentReply }) => {
    const [loading, setLoading] = useState(false);
    const sendMessage = useMessageStore((s) => s.sendMessage);

    const sendBoolean = async (content: boolean) => {
        setLoading(true);
        try {
            await sendMessage({ body: { type: "boolean", content }, chatID: chat.id, replyTo: currentReply.to });
        } catch (error) {
            errNotify(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Flex gap={8} w="100%" align="center" justify="center">
            <Button onClick={() => sendBoolean(true)} loading={loading} variant="light" w="90px" color="green">
                Yes
            </Button>
            <Button onClick={() => sendBoolean(false)} loading={loading} variant="light" w="90px" color="red">
                No
            </Button>
        </Flex>
    );
};

const DatetimeForm: FC<FormProps> = ({ chat, currentReply }) => {
    const [loading, setLoading] = useState(false);
    const [value, setValue] = useState<Date | null>(null);
    const sendMessage = useMessageStore((s) => s.sendMessage);

    const sendDatetime = async (content: Date | null) => {
        if (!content) {
            warnNotify("Please specify the date and time");
            return;
        }

        setLoading(true);
        try {
            await sendMessage({
                body: { type: "datetime", content: content.toISOString() },
                chatID: chat.id,
                replyTo: currentReply.to,
            });
        } catch (error) {
            errNotify(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Flex gap={8} w="100%" align="center" justify="center">
            <DateTimePicker
                minDate={(currentReply.restriction?.bodyLimits as DatetimeLimits).min}
                maxDate={(currentReply.restriction?.bodyLimits as DatetimeLimits).max}
                w={220}
                value={value}
                onChange={(date) => setValue(date ? new Date(date) : null)}
                placeholder="Pick date and time"
            />
            <Button
                size="sm"
                disabled={!value}
                loading={loading}
                variant="transparent"
                onClick={() => sendDatetime(value)}
            >
                OK
            </Button>
        </Flex>
    );
};

const OptionForm: FC<FormProps> = ({ chat, currentReply }) => {
    const [loading, setLoading] = useState(false);
    const [value, setValue] = useState<string | null>(null);
    const sendMessage = useMessageStore((s) => s.sendMessage);

    const sendOption = async (content: string) => {
        setLoading(true);
        try {
            await sendMessage({ body: { type: "option", content }, chatID: chat.id, replyTo: currentReply.to });
        } catch (error) {
            errNotify(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Flex gap={8} w="100%" align="center" justify="center">
            <Select
                miw={200}
                data={(currentReply.restriction?.bodyLimits as OptionLimits).options.map((o) => ({
                    value: o.value,
                    label: o.label ?? o.value,
                }))}
                comboboxProps={{ position: "top", middlewares: { flip: false, shift: false } }}
                allowDeselect={false}
                value={value}
                onChange={setValue}
                placeholder="Pick a value"
            />
            <Button
                size="sm"
                disabled={!value}
                loading={loading}
                variant="transparent"
                onClick={() => sendOption(value!)}
            >
                OK
            </Button>
        </Flex>
    );
};

const OptionsForm: FC<FormProps> = ({ chat, currentReply }) => {
    const [loading, setLoading] = useState(false);
    const [value, setValue] = useState<string[]>([]);
    const sendMessage = useMessageStore((s) => s.sendMessage);

    const sendOption = async (content: string[]) => {
        setLoading(true);
        try {
            await sendMessage({ body: { type: "options", content }, chatID: chat.id, replyTo: currentReply.to });
        } catch (error) {
            errNotify(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Flex gap={8} w="100%" align="center" justify="center">
            <MultiSelect
                miw={200}
                data={(currentReply.restriction?.bodyLimits as OptionsLimits).options.map((o) => ({
                    value: o.value,
                    label: o.label ?? o.value,
                }))}
                maxValues={(currentReply.restriction?.bodyLimits as OptionsLimits).maxAmount}
                comboboxProps={{ position: "top", middlewares: { flip: false, shift: false } }}
                value={value}
                onChange={setValue}
                placeholder={value.length === 0 ? `Pick some values` : undefined}
            />
            <Button
                size="sm"
                disabled={!value}
                loading={loading}
                variant="transparent"
                onClick={() => sendOption(value)}
            >
                OK
            </Button>
        </Flex>
    );
};
