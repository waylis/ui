import { create } from "zustand";
import type { Config } from "../api/types";
import { api } from "../api/api";
import { setFavicon } from "../utils/document";

interface ConfigStore {
  config: Required<Config>;

  fetchConfig(): Promise<Config>;
}

const defaultConfig: Required<Config> = {
  defaultPageLimit: 20,
  app: {
    name: "Waylis",
    description: "👋 **Welcome**\n\nTo start interacting with the app, pick a command.",
    faviconURL: "",
  },
};

export const useConfigStore = create<ConfigStore>()((set) => ({
  config: defaultConfig,

  async fetchConfig() {
    const c = await api.getConfig();
    const config = { ...c, app: { ...defaultConfig.app, ...c.app } };

    document.title = config.app.name!;
    setFavicon(config.app.faviconURL!);

    set({ config });
    return config;
  },
}));
