import { useEffect } from "react";
import { useSettingsStore } from "@/stores/settingsStore";
import settingsService from "@/services/settings";

// Module-level promise to avoid duplicate fetches across components
let fetchPromise: Promise<void> | null = null;

function ensureSettingsLoaded() {
  if (fetchPromise) return fetchPromise;

  fetchPromise = settingsService
    .getSiteSettings()
    .then((data) => {
      useSettingsStore.getState().setSettings(data || {});
    })
    .catch(() => {
      // On failure, mark as loaded with defaults (already set in store)
      useSettingsStore.setState({ isLoaded: true });
    });

  return fetchPromise;
}

/**
 * Lazy-loads site settings on first use.
 * Returns defaults immediately, then updates once fetched.
 *
 * Shape matches old `appPublicSettings.public_settings` for easy migration.
 */
export function useSiteSettings() {
  const settings = useSettingsStore((s) => s.settings);
  const isLoaded = useSettingsStore((s) => s.isLoaded);

  useEffect(() => {
    if (!isLoaded) {
      ensureSettingsLoaded();
    }
  }, [isLoaded]);

  return { settings, isLoaded };
}

/**
 * Force-refresh settings from the server.
 * Used by Admin panel after saving settings.
 */
export async function refreshSiteSettings() {
  fetchPromise = null;
  try {
    const data = await settingsService.getSiteSettings();
    useSettingsStore.getState().setSettings(data || {});
  } catch {
    // Keep existing settings on refresh failure
  }
}
