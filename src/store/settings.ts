import type { MantineColor } from "@mantine/core";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface SettingsStore {
  primaryColor: MantineColor;
  maxMessageWidth: number;
  showMessageTimes: boolean;

  setPrimaryColor: (color: MantineColor | ((prev: MantineColor) => MantineColor)) => void;
  setMaxMessageWidth(width: number): void;
  setShowMessageTimes(show: boolean): void;
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      primaryColor: "blue",
      maxMessageWidth: 760,
      showMessageTimes: true,

      setPrimaryColor: (color) =>
        set((state) => ({
          primaryColor: typeof color === "function" ? color(state.primaryColor) : color,
        })),

      setMaxMessageWidth(width: number) {
        set({ maxMessageWidth: width });
      },

      setShowMessageTimes(show: boolean) {
        set({ showMessageTimes: show });
      },
    }),
    { name: "settings" },
  ),
);
