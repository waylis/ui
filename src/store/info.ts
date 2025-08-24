import { create } from "zustand";
import type { AppInfo } from "../api/types";
import { api } from "../api/api";
import { setFavicon } from "../utils/document";

interface InfoStore {
    info: Required<AppInfo>;

    fetchInfo(): Promise<AppInfo>;
}

const defaultInfo: Required<AppInfo> = {
    name: "Chat",
    description: "To start pick a command",
    faviconURL: "",
};

export const useInfoStore = create<InfoStore>()((set) => ({
    info: defaultInfo,

    async fetchInfo() {
        const appInfo = await api.getAppInfo();
        const info = { ...defaultInfo, ...appInfo };

        document.title = info.name;
        setFavicon(info.faviconURL);

        set({ info });
        return info;
    },
}));
