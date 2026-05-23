import {
  BASE_ANGEL_BONUS,
  OFFLINE_CAP_SECONDS,
  SAVE_VERSION,
  siliconValleyWorld,
  getWorld,
  worldList,
  worlds,
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
  WorldDefinition,
  WorldId,
  WorldState,
} from "./types";

const initialBusinessState = (): BusinessState => ({
  owned: 0,
  progress: 0,
  running: false,
});

const primaryWorldId = "silicon-valley";
const legacyPrimaryWorldId = String.fromCharCode(101, 97, 114, 116, 104);
const legacyMineralBusinessId = ["rare", legacyPrimaryWorldId, "mine"].join("-");
const legacyBusinessIdMap: Record<string, BusinessId> = {
  "single-gpu-rig": "bitcoin-miner",
  "render-rack": "yc",
  "inference-cluster": "waymo",
  "training-pod": "stanford-dropout",
  "colocation-hall": "h100-gpu-cluster",
  "asic-farm": "cursor-tab",
  "cloud-region": "polymarket",
  "hyperscale-campus": "chatgpt-3-5",
  "ai-supercomputer": "nvidia",
  "orbital-data-center": "agi",
  [legacyMineralBusinessId]: "pandabuy-agent",
  "strategic-mineral-mine": "pandabuy-agent",
  "e-commerce-marketplace": "shein-factory",
  "ev-plant": "wechat",
  "drone-factory": "drone-swarm",
  "firewall-cloud": "tiktok-algo",
  "livestream-agency": "huawei-phone",
  "ai-tutor-app": "kimi",
  "smartphone-campus": "robot-dog",
  "semiconductor-foundry": "amd-chip",
  "high-speed-rail-grid": "deepseek",
  "dutch-lithography-lab": "ikea-meatball",
  "alpine-gravity-booth": "gdpr-compliance",
  "nordic-payroll-clone": "parental-leave",
  "continental-rail-express": "lovable-credits",
  "riviera-oxygen-bar": "berghain-club",
  "north-sea-helium-farm": "elevenlabs-dj",
  "alpine-cheese-mine": "tethered-bottle-cap",
  "europa-park-resort": "public-transport",
  "transylvanian-data-colony": "renewable-energy",
  "cern-giant-laser": "cern",
};

const isWorldId = (value: unknown): value is WorldId =>
  typeof value === "string" && value in worlds;

const normalizeWorldId = (value: unknown): WorldId =>
  value === legacyPrimaryWorldId ? primaryWorldId : isWorldId(value) ? value : primaryWorldId;

export const createInitialWorldState = (world: WorldDefinition): WorldState => ({
  cash: world.startingCash,
  lifetimeEarnings: 0,
  sessionEarnings: 0,
  angels: 0,
  lifetimeAngels: 0,
  prestigeCount: 0,
  businesses: Object.fromEntries(
    world.businesses.map((business) => [business.id, initialBusinessState()]),
  ),
  managers: Object.fromEntries(world.businesses.map((business) => [business.id, false])),
  cashUpgrades: [],
  angelUpgrades: [],
  achievements: [],
});

export const createInitialGameState = (now = Date.now()): GameState => ({
  version: SAVE_VERSION,
  createdAt: now,
  lastSavedAt: now,
  activeWorldId: primaryWorldId,
  megaBucks: 100,
  unlockedWorldIds: [primaryWorldId],
  worlds: Object.fromEntries(
    worldList.map((world) => [world.id, createInitialWorldState(world)]),
  ) as Record<WorldId, WorldState>,
});

const hydrateWorldState = (
  world: WorldDefinition,
  saved: Partial<WorldState> | null | undefined,
): WorldState => {
  const initial = createInitialWorldState(world);

  if (!saved) {
    return collectAchievements(initial, world);
  }

  const savedBusinesses = { ...saved.businesses };
  const savedManagers = { ...saved.managers };

  Object.entries(legacyBusinessIdMap).forEach(([legacyId, currentId]) => {
    if (savedBusinesses[legacyId] && !savedBusinesses[currentId]) {
      savedBusinesses[currentId] = savedBusinesses[legacyId];
    }

    if (savedManagers[legacyId] && !savedManagers[currentId]) {
      savedManagers[currentId] = savedManagers[legacyId];
    }
  });

  const hydrated: WorldState = {
    ...initial,
    ...saved,
    businesses: { ...initial.businesses, ...savedBusinesses },
    managers: { ...initial.managers, ...savedManagers },
    cashUpgrades: Array.isArray(saved.cashUpgrades) ? saved.cashUpgrades : [],
    angelUpgrades: Array.isArray(saved.angelUpgrades) ? saved.angelUpgrades : [],
    achievements: Array.isArray(saved.achievements) ? saved.achievements : [],
  };

  for (const business of world.businesses) {
    const current = hydrated.businesses[business.id] ?? initialBusinessState();
    hydrated.businesses[business.id] = {
      owned: Math.max(0, Math.floor(Number(current.owned) || 0)),
      progress: Math.max(0, Number(current.progress) || 0),
      running: Boolean(current.running),
    };
    hydrated.managers[business.id] = Boolean(hydrated.managers[business.id]);
  }

  return collectAchievements(hydrated, world);
};

