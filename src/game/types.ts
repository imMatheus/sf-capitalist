export type BusinessId =
  | "single-gpu-rig"
  | "render-rack"
  | "inference-cluster"
  | "training-pod"
  | "colocation-hall"
  | "asic-farm"
  | "cloud-region"
  | "hyperscale-campus";

export type BuyMode = 1 | 10 | 100 | "max";

export type Currency = "cash" | "angels";

export type ModifierKind = "profit" | "speed" | "angelEffectiveness";

export type UpgradeTarget = BusinessId | "all";

export interface BusinessDefinition {
  id: BusinessId;
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

export interface BusinessState {
  owned: number;
  progress: number;
  running: boolean;
}

export interface GameState {
  version: number;
  createdAt: number;
  lastSavedAt: number;
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

export interface OfflineReport {
  elapsedSeconds: number;
  earnings: number;
}
