import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { APIConfig } from '@/lib/api/api-config';
import { getAPIConfig } from '@/lib/api/api-config';

interface SettingsState {
  // Runtime API configuration (overrides env vars)
  apiConfig: APIConfig | null;
  
  // Actions
  setAPIConfig: (config: Partial<APIConfig>) => void;
  updateUnshackleConfig: (config: Partial<APIConfig['unshackle']>) => void;
  updateTMDBConfig: (config: Partial<APIConfig['tmdb']>) => void;
  resetToDefaults: () => void;
  getEffectiveConfig: () => APIConfig;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      apiConfig: null,

      setAPIConfig: (config) => {
        const current = get().apiConfig || getAPIConfig();
        set({
          apiConfig: {
            ...current,
            ...config,
          },
        });
      },

      updateUnshackleConfig: (config) => {
        const current = get().apiConfig || getAPIConfig();
        set({
          apiConfig: {
            ...current,
            unshackle: {
              ...current.unshackle,
              ...config,
            },
          },
        });
      },

      updateTMDBConfig: (config) => {
        const current = get().apiConfig || getAPIConfig();
        set({
          apiConfig: {
            ...current,
            tmdb: {
              ...current.tmdb,
              ...config,
            },
          },
        });
      },

      resetToDefaults: () => {
        set({ apiConfig: null });
      },

      getEffectiveConfig: () => {
        const stored = get().apiConfig;
        const env = getAPIConfig();
        
        if (!stored) return env;
        
        // Merge stored config with env config, preferring stored values
        return {
          unshackle: {
            ...env.unshackle,
            ...stored.unshackle,
          },
          tmdb: {
            ...env.tmdb,
            ...stored.tmdb,
          },
        };
      },
    }),
    {
      name: 'unshackle-settings-store',
      partialize: (state) => ({
        apiConfig: state.apiConfig,
      }),
    }
  )
);
