import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  advanceTime,
  applyOfflineProgress,
  buyBusiness,
  buyManager,
  buyUpgrade,
  createInitialGameState,
  resetForAngels,
  resetSave,
  startBusiness,
} from "./engine";
import { localStorageGameStorage } from "./storage";
import type { BusinessId, BuyMode, GameState, OfflineReport } from "./types";

const TICK_RATE_MS = 100;
const SAVE_RATE_MS = 1_500;

export const useGame = () => {
  const initialLoadRef = useRef<{ state: GameState; report: OfflineReport | null } | null>(null);

  if (!initialLoadRef.current) {
    const saved = localStorageGameStorage.load() ?? createInitialGameState();
    initialLoadRef.current = applyOfflineProgress(saved);
  }

  const [offlineReport, setOfflineReport] = useState<OfflineReport | null>(
    initialLoadRef.current.report,
  );
  const [state, setState] = useState<GameState>(initialLoadRef.current.state);
  const stateRef = useRef(state);
  const lastTickRef = useRef(Date.now());

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      const now = Date.now();
      const elapsedSeconds = (now - lastTickRef.current) / 1_000;
      lastTickRef.current = now;

      setState((current) => advanceTime(current, elapsedSeconds).state);
    }, TICK_RATE_MS);

    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = window.setInterval(() => {
      localStorageGameStorage.save(stateRef.current);
    }, SAVE_RATE_MS);

    const saveBeforeUnload = () => {
      localStorageGameStorage.save(stateRef.current);
    };

    window.addEventListener("beforeunload", saveBeforeUnload);

    return () => {
      window.clearInterval(interval);
      window.removeEventListener("beforeunload", saveBeforeUnload);
      localStorageGameStorage.save(stateRef.current);
    };
  }, []);

  const actions = useMemo(
    () => ({
      buyBusiness: (businessId: BusinessId, mode: BuyMode) => {
        setState((current) => buyBusiness(current, businessId, mode));
      },
      startBusiness: (businessId: BusinessId) => {
        setState((current) => startBusiness(current, businessId));
      },
      buyManager: (businessId: BusinessId) => {
        setState((current) => buyManager(current, businessId));
      },
      buyUpgrade: (upgradeId: string) => {
        setState((current) => buyUpgrade(current, upgradeId));
      },
      resetForAngels: () => {
        setState((current) => resetForAngels(current));
      },
      dismissOfflineReport: () => {
        setOfflineReport(null);
      },
      hardReset: () => {
        localStorageGameStorage.clear();
        setOfflineReport(null);
        setState(resetSave());
      },
    }),
    [],
  );

  const saveNow = useCallback(() => {
    localStorageGameStorage.save(stateRef.current);
  }, []);

  return {
    state,
    actions,
    offlineReport,
    saveNow,
  };
};
