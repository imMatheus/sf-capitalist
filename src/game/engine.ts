import {
  BASE_ANGEL_BONUS,
  OFFLINE_CAP_SECONDS,
  SAVE_VERSION,
  achievements,
  allBusinessUnlocks,
  angelUpgrades,
  businesses,
  businessUnlocks,
  cashUpgrades,
} from "./economy";
import type {
  BusinessDefinition,
  BusinessId,
  BusinessState,
  BuyMode,
  GameState,
  OfflineReport,
  UnlockDefinition,
  UpgradeDefinition,
} from "./types";

const initialBusinessState = (): BusinessState => ({
  owned: 0,
  progress: 0,
  running: false,
});

export const createInitialGameState = (now = Date.now()): GameState => ({
  version: SAVE_VERSION,
  createdAt: now,
  lastSavedAt: now,
  cash: 4,
  lifetimeEarnings: 0,
  sessionEarnings: 0,
  angels: 0,
  lifetimeAngels: 0,
  prestigeCount: 0,
  businesses: Object.fromEntries(
    businesses.map((business) => [business.id, initialBusinessState()]),
  ) as Record<BusinessId, BusinessState>,
  managers: Object.fromEntries(businesses.map((business) => [business.id, false])) as Record<
    BusinessId,
    boolean
  >,
  cashUpgrades: [],
  angelUpgrades: [],
  achievements: [],
});

export const hydrateGameState = (saved: Partial<GameState> | null, now = Date.now()): GameState => {
  const initial = createInitialGameState(now);

  if (!saved) {
    return initial;
  }

  const hydrated: GameState = {
    ...initial,
    ...saved,
    version: SAVE_VERSION,
    businesses: { ...initial.businesses, ...saved.businesses },
    managers: { ...initial.managers, ...saved.managers },
    cashUpgrades: Array.isArray(saved.cashUpgrades) ? saved.cashUpgrades : [],
    angelUpgrades: Array.isArray(saved.angelUpgrades) ? saved.angelUpgrades : [],
    achievements: Array.isArray(saved.achievements) ? saved.achievements : [],
  };

  for (const business of businesses) {
    const current = hydrated.businesses[business.id] ?? initialBusinessState();
    hydrated.businesses[business.id] = {
      owned: Math.max(0, Math.floor(Number(current.owned) || 0)),
      progress: Math.max(0, Number(current.progress) || 0),
      running: Boolean(current.running),
    };
  }

  return collectAchievements(hydrated);
};

const upgradeIsOwned = (state: GameState, upgrade: UpgradeDefinition) =>
  upgrade.currency === "cash"
    ? state.cashUpgrades.includes(upgrade.id)
    : state.angelUpgrades.includes(upgrade.id);

const getOwnedUpgrades = (state: GameState) => [
  ...cashUpgrades.filter((upgrade) => state.cashUpgrades.includes(upgrade.id)),
  ...angelUpgrades.filter((upgrade) => state.angelUpgrades.includes(upgrade.id)),
];

const appliesToBusiness = (upgrade: UpgradeDefinition | UnlockDefinition, businessId: BusinessId) =>
  upgrade.target === "all" || upgrade.target === businessId;

const getActiveUnlocks = (state: GameState) => {
  const activeBusinessUnlocks = businessUnlocks.filter((unlock) => {
    if (unlock.target === "all") {
      return false;
    }

    return state.businesses[unlock.target].owned >= unlock.goal;
  });

  const activeAllUnlocks = allBusinessUnlocks.filter((unlock) =>
    businesses.every((business) => state.businesses[business.id].owned >= unlock.goal),
  );

  return [...activeBusinessUnlocks, ...activeAllUnlocks];
};

export const getAngelEffectiveness = (state: GameState) => {
  const upgradeMultiplier = getOwnedUpgrades(state)
    .filter((upgrade) => upgrade.kind === "angelEffectiveness")
    .reduce((total, upgrade) => total * upgrade.multiplier, 1);

  return BASE_ANGEL_BONUS * upgradeMultiplier;
};

