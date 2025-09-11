import type { MantineColor } from "@mantine/core";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface SettingsStore {
  primaryColor: MantineColor;
  setPrimaryColor: (color: MantineColor | ((prev: MantineColor) => MantineColor)) => void;
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      primaryColor: "blue",

      setPrimaryColor: (color) =>
        set((state) => ({
          primaryColor: typeof color === "function" ? color(state.primaryColor) : color,
        })),
    }),
    { name: "settings" },
  ),
);
