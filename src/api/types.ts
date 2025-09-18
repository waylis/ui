import type { Message, ServerConfig, UserMessageBody } from "@waylis/shared";

export type Config = Pick<ServerConfig, "app">;

export type CreateUserMessageParams = Pick<Message, "chatID" | "body" | "replyTo"> & {
  body: UserMessageBody;
};
