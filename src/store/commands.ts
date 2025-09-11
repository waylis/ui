import { create } from "zustand";
import type { Command } from "@waylis/shared";
import { api } from "../api/api";

interface CommandStore {
  commands: Command[];

  fetchCommands(): Promise<Command[]>;
}

export const useCommandStore = create<CommandStore>()((set) => ({
  commands: [],

  async fetchCommands() {
    const commands = await api.getCommands();
    set({ commands });
    return commands;
  },
}));