export const hydrateGameState = (saved: Partial<GameState> | null, now = Date.now()): GameState => {
  const initial = createInitialGameState(now);

  if (!saved) {
    return initial;
  }

  const savedWorlds = saved.worlds as Record<string, Partial<WorldState>> | undefined;
  const legacyBaseState = "cash" in saved ? (saved as unknown as Partial<WorldState>) : null;
  const activeWorldId = normalizeWorldId(saved.activeWorldId);
  const unlockedWorldIds = new Set<WorldId>([primaryWorldId]);

  saved.unlockedWorldIds?.forEach((worldId) => {
    unlockedWorldIds.add(normalizeWorldId(worldId));
  });

  const hydratedWorlds = Object.fromEntries(
    worldList.map((world) => {
      const savedWorld =
        savedWorlds?.[world.id] ??
        (world.id === primaryWorldId ? savedWorlds?.[legacyPrimaryWorldId] ?? legacyBaseState : null);
      const hydratedWorld = hydrateWorldState(world, savedWorld);

      if (
        world.id !== primaryWorldId &&
        (unlockedWorldIds.has(world.id) ||
          hydratedWorld.businesses[world.businesses[0].id].owned > 0 ||
          hydratedWorld.cash !== world.startingCash ||
          hydratedWorld.cashUpgrades.length > 0 ||
          hydratedWorld.angelUpgrades.length > 0 ||
          hydratedWorld.lifetimeEarnings > 0)
      ) {
        unlockedWorldIds.add(world.id);
      }

      return [world.id, hydratedWorld];
    }),
  ) as Record<WorldId, WorldState>;

  if (!unlockedWorldIds.has(activeWorldId)) {
    unlockedWorldIds.add(activeWorldId);
  }

  return {
    ...initial,
    ...saved,
    version: SAVE_VERSION,
    activeWorldId,
    megaBucks: Math.max(0, Number(saved.megaBucks ?? initial.megaBucks) || 0),
    unlockedWorldIds: [...unlockedWorldIds],
    worlds: hydratedWorlds,
  };
};

export const getActiveWorld = (state: GameState) => getWorld(state.activeWorldId);

export const getActiveWorldState = (state: GameState) => state.worlds[state.activeWorldId];

export const getWorldUnlockBalance = (state: GameState, world: WorldDefinition) => {
  switch (world.unlockCost.currency) {
    case "free":
      return 0;
    case "megaBucks":
      return state.megaBucks;
    case "siliconValleyCash":
      return state.worlds[primaryWorldId].cash;
  }
};

export const canUnlockWorld = (state: GameState, world: WorldDefinition) =>
  state.unlockedWorldIds.includes(world.id) || getWorldUnlockBalance(state, world) >= world.unlockCost.amount;

const updateWorldState = (
  state: GameState,
  worldId: WorldId,
  updater: (worldState: WorldState, world: WorldDefinition) => WorldState,
): GameState => {
  const world = getWorld(worldId);

  return {
    ...state,
    worlds: {
      ...state.worlds,
      [worldId]: updater(state.worlds[worldId], world),
    },
  };
};

const upgradeIsOwned = (state: WorldState, upgrade: UpgradeDefinition) =>
  upgrade.currency === "cash"
    ? state.cashUpgrades.includes(upgrade.id)
    : state.angelUpgrades.includes(upgrade.id);

const getOwnedUpgrades = (state: WorldState, world: WorldDefinition) => [
  ...world.cashUpgrades.filter((upgrade) => state.cashUpgrades.includes(upgrade.id)),
  ...world.angelUpgrades.filter((upgrade) => state.angelUpgrades.includes(upgrade.id)),
];

const appliesToBusiness = (upgrade: UpgradeDefinition | UnlockDefinition, businessId: BusinessId) =>
  upgrade.target === "all" || upgrade.target === businessId;

