export interface AppInfo {
    name?: string;
    description?: string;
    faviconURL?: string;
}

export interface Chat {
    id: string;
    name: string;
    creatorID: string;
    createdAt: string;
}

export interface Command {
    value: string;
    label?: string;
    description?: string;
}

export interface TextLimits {
    minLength?: number;
    maxLength?: number;
}

export interface NumberLimits {
    min?: number;
    max?: number;
    integerOnly?: boolean;
}

export interface FileLimits {
    mimeTypes?: string[];
    maxSize?: number;
}

export type FilesLimits = FileLimits & { maxAmount?: number };

export interface Option {
    value: string;
    label?: string;
}

export interface OptionLimits {
    options: Option[];
}

export interface OptionsLimits {
    options: Option[];
    maxAmount?: number;
}

export interface DatetimeLimits {
    min?: string;
    max?: string;
}

export interface FileMeta {
    id: string;
    name: string;
    size: number;
    mimeType: string;
    createdAt: string;
}

type MessageBodyMap = {
    command: string;
    text: string;
    number: number;
    boolean: boolean;
    file: FileMeta;
    files: FileMeta[];
    option: string;
    options: string[];
    datetime: string;
    markdown: string;
};

type MessageBody = {
    [K in keyof MessageBodyMap]: { type: K; content: MessageBodyMap[K] };
}[keyof MessageBodyMap];

type UserMessageBodyType = Exclude<keyof MessageBodyMap, "command" | "markdown">;

type LimitsMap = {
    text: TextLimits;
    number: NumberLimits;
    file: FileLimits;
    files: FilesLimits;
    option: OptionLimits;
    options: OptionsLimits;
    datetime: DatetimeLimits;
};

export type ReplyRestriction<T extends UserMessageBodyType = UserMessageBodyType> = {
    bodyType: T;
    bodyLimits?: T extends keyof LimitsMap ? LimitsMap[T] : never;
};

export interface Message {
    id: string;
    chatID: string;
    senderID: string;
    replyTo?: string;
    threadID: string;
    scene?: string;
    step?: string;
    body: MessageBody;
    replyRestriction?: ReplyRestriction;
    createdAt: string;
}

export type UserMessageBody = Exclude<MessageBody, { type: "markdown" }>;

export type CreateUserMessageParams = Pick<Message, "chatID" | "body" | "replyTo"> & {
    body: UserMessageBody;
};
