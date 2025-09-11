import { getQueryParam, setQueryParam } from "../utils/url";
import type { Chat, Command, FileMeta, Message } from "@waylis/shared";
import { getFileNameFromContentDisposition, jsonRequestParams, queryParams } from "./utils";
import type { AppInfo, CreateUserMessageParams } from "./types";
import { jsonDateReviver } from "../utils/date";

class API {
  host: string;
  prefix: string;

  constructor(params: { host: string; prefix: string }) {
    this.host = (params.host ?? "").replace(/\/+$/g, "");
    const p = params.prefix ?? "/";
    this.prefix = p.startsWith("/") ? p : "/" + p;
  }

  get url(): string {
    return `${this.host}${this.prefix}`;
  }

  endpoint(path: string): string {
    const p = path.startsWith("/") ? path : "/" + path;
    return `${this.url.replace(/\/+$/g, "")}${p}`;
  }

  async auth(userID: string | null) {
    const url = this.endpoint("auth") + queryParams({ id: userID });
    if (userID) setQueryParam("user_id", null);

    return this.makeRequest(url, { method: "POST" });
  }

  async logout() {
    const url = this.endpoint("logout");
    return this.makeRequest(url, { method: "POST" });
  }

  async getAppInfo() {
    const url = this.endpoint("info");
    return this.makeRequest<AppInfo>(url);
  }

  async getCommands() {
    const url = this.endpoint("commands");
    return this.makeRequest<Command[]>(url);
  }

  async sendMessage(params: CreateUserMessageParams) {
    const url = this.endpoint("message");
    return this.makeRequest<Message>(url, jsonRequestParams("POST", params));
  }

  async getChats(offset?: number, limit?: number) {
    const url = this.endpoint("chats") + queryParams({ offset, limit });
    return this.makeRequest<Chat[]>(url);
  }

  async createChat(name?: string) {
    const url = this.endpoint("chat");
    return this.makeRequest<Chat>(url, jsonRequestParams("POST", { name }));
  }

  async getMessages(chat_id: string, offset?: number, limit?: number) {
    const url = this.endpoint("messages") + queryParams({ chat_id, offset, limit });
    return this.makeRequest<Message[]>(url);
  }

  async deleteChat(id: string) {
    const url = this.endpoint("chat") + queryParams({ id });
    return this.makeRequest<Chat>(url, jsonRequestParams("DELETE", {}));
  }

  getFileURL(id: string) {
    const url = this.endpoint("file") + queryParams({ id });
    return url;
  }

  async downloadFile(id: string) {
    const url = this.endpoint("file") + queryParams({ id });
    const res = await fetch(url);

    if (!res.ok) throw new Error(`Download failed: ${res.status} ${res.statusText}`);

    const cd = res.headers.get("Content-Disposition") || "";
    const filename = getFileNameFromContentDisposition(cd) || "download";
    const blob = await res.blob();
    const link = document.createElement("a");

    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();

    setTimeout(() => URL.revokeObjectURL(link.href), 5000);
  }

  async uploadFile(file: File) {
    const url = this.endpoint("file");
    const filename = file.name;

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": file.type, "X-Filename": filename },
      body: file,
    });

    if (!res.ok) throw new Error(`Upload failed: ${res.statusText}`);
    return (await res.json()) as FileMeta;
  }

  private async makeRequest<T>(url: string, params: RequestInit = {}): Promise<T> {
    let resp = await fetch(url, params);

    const userID = getQueryParam("user_id");
    const needsAuth = !!userID || resp.status === 401;

    if (needsAuth) await this.auth(userID);
    if (resp.status === 401) resp = await fetch(url, params); // Retry

    if (resp.status === 500) {
      throw new Error("The server is unavailable. Please try again later.");
    }

    if (!resp.ok) {
      const body: { message: string } = await resp.json();
      throw new Error(body.message);
    }

    const json = await resp.text();
    return JSON.parse(json, jsonDateReviver);
  }
}

export const api = new API({ host: "", prefix: "/api" });