const getActiveUnlocks = (state: WorldState, world: WorldDefinition) => {
  const activeBusinessUnlocks = world.businessUnlocks.filter((unlock) => {
    if (unlock.target === "all") {
      return false;
    }

    return state.businesses[unlock.target].owned >= unlock.goal;
  });

  const activeAllUnlocks = world.allBusinessUnlocks.filter((unlock) =>
    world.businesses.every((business) => state.businesses[business.id].owned >= unlock.goal),
  );

  return [...activeBusinessUnlocks, ...activeAllUnlocks];
};

export const getAngelEffectiveness = (state: WorldState, world: WorldDefinition) =>
  BASE_ANGEL_BONUS +
  getOwnedUpgrades(state, world)
    .filter((upgrade) => upgrade.kind === "angelEffectiveness")
    .reduce((total, upgrade) => total + upgrade.multiplier / 100, 0);

export const getClaimableAngels = (state: WorldState) => {
  const potentialLifetimeAngels = Math.floor(
    150 * Math.sqrt(Math.max(0, state.lifetimeEarnings) / 1_000_000_000_000_000),
  );

  return Math.max(0, potentialLifetimeAngels - state.lifetimeAngels);
};

export const getProfitMultiplier = (
  state: WorldState,
  world: WorldDefinition,
  businessId: BusinessId,
) => {
  const angelMultiplier = 1 + state.angels * getAngelEffectiveness(state, world);
  const upgradeMultiplier = getOwnedUpgrades(state, world)
    .filter((upgrade) => upgrade.kind === "profit" && appliesToBusiness(upgrade, businessId))
    .reduce((total, upgrade) => total * upgrade.multiplier, 1);
  const unlockMultiplier = getActiveUnlocks(state, world)
    .filter((unlock) => unlock.kind === "profit" && appliesToBusiness(unlock, businessId))
    .reduce((total, unlock) => total * unlock.multiplier, 1);

  return angelMultiplier * upgradeMultiplier * unlockMultiplier;
};

export const getSpeedMultiplier = (
  state: WorldState,
  world: WorldDefinition,
  businessId: BusinessId,
) => {
  const upgradeMultiplier = getOwnedUpgrades(state, world)
    .filter((upgrade) => upgrade.kind === "speed" && appliesToBusiness(upgrade, businessId))
    .reduce((total, upgrade) => total * upgrade.multiplier, 1);
  const unlockMultiplier = getActiveUnlocks(state, world)
    .filter((unlock) => unlock.kind === "speed" && appliesToBusiness(unlock, businessId))
    .reduce((total, unlock) => total * unlock.multiplier, 1);

  return upgradeMultiplier * unlockMultiplier;
};

export const getBusinessDuration = (
  state: WorldState,
  world: WorldDefinition,
  business: BusinessDefinition,
) => Math.max(0.05, business.baseDuration / getSpeedMultiplier(state, world, business.id));

export const getBusinessRevenue = (
  state: WorldState,
  world: WorldDefinition,
  business: BusinessDefinition,
) =>
  business.baseRevenue *
  state.businesses[business.id].owned *
  getProfitMultiplier(state, world, business.id);

export const getBusinessCashPerSecond = (
  state: WorldState,
  world: WorldDefinition,
  business: BusinessDefinition,
) => {
  const owned = state.businesses[business.id].owned;

  if (owned <= 0) {
    return 0;
  }

  return getBusinessRevenue(state, world, business) / getBusinessDuration(state, world, business);
};

export const getNextUnlock = (
  state: WorldState,
  world: WorldDefinition,
  businessId: BusinessId,
) => {
  const owned = state.businesses[businessId].owned;

  return world.businessUnlocks
    .filter((unlock) => unlock.target === businessId && unlock.goal > owned)
    .sort((a, b) => a.goal - b.goal)[0];
};

