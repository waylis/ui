import { useEffect, useRef, useState, type FC } from "react";
import {
  Button,
  Divider,
  FileInput,
  Flex,
  Loader,
  MultiSelect,
  NumberInput,
  Paper,
  Select,
  Textarea,
} from "@mantine/core";
import { Spotlight, spotlight } from "@mantine/spotlight";
import { DateTimePicker } from "@mantine/dates";
import type {
  Chat,
  DatetimeLimits,
  FileLimits,
  FileMeta,
  NumberLimits,
  OptionLimits,
  OptionsLimits,
} from "@waylis/shared";
import { useViewportSize } from "@mantine/hooks";
import { api } from "../api/api";
import { formatBytes } from "../utils/number";
import { useChatStore } from "../store/chats";
import { useCommandStore } from "../store/commands";
import { errNotify, warnNotify } from "../utils/notifications";
import { useMessageStore, type CurrentReply } from "../store/messages";
import { useSettingsStore } from "../store/settings";

const MAX_RESPONSE_WAIT_TIME_MS = 5000;
const MAX_INPUT_AREA_WIDTH = 760;

export const InputArea = () => {
  const [isBlocked, setIsBlocked] = useState(false);
  const unblockTimeout = useRef(0);
  const { width } = useViewportSize();
  const currentReply = useMessageStore((s) => s.currentReply);
  const messages = useMessageStore((s) => s.messages);
  const activeChat = useChatStore((s) => s.activeChat);
  const maxWidth = useSettingsStore((s) => s.maxMessageWidth);

  const handleUnblockInput = () => {
    clearTimeout(unblockTimeout.current);
    setIsBlocked(false);
  };

  useEffect(() => {
    const latest = messages.at(-1);
    if (!latest) return;

    if (latest.senderID === "system") {
      setIsBlocked(false);
    }

    if (latest.senderID !== "system") {
      const timeDiff = Date.now() - new Date(latest.createdAt).getTime();
      if (timeDiff > MAX_RESPONSE_WAIT_TIME_MS) return;

      setIsBlocked(true);
      unblockTimeout.current = window.setTimeout(handleUnblockInput, Math.max(MAX_RESPONSE_WAIT_TIME_MS - timeDiff, 0));
    }

    return handleUnblockInput;
  }, [messages]);

  return (
    <>
      {width < MAX_INPUT_AREA_WIDTH && <Divider />}
      <Flex w="100%" justify="center">
        <Paper
          w="100%"
          maw={Math.min(maxWidth, MAX_INPUT_AREA_WIDTH)}
          p="sm"
          mih={90}
          radius="md"
          style={{ display: "flex", alignItems: "center" }}
        >
          {isBlocked ? (
            <Flex flex={1} justify="center" align="center">
              <Loader variant="dots" type="dots" />
            </Flex>
          ) : (
            <>
              <CommandPicker hidden={!!currentReply?.expected} chat={activeChat} />

              {currentReply?.expected?.bodyType === "text" && (
                <TextForm currentReply={currentReply} chat={activeChat!} />
              )}
              {currentReply?.expected?.bodyType === "number" && (
                <NumberForm currentReply={currentReply} chat={activeChat!} />
              )}
              {currentReply?.expected?.bodyType === "boolean" && (
                <BooleanForm currentReply={currentReply} chat={activeChat!} />
              )}
              {currentReply?.expected?.bodyType === "datetime" && (
                <DatetimeForm currentReply={currentReply} chat={activeChat!} />
              )}
              {currentReply?.expected?.bodyType === "option" && (
                <OptionForm currentReply={currentReply} chat={activeChat!} />
              )}
              {currentReply?.expected?.bodyType === "options" && (
                <OptionsForm currentReply={currentReply} chat={activeChat!} />
              )}
              {currentReply?.expected?.bodyType === "file" && (
                <FileForm currentReply={currentReply} chat={activeChat!} />
              )}
              {currentReply?.expected?.bodyType === "files" && (
                <FilesForm currentReply={currentReply} chat={activeChat!} />
              )}
            </>
          )}
        </Paper>
      </Flex>
    </>
  );
};

