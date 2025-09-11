import type { Message, UserMessageBody } from "@waylis/shared";

export interface AppInfo {
  name?: string;
  description?: string;
  faviconURL?: string;
}

export type CreateUserMessageParams = Pick<Message, "chatID" | "body" | "replyTo"> & {
  body: UserMessageBody;
};
