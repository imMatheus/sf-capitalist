export type WorldId = "silicon-valley" | "china" | "europe";

export type BusinessId = string;

export type BuyMode = 1 | 10 | 100 | "next" | "max";

export type Currency = "cash" | "angels";

export type ModifierKind = "profit" | "speed" | "angelEffectiveness" | "owned";

export type UpgradeTarget = BusinessId | "all";

export type WorldUnlockCost =
  | { currency: "free"; amount: 0 }
  | { currency: "megaBucks"; amount: number }
  | { currency: "siliconValleyCash"; amount: number };

export interface BusinessDefinition {
  id: BusinessId;
  imageId?: BusinessId;
  name: string;
  shortName: string;
  caption: string;
  baseCost: number;
  costMultiplier: number;
  baseRevenue: number;
  baseDuration: number;
  managerCost: number;
  managerName: string;
  accent: string;
}

export interface UpgradeDefinition {
  id: string;
  name: string;
  description: string;
  cost: number;
  currency: Currency;
  target: UpgradeTarget;
  kind: ModifierKind;
  multiplier: number;
}

export interface UnlockDefinition {
  id: string;
  name: string;
  goal: number;
  target: UpgradeTarget;
  kind: Extract<ModifierKind, "profit" | "speed">;
  multiplier: number;
}

export interface AchievementDefinition {
  id: string;
  name: string;
  description: string;
}

export interface WorldDefinition {
  id: WorldId;
  name: string;
  shortName: string;
  description: string;
  currencyName: string;
  currencySymbol: string;
  unlockCost: WorldUnlockCost;
  startingCash: number;
  businesses: BusinessDefinition[];
  cashUpgrades: UpgradeDefinition[];
  angelUpgrades: UpgradeDefinition[];
  businessUnlocks: UnlockDefinition[];
  allBusinessUnlocks: UnlockDefinition[];
  achievements: AchievementDefinition[];
}

export interface BusinessState {
  owned: number;
  progress: number;
  running: boolean;
}

export interface WorldState {
  cash: number;
  lifetimeEarnings: number;
  sessionEarnings: number;
  angels: number;
  lifetimeAngels: number;
  prestigeCount: number;
  businesses: Record<BusinessId, BusinessState>;
  managers: Record<BusinessId, boolean>;
  cashUpgrades: string[];
  angelUpgrades: string[];
  achievements: string[];
}

export interface GameState {
  version: number;
  createdAt: number;
  lastSavedAt: number;
  activeWorldId: WorldId;
  megaBucks: number;
  unlockedWorldIds: WorldId[];
  worlds: Record<WorldId, WorldState>;
}

export interface OfflineReport {
  elapsedSeconds: number;
  earnings: number;
}