const CommandPicker: FC<{ chat: Chat | null; hidden: boolean }> = ({ chat, hidden }) => {
  const commands = useCommandStore((s) => s.commands);
  const sendMessage = useMessageStore((s) => s.sendMessage);
  const createChat = useChatStore((s) => s.createChat);

  const sendCommand = async (value: string) => {
    const currentChat = chat ?? (await createChat("My first chat"));
    await sendMessage({ body: { type: "command", content: value }, chatID: currentChat.id });
  };

  return (
    <Flex display={hidden ? "none" : undefined} w="100%" justify="center">
      <Button onClick={spotlight.open}>Pick command</Button>
      <Spotlight
        centered
        scrollable
        actions={commands.map((cmd) => ({
          id: cmd.value,
          label: cmd.label || cmd.value,
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
        name="text-input"
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
          <Button variant="transparent" pos="absolute" right={0} onClick={() => sendText(value)} loading={loading}>
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
        allowDecimal={!(currentReply.expected?.bodyLimits as NumberLimits)?.integerOnly}
        max={(currentReply.expected?.bodyLimits as NumberLimits)?.max}
        min={(currentReply.expected?.bodyLimits as NumberLimits)?.min}
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
        body: { type: "datetime", content },
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
        minDate={(currentReply.expected?.bodyLimits as DatetimeLimits).min}
        maxDate={(currentReply.expected?.bodyLimits as DatetimeLimits).max}
        w={220}
        value={value}
        onChange={(date) => setValue(date ? new Date(date) : null)}
        placeholder="Pick date and time"
      />
      <Button size="sm" disabled={!value} loading={loading} variant="transparent" onClick={() => sendDatetime(value)}>
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
        flex={1}
        miw={200}
        data={(currentReply.expected?.bodyLimits as OptionLimits).options.map((o) => ({
          value: o.value,
          label: o.label ?? o.value,
        }))}
        comboboxProps={{ position: "top", middlewares: { flip: false, shift: false } }}
        allowDeselect={false}
        searchable
        value={value}
        onChange={setValue}
        placeholder="Pick a value"
      />
      <Button size="sm" disabled={!value} loading={loading} variant="transparent" onClick={() => sendOption(value!)}>
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
        flex={1}
        miw={200}
        data={(currentReply.expected?.bodyLimits as OptionsLimits).options.map((o) => ({
          value: o.value,
          label: o.label ?? o.value,
        }))}
        searchable
        maxValues={(currentReply.expected?.bodyLimits as OptionsLimits).maxAmount}
        comboboxProps={{ position: "top", middlewares: { flip: false, shift: false } }}
        value={value}
        onChange={setValue}
        placeholder={value.length === 0 ? `Pick some values` : undefined}
      />
      <Button size="sm" disabled={!value} loading={loading} variant="transparent" onClick={() => sendOption(value)}>
        OK
      </Button>
    </Flex>
  );
};

const FileForm: FC<FormProps> = ({ chat, currentReply }) => {
  const [loading, setLoading] = useState(false);
  const [value, setValue] = useState<File | null>(null);
  const sendMessage = useMessageStore((s) => s.sendMessage);

  const sendFile = async (file: File) => {
    setLoading(true);
    try {
      const maxSize = (currentReply.expected?.bodyLimits as FileLimits)?.maxSize;
      if (maxSize && file.size > maxSize) {
        warnNotify(`The file is too large. The maximum allowed size is ${formatBytes(maxSize)}.`);
        return;
      }

      const content = await api.uploadFile(file);
      await sendMessage({ body: { type: "file", content }, chatID: chat.id, replyTo: currentReply.to });
    } catch (error) {
      errNotify(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Flex gap={8} w="100%" align="center" justify="center">
      <FileInput
        flex={1}
        miw={200}
        accept={(currentReply.expected?.bodyLimits as FileLimits)?.mimeTypes?.join(",")}
        clearable
        value={value}
        onChange={setValue}
        placeholder="Pick a file"
      />

      <Button size="sm" disabled={!value} loading={loading} variant="transparent" onClick={() => sendFile(value!)}>
        OK
      </Button>
    </Flex>
  );
};

const FilesForm: FC<FormProps> = ({ chat, currentReply }) => {
  const [loading, setLoading] = useState(false);
  const [value, setValue] = useState<File[]>([]);
  const sendMessage = useMessageStore((s) => s.sendMessage);

  const sendFiles = async (files: File[]) => {
    setLoading(true);
    try {
      const maxSize = (currentReply.expected?.bodyLimits as FileLimits)?.maxSize;

      const requests: Promise<FileMeta>[] = [];
      for (const file of files) {
        if (maxSize && file.size > maxSize) {
          warnNotify(`The file "${file.name}" is too large. The maximum allowed size is ${formatBytes(maxSize)}.`);
          return;
        }

        requests.push(api.uploadFile(file));
      }

      const content = await Promise.all(requests);
      await sendMessage({ body: { type: "files", content }, chatID: chat.id, replyTo: currentReply.to });
    } catch (error) {
      errNotify(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Flex gap={8} w="100%" align="center" justify="center">
      <FileInput
        flex={1}
        miw={200}
        accept={(currentReply.expected?.bodyLimits as FileLimits)?.mimeTypes?.join(",")}
        multiple
        clearable
        value={value}
        onChange={setValue}
        placeholder="Pick files"
      />

      <Button size="sm" disabled={!value} loading={loading} variant="transparent" onClick={() => sendFiles(value)}>
        OK
      </Button>
    </Flex>
  );
};