export const getClaimableAngels = (state: GameState) => {
  const potentialLifetimeAngels = Math.floor(
    150 * Math.sqrt(Math.max(0, state.lifetimeEarnings) / 1_000_000_000_000_000),
  );

  return Math.max(0, potentialLifetimeAngels - state.lifetimeAngels);
};

export const getProfitMultiplier = (state: GameState, businessId: BusinessId) => {
  const angelMultiplier = 1 + state.angels * getAngelEffectiveness(state);
  const upgradeMultiplier = getOwnedUpgrades(state)
    .filter((upgrade) => upgrade.kind === "profit" && appliesToBusiness(upgrade, businessId))
    .reduce((total, upgrade) => total * upgrade.multiplier, 1);
  const unlockMultiplier = getActiveUnlocks(state)
    .filter((unlock) => unlock.kind === "profit" && appliesToBusiness(unlock, businessId))
    .reduce((total, unlock) => total * unlock.multiplier, 1);

  return angelMultiplier * upgradeMultiplier * unlockMultiplier;
};

export const getSpeedMultiplier = (state: GameState, businessId: BusinessId) => {
  const upgradeMultiplier = getOwnedUpgrades(state)
    .filter((upgrade) => upgrade.kind === "speed" && appliesToBusiness(upgrade, businessId))
    .reduce((total, upgrade) => total * upgrade.multiplier, 1);
  const unlockMultiplier = getActiveUnlocks(state)
    .filter((unlock) => unlock.kind === "speed" && appliesToBusiness(unlock, businessId))
    .reduce((total, unlock) => total * unlock.multiplier, 1);

  return upgradeMultiplier * unlockMultiplier;
};

export const getBusinessDuration = (state: GameState, business: BusinessDefinition) =>
  Math.max(0.05, business.baseDuration / getSpeedMultiplier(state, business.id));

export const getBusinessRevenue = (state: GameState, business: BusinessDefinition) =>
  business.baseRevenue *
  state.businesses[business.id].owned *
  getProfitMultiplier(state, business.id);

export const getBusinessCashPerSecond = (state: GameState, business: BusinessDefinition) => {
  const owned = state.businesses[business.id].owned;

  if (owned <= 0) {
    return 0;
  }

  return getBusinessRevenue(state, business) / getBusinessDuration(state, business);
};

export const getNextUnlock = (state: GameState, businessId: BusinessId) => {
  const owned = state.businesses[businessId].owned;

  return businessUnlocks
    .filter((unlock) => unlock.target === businessId && unlock.goal > owned)
    .sort((a, b) => a.goal - b.goal)[0];
};

export const getNextAllUnlock = (state: GameState) => {
  const minimumOwned = Math.min(...businesses.map((business) => state.businesses[business.id].owned));

  return allBusinessUnlocks
    .filter((unlock) => unlock.goal > minimumOwned)
    .sort((a, b) => a.goal - b.goal)[0];
};

export const getPurchaseCost = (
  business: BusinessDefinition,
  owned: number,
  quantity: number,
): number => {
  if (quantity <= 0) {
    return 0;
  }

  const firstCost = business.baseCost * business.costMultiplier ** owned;

  if (quantity === 1) {
    return firstCost;
  }

  return (
    firstCost *
    ((business.costMultiplier ** quantity - 1) / (business.costMultiplier - 1))
  );
};

export const getMaxAffordableQuantity = (
  business: BusinessDefinition,
  owned: number,
  cash: number,
) => {
  if (cash < getPurchaseCost(business, owned, 1)) {
    return 0;
  }

  let low = 1;
  let high = 1;

  while (Number.isFinite(getPurchaseCost(business, owned, high)) && getPurchaseCost(business, owned, high) <= cash) {
    high *= 2;

    if (high > 100_000) {
      break;
    }
  }

  while (low < high) {
    const mid = Math.ceil((low + high) / 2);
    const cost = getPurchaseCost(business, owned, mid);

    if (Number.isFinite(cost) && cost <= cash) {
      low = mid;
    } else {
      high = mid - 1;
    }
  }

  return low;
};