export const getNextAllUnlock = (state: WorldState, world: WorldDefinition) => {
  const minimumOwned = Math.min(...world.businesses.map((business) => state.businesses[business.id].owned));

  return world.allBusinessUnlocks
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

  return firstCost * ((business.costMultiplier ** quantity - 1) / (business.costMultiplier - 1));
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

export const getBuyQuantity = (
  state: WorldState,
  world: WorldDefinition,
  business: BusinessDefinition,
  mode: BuyMode,
) => {
  const owned = state.businesses[business.id].owned;

  if (mode === "max") {
    return getMaxAffordableQuantity(business, owned, state.cash);
  }

  if (mode === "next") {
    const nextUnlock = getNextUnlock(state, world, business.id);

    if (!nextUnlock) {
      return 0;
    }

    return Math.max(0, nextUnlock.goal - owned);
  }

  return mode;
};

const earnCash = (state: WorldState, amount: number): WorldState => {
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
): GameState =>
  updateWorldState(state, state.activeWorldId, (worldState, world) => {
    const business = world.businesses.find((entry) => entry.id === businessId);

    if (!business) {
      return worldState;
    }

    const quantity = getBuyQuantity(worldState, world, business, mode);
    const cost = getPurchaseCost(business, worldState.businesses[businessId].owned, quantity);

    if (quantity <= 0 || cost > worldState.cash || !Number.isFinite(cost)) {
      return worldState;
    }

    const nextState: WorldState = {
      ...worldState,
      cash: worldState.cash - cost,
      businesses: {
        ...worldState.businesses,
        [businessId]: {
          ...worldState.businesses[businessId],
          owned: worldState.businesses[businessId].owned + quantity,
        },
      },
    };

    return collectAchievements(nextState, world);
  });

const startBusinessInWorld = (
  worldState: WorldState,
  world: WorldDefinition,
  businessId: BusinessId,
): WorldState => {
  const business = world.businesses.find((entry) => entry.id === businessId);
  const current = worldState.businesses[businessId];

  if (!business || !current || current.owned <= 0 || current.running) {
    return worldState;
  }

  return {
    ...worldState,
    businesses: {
      ...worldState.businesses,
      [businessId]: {
        ...current,
        progress: 0,
        running: true,
      },
    },
  };
};

export const startBusiness = (state: GameState, businessId: BusinessId): GameState =>
  updateWorldState(state, state.activeWorldId, (worldState, world) =>
    startBusinessInWorld(worldState, world, businessId),
  );

export const buyManager = (state: GameState, businessId: BusinessId): GameState =>
  updateWorldState(state, state.activeWorldId, (worldState, world) => {
    const business = world.businesses.find((entry) => entry.id === businessId);

    if (!business || worldState.managers[businessId] || worldState.cash < business.managerCost) {
      return worldState;
    }

    const nextState: WorldState = {
      ...worldState,
      cash: worldState.cash - business.managerCost,
      managers: {
        ...worldState.managers,
        [businessId]: true,
      },
    };

    return collectAchievements(startBusinessInWorld(nextState, world, businessId), world);
  });

export const buyUpgrade = (state: GameState, upgradeId: string): GameState =>
  updateWorldState(state, state.activeWorldId, (worldState, world) => {
    const upgrade = [...world.cashUpgrades, ...world.angelUpgrades].find((entry) => entry.id === upgradeId);

    if (!upgrade || upgradeIsOwned(worldState, upgrade)) {
      return worldState;
    }

    const applyUpgradeEffect = (nextState: WorldState): WorldState => {
      if (upgrade.kind !== "owned" || upgrade.target === "all") {
        return nextState;
      }

      return {
        ...nextState,
        businesses: {
          ...nextState.businesses,
          [upgrade.target]: {
            ...nextState.businesses[upgrade.target],
            owned: nextState.businesses[upgrade.target].owned + upgrade.multiplier,
          },
        },
      };
    };

    if (upgrade.currency === "cash") {
      if (worldState.cash < upgrade.cost) {
        return worldState;
      }

      return collectAchievements(
        applyUpgradeEffect({
          ...worldState,
          cash: worldState.cash - upgrade.cost,
          cashUpgrades: [...worldState.cashUpgrades, upgrade.id],
        }),
        world,
      );
    }

    if (worldState.angels < upgrade.cost) {
      return worldState;
    }

    return collectAchievements(
      applyUpgradeEffect({
        ...worldState,
        angels: worldState.angels - upgrade.cost,
        angelUpgrades: [...worldState.angelUpgrades, upgrade.id],
      }),
      world,
    );
  });

export const resetForAngels = (state: GameState): GameState =>
  updateWorldState(state, state.activeWorldId, (worldState, world) => {
    const claimableAngels = getClaimableAngels(worldState);

    if (claimableAngels <= 0) {
      return worldState;
    }

    const nextState: WorldState = {
      ...createInitialWorldState(world),
      lifetimeEarnings: worldState.lifetimeEarnings,
      angels: worldState.angels + claimableAngels,
      lifetimeAngels: worldState.lifetimeAngels + claimableAngels,
      prestigeCount: worldState.prestigeCount + 1,
      achievements: worldState.achievements,
    };

    return collectAchievements(nextState, world);
  });

const advanceWorldTime = (
  worldState: WorldState,
  world: WorldDefinition,
  elapsedSeconds: number,
): { state: WorldState; earnings: number } => {
  const safeElapsed = Math.max(0, elapsedSeconds);

  if (safeElapsed <= 0) {
    return { state: worldState, earnings: 0 };
  }

  let nextState = worldState;
  let totalEarnings = 0;
  const nextBusinesses = { ...nextState.businesses };

  for (const business of world.businesses) {
    const current = nextBusinesses[business.id];

    if (current.owned <= 0) {
      continue;
    }

    const automated = nextState.managers[business.id];
    const running = automated || current.running;

    if (!running) {
      continue;
    }

    const duration = getBusinessDuration(nextState, world, business);
    const revenue = getBusinessRevenue(nextState, world, business);

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
    state: collectAchievements(nextState, world),
    earnings: totalEarnings,
  };
};

export const advanceTime = (
  state: GameState,
  elapsedSeconds: number,
): { state: GameState; earnings: number } => {
  let activeWorldEarnings = 0;
  const nextWorlds = Object.fromEntries(
    worldList.map((world) => {
      const advanced = advanceWorldTime(state.worlds[world.id], world, elapsedSeconds);

      if (world.id === state.activeWorldId) {
        activeWorldEarnings = advanced.earnings;
      }

      return [world.id, advanced.state];
    }),
  ) as Record<WorldId, WorldState>;

  return {
    state: {
      ...state,
      worlds: nextWorlds,
    },
    earnings: activeWorldEarnings,
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

export const collectAchievements = (
  state: WorldState,
  world: WorldDefinition = siliconValleyWorld,
): WorldState => {
  const unlocked = new Set(state.achievements);
  const managerCount = Object.values(state.managers).filter(Boolean).length;
  const cashUpgradeCount = state.cashUpgrades.length;
  const claimableAngels = getClaimableAngels(state);
  const allBusinessesOwned = world.businesses.every((business) => state.businesses[business.id].owned >= 1);
  const allBusinessHundred = world.businesses.every((business) => state.businesses[business.id].owned >= 100);
  const firstBusiness = world.businesses[0];
  const finalBusiness = world.businesses[world.businesses.length - 1];

  if (firstBusiness && state.businesses[firstBusiness.id].owned >= 1) {
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

  if (managerCount === world.businesses.length) {
    unlocked.add("all-automated");
  }

  if (allBusinessHundred) {
    unlocked.add("all-100");
  }

  if (allBusinessesOwned) {
    unlocked.add("ten-businesses");
  }

  if (finalBusiness && state.businesses[finalBusiness.id].owned >= 1) {
    unlocked.add("orbital-operator");
  }

  if (state.lifetimeEarnings >= 1_000_000_000_000) {
    unlocked.add("trillionaire");
  }

  const knownIds = new Set(world.achievements.map((achievement) => achievement.id));

  return {
    ...state,
    achievements: [...unlocked].filter((id) => knownIds.has(id)),
  };
};

export const unlockWorld = (state: GameState, worldId: WorldId): GameState => {
  if (state.unlockedWorldIds.includes(worldId)) {
    return state;
  }

  const world = getWorld(worldId);

  if (!canUnlockWorld(state, world)) {
    return state;
  }

  if (world.unlockCost.currency === "siliconValleyCash") {
    return {
      ...state,
      unlockedWorldIds: [...state.unlockedWorldIds, worldId],
      worlds: {
        ...state.worlds,
        [primaryWorldId]: {
          ...state.worlds[primaryWorldId],
          cash: state.worlds[primaryWorldId].cash - world.unlockCost.amount,
        },
      },
    };
  }

  if (world.unlockCost.currency === "free") {
    return {
      ...state,
      unlockedWorldIds: [...state.unlockedWorldIds, worldId],
    };
  }

  return {
    ...state,
    megaBucks: state.megaBucks - world.unlockCost.amount,
    unlockedWorldIds: [...state.unlockedWorldIds, worldId],
  };
};

export const switchWorld = (state: GameState, worldId: WorldId): GameState => {
  if (!state.unlockedWorldIds.includes(worldId)) {
    return state;
  }

  return {
    ...state,
    activeWorldId: worldId,
  };
};

export const resetSave = (now = Date.now()) => createInitialGameState(now);
