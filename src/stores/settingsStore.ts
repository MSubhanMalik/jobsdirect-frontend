import { create } from "zustand";
import {
  DEFAULT_SITE_SETTINGS,
  mergeSiteSettingsWithDefaults,
} from "@/lib/siteSettings";

interface SettingsState {
  settings: typeof DEFAULT_SITE_SETTINGS;
  isLoaded: boolean;
  setSettings: (raw: Record<string, any>) => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  settings: DEFAULT_SITE_SETTINGS,
  isLoaded: false,
  setSettings: (raw) =>
    set({
      settings: mergeSiteSettingsWithDefaults(raw),
      isLoaded: true,
    }),
}));