export const getBuyQuantity = (state: GameState, business: BusinessDefinition, mode: BuyMode) => {
  if (mode === "max") {
    return getMaxAffordableQuantity(business, state.businesses[business.id].owned, state.cash);
  }

  return mode;
};

const earnCash = (state: GameState, amount: number): GameState => {
  if (amount <= 0 || !Number.isFinite(amount)) {
    return state;
  }

  return {
    ...state,
    cash: state.cash + amount,
    lifetimeEarnings: state.lifetimeEarnings + amount,
    sessionEarnings: state.sessionEarnings + amount,
  };
};

export const buyBusiness = (
  state: GameState,
  businessId: BusinessId,
  mode: BuyMode,
): GameState => {
  const business = businesses.find((entry) => entry.id === businessId);

  if (!business) {
    return state;
  }

  const quantity = getBuyQuantity(state, business, mode);
  const cost = getPurchaseCost(business, state.businesses[businessId].owned, quantity);

  if (quantity <= 0 || cost > state.cash || !Number.isFinite(cost)) {
    return state;
  }

  const nextState: GameState = {
    ...state,
    cash: state.cash - cost,
    businesses: {
      ...state.businesses,
      [businessId]: {
        ...state.businesses[businessId],
        owned: state.businesses[businessId].owned + quantity,
      },
    },
  };

  return collectAchievements(nextState);
};

export const startBusiness = (state: GameState, businessId: BusinessId): GameState => {
  const current = state.businesses[businessId];

  if (!current || current.owned <= 0 || current.running) {
    return state;
  }

  return {
    ...state,
    businesses: {
      ...state.businesses,
      [businessId]: {
        ...current,
        running: true,
      },
    },
  };
};

export const buyManager = (state: GameState, businessId: BusinessId): GameState => {
  const business = businesses.find((entry) => entry.id === businessId);

  if (!business || state.managers[businessId] || state.cash < business.managerCost) {
    return state;
  }

  const nextState: GameState = {
    ...state,
    cash: state.cash - business.managerCost,
    managers: {
      ...state.managers,
      [businessId]: true,
    },
  };

  return collectAchievements(startBusiness(nextState, businessId));
};

export const buyUpgrade = (state: GameState, upgradeId: string): GameState => {
  const upgrade = [...cashUpgrades, ...angelUpgrades].find((entry) => entry.id === upgradeId);

  if (!upgrade || upgradeIsOwned(state, upgrade)) {
    return state;
  }

  if (upgrade.currency === "cash") {
    if (state.cash < upgrade.cost) {
      return state;
    }

    return collectAchievements({
      ...state,
      cash: state.cash - upgrade.cost,
      cashUpgrades: [...state.cashUpgrades, upgrade.id],
    });
  }

  if (state.angels < upgrade.cost) {
    return state;
  }

  return collectAchievements({
    ...state,
    angels: state.angels - upgrade.cost,
    angelUpgrades: [...state.angelUpgrades, upgrade.id],
  });
};

export const resetForAngels = (state: GameState): GameState => {
  const claimableAngels = getClaimableAngels(state);

  if (claimableAngels <= 0) {
    return state;
  }

  const now = Date.now();
  const nextState: GameState = {
    ...createInitialGameState(now),
    createdAt: state.createdAt,
    lifetimeEarnings: state.lifetimeEarnings,
    angels: state.angels + claimableAngels,
    lifetimeAngels: state.lifetimeAngels + claimableAngels,
    prestigeCount: state.prestigeCount + 1,
    achievements: state.achievements,
  };

  return collectAchievements(nextState);
};

