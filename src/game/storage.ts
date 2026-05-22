import { hydrateGameState } from "./engine";
import type { GameState } from "./types";

const SAVE_KEY = "gpu-capitalist.save.v1";

export interface GameStorage {
  load: () => GameState | null;
  save: (state: GameState) => void;
  clear: () => void;
}

const canUseLocalStorage = () =>
  typeof window !== "undefined" && typeof window.localStorage !== "undefined";

export const localStorageGameStorage: GameStorage = {
  load: () => {
    if (!canUseLocalStorage()) {
      return null;
    }

    const raw = window.localStorage.getItem(SAVE_KEY);

    if (!raw) {
      return null;
    }

    try {
      return hydrateGameState(JSON.parse(raw));
    } catch {
      return null;
    }
  },
  save: (state) => {
    if (!canUseLocalStorage()) {
      return;
    }

    window.localStorage.setItem(
      SAVE_KEY,
      JSON.stringify({
        ...state,
        lastSavedAt: Date.now(),
      }),
    );
  },
  clear: () => {
    if (!canUseLocalStorage()) {
      return;
    }

    window.localStorage.removeItem(SAVE_KEY);
  },
};