export const advanceTime = (
  state: GameState,
  elapsedSeconds: number,
): { state: GameState; earnings: number } => {
  const safeElapsed = Math.max(0, elapsedSeconds);

  if (safeElapsed <= 0) {
    return { state, earnings: 0 };
  }

  let nextState = state;
  let totalEarnings = 0;
  const nextBusinesses = { ...nextState.businesses };

  for (const business of businesses) {
    const current = nextBusinesses[business.id];

    if (current.owned <= 0) {
      continue;
    }

    const automated = nextState.managers[business.id];
    const running = automated || current.running;

    if (!running) {
      continue;
    }

    const duration = getBusinessDuration(nextState, business);
    const revenue = getBusinessRevenue(nextState, business);

    if (automated) {
      const totalProgress = current.progress + safeElapsed;
      const completions = Math.floor(totalProgress / duration);

      if (completions > 0) {
        totalEarnings += revenue * completions;
      }

      nextBusinesses[business.id] = {
        ...current,
        running: true,
        progress: totalProgress % duration,
      };
    } else if (current.running) {
      const totalProgress = current.progress + safeElapsed;

      if (totalProgress >= duration) {
        totalEarnings += revenue;
        nextBusinesses[business.id] = {
          ...current,
          running: false,
          progress: 0,
        };
      } else {
        nextBusinesses[business.id] = {
          ...current,
          progress: totalProgress,
        };
      }
    }
  }

  nextState = {
    ...nextState,
    businesses: nextBusinesses,
  };

  nextState = earnCash(nextState, totalEarnings);

  return {
    state: collectAchievements(nextState),
    earnings: totalEarnings,
  };
};

export const applyOfflineProgress = (
  state: GameState,
  now = Date.now(),
): { state: GameState; report: OfflineReport | null } => {
  const elapsedSeconds = Math.min(
    OFFLINE_CAP_SECONDS,
    Math.max(0, (now - state.lastSavedAt) / 1_000),
  );

  if (elapsedSeconds < 5) {
    return {
      state: {
        ...state,
        lastSavedAt: now,
      },
      report: null,
    };
  }

  const advanced = advanceTime(state, elapsedSeconds);

  return {
    state: {
      ...advanced.state,
      lastSavedAt: now,
    },
    report: {
      elapsedSeconds,
      earnings: advanced.earnings,
    },
  };
};

export const collectAchievements = (state: GameState): GameState => {
  const unlocked = new Set(state.achievements);
  const managerCount = Object.values(state.managers).filter(Boolean).length;
  const cashUpgradeCount = state.cashUpgrades.length;
  const claimableAngels = getClaimableAngels(state);
  const allBusinessHundred = businesses.every((business) => state.businesses[business.id].owned >= 100);

  if (state.businesses["single-gpu-rig"].owned >= 1) {
    unlocked.add("first-rig");
  }

  if (managerCount > 0) {
    unlocked.add("first-manager");
  }

  if (cashUpgradeCount > 0) {
    unlocked.add("first-upgrade");
  }

  if (state.sessionEarnings >= 1_000_000) {
    unlocked.add("millionaire");
  }

  if (claimableAngels > 0 || state.lifetimeAngels > 0) {
    unlocked.add("first-angel");
  }

  if (state.prestigeCount > 0) {
    unlocked.add("first-prestige");
  }

  if (managerCount === businesses.length) {
    unlocked.add("all-automated");
  }

  if (allBusinessHundred) {
    unlocked.add("all-100");
  }

  if (state.lifetimeEarnings >= 1_000_000_000_000) {
    unlocked.add("trillionaire");
  }

  const knownIds = new Set(achievements.map((achievement) => achievement.id));

  return {
    ...state,
    achievements: [...unlocked].filter((id) => knownIds.has(id)),
  };
};

export const resetSave = (now = Date.now()) => createInitialGameState(now);
