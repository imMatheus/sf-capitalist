import type {
  AchievementDefinition,
  BusinessDefinition,
  BusinessId,
  Currency,
  UnlockDefinition,
  UpgradeDefinition,
  UpgradeTarget,
} from "./types";
import { earthAngelUpgradeRows, earthCashUpgradeRows } from "./adventureCapitalistEarthData";

export const SAVE_VERSION = 2;
export const BASE_ANGEL_BONUS = 0.02;
export const OFFLINE_CAP_SECONDS = 60 * 60 * 24 * 7;

export const businesses: BusinessDefinition[] = [
  {
    id: "single-gpu-rig",
    name: "Single GPU Rig",
    shortName: "GPU Rig",
    caption: "One card, one outlet, one tiny revenue stream.",
    baseCost: 4,
    costMultiplier: 1.07,
    baseRevenue: 1,
    baseDuration: 0.6,
    managerCost: 1_000,
    managerName: "Ada Lovelace Ops",
    accent: "#f7d94c",
  },
  {
    id: "render-rack",
    name: "Render Rack",
    shortName: "Rack",
    caption: "Frames, pixels, invoices, repeat.",
    baseCost: 60,
    costMultiplier: 1.15,
    baseRevenue: 60,
    baseDuration: 3,
    managerCost: 15_000,
    managerName: "Ray Tracey",
    accent: "#63d2ff",
  },
  {
    id: "inference-cluster",
    name: "Inference Cluster",
    shortName: "Inference",
    caption: "Predict the future, bill by the token.",
    baseCost: 720,
    costMultiplier: 1.14,
    baseRevenue: 540,
    baseDuration: 6,
    managerCost: 100_000,
    managerName: "Max Tokens",
    accent: "#9af06f",
  },
  {
    id: "training-pod",
    name: "Training Pod",
    shortName: "Training",
    caption: "Backpropagation with a procurement budget.",
    baseCost: 8_640,
    costMultiplier: 1.13,
    baseRevenue: 4_320,
    baseDuration: 12,
    managerCost: 500_000,
    managerName: "Grad Descent",
    accent: "#ff8a5b",
  },
  {
    id: "colocation-hall",
    name: "Colocation Hall",
    shortName: "Colo Hall",
    caption: "Sell floor tiles as a financial instrument.",
    baseCost: 103_680,
    costMultiplier: 1.12,
    baseRevenue: 51_840,
    baseDuration: 24,
    managerCost: 1_200_000,
    managerName: "Holly Aisle",
    accent: "#ff6f91",
  },
  {
    id: "asic-farm",
    name: "ASIC Farm",
    shortName: "ASIC Farm",
    caption: "Purpose-built silicon with a single purpose: profit.",
    baseCost: 1_244_160,
    costMultiplier: 1.11,
    baseRevenue: 622_080,
    baseDuration: 96,
    managerCost: 10_000_000,
    managerName: "Hash Gordon",
    accent: "#c59bff",
  },
  {
    id: "cloud-region",
    name: "Cloud Region",
    shortName: "Region",
    caption: "Three zones, one invoice, many commas.",
    baseCost: 14_929_920,
    costMultiplier: 1.1,
    baseRevenue: 7_464_960,
    baseDuration: 384,
    managerCost: 111_111_111,
    managerName: "Reg Ion",
    accent: "#78f5c5",
  },
  {
    id: "hyperscale-campus",
    name: "Hyperscale Campus",
    shortName: "Campus",
    caption: "A city-sized server room with a gift shop.",
    baseCost: 179_159_040,
    costMultiplier: 1.09,
    baseRevenue: 89_579_520,
    baseDuration: 1_536,
    managerCost: 1_000_000_000,
    managerName: "Carrie Capacity",
    accent: "#ffcb8a",
  },
  {
    id: "ai-supercomputer",
    name: "AI Supercomputer",
    shortName: "Supercomputer",
    caption: "One national-lab-sized machine, billed one miracle at a time.",
    baseCost: 2_149_908_480,
    costMultiplier: 1.08,
    baseRevenue: 1_074_954_240,
    baseDuration: 6_144,
    managerCost: 10_000_000_000,
    managerName: "Vector Prime",
    accent: "#a4e86f",
  },
  {
    id: "orbital-data-center",
    name: "Orbital Data Center",
    shortName: "Orbital DC",
    caption: "Solar-powered racks with latency measured in ambition.",
    baseCost: 25_798_901_760,
    costMultiplier: 1.07,
    baseRevenue: 29_668_737_024,
    baseDuration: 36_864,
    managerCost: 100_000_000_000,
    managerName: "Nova Station",
    accent: "#8ad9ff",
  },
];

const formatUpgradeNumber = (value: number) => Number(value.toFixed(8)).toString();

const getTargetName = (target: UpgradeTarget) =>
  target === "all" ? "All businesses" : businesses.find((business) => business.id === target)?.shortName ?? target;

const getUpgradeDescription = (target: UpgradeTarget, kind: UpgradeDefinition["kind"], value: number) => {
  switch (kind) {
    case "angelEffectiveness":
      return `Angel investor effectiveness +${formatUpgradeNumber(value)}%.`;
    case "owned":
      return `+${formatUpgradeNumber(value)} ${getTargetName(target)}.`;
    case "speed":
      return target === "all"
        ? `All business speeds x${formatUpgradeNumber(value)}.`
        : `${getTargetName(target)} speeds x${formatUpgradeNumber(value)}.`;
    case "profit":
      return target === "all"
        ? `All profits x${formatUpgradeNumber(value)}.`
        : `${getTargetName(target)} profits x${formatUpgradeNumber(value)}.`;
  }
};

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const createUpgrades = (
  rows: typeof earthCashUpgradeRows | typeof earthAngelUpgradeRows,
  currency: Currency,
) =>
  rows.map<UpgradeDefinition>(([name, target, cost, kind, multiplier], index) => ({
    id: `${currency}-${index + 1}-${slugify(name)}`,
    name,
    description: getUpgradeDescription(target, kind, multiplier),
    cost,
    currency,
    target,
    kind,
    multiplier,
  }));

export const cashUpgrades: UpgradeDefinition[] = createUpgrades(earthCashUpgradeRows, "cash");

export const angelUpgrades: UpgradeDefinition[] = createUpgrades(earthAngelUpgradeRows, "angels");

const businessUnlockGoals = [
  { goal: 25, kind: "speed", multiplier: 2, label: "Thermal Paste Applied" },
  { goal: 50, kind: "speed", multiplier: 2, label: "Cable Management" },
  { goal: 100, kind: "speed", multiplier: 2, label: "Shift Change" },
  { goal: 200, kind: "speed", multiplier: 2, label: "Firmware Tuning" },
  { goal: 300, kind: "speed", multiplier: 2, label: "No Downtime December" },
  { goal: 400, kind: "speed", multiplier: 2, label: "Parts Bin Miracle" },
  { goal: 500, kind: "profit", multiplier: 2, label: "Enterprise Contract" },
  { goal: 600, kind: "profit", multiplier: 2, label: "Procurement Machine" },
  { goal: 700, kind: "profit", multiplier: 2, label: "Margin Magic" },
  { goal: 800, kind: "profit", multiplier: 2, label: "Vendor Leverage" },
  { goal: 900, kind: "profit", multiplier: 2, label: "Invoice Avalanche" },
  { goal: 1_000, kind: "profit", multiplier: 3, label: "Market Capture" },
] as const;

export const businessUnlocks: UnlockDefinition[] = businesses.flatMap((business) =>
  businessUnlockGoals.map((unlock) => ({
    id: `${business.id}-${unlock.goal}`,
    name: `${business.shortName}: ${unlock.label}`,
    goal: unlock.goal,
    target: business.id,
    kind: unlock.kind,
    multiplier: unlock.multiplier,
  })),
);

export const allBusinessUnlocks: UnlockDefinition[] = [
  { id: "all-1", name: "Data Center Incorporated", goal: 1, target: "all", kind: "profit", multiplier: 2 },
  { id: "all-10", name: "Mogul Mode", goal: 10, target: "all", kind: "speed", multiplier: 2 },
  { id: "all-25", name: "Rack Baron", goal: 25, target: "all", kind: "speed", multiplier: 2 },
  { id: "all-50", name: "Compute Tycoon", goal: 50, target: "all", kind: "speed", multiplier: 2 },
  { id: "all-100", name: "Regional Monopoly", goal: 100, target: "all", kind: "profit", multiplier: 2 },
  { id: "all-200", name: "Theoretical Hyperscaler", goal: 200, target: "all", kind: "profit", multiplier: 2 },
  { id: "all-300", name: "Too Big To Throttle", goal: 300, target: "all", kind: "profit", multiplier: 3 },
  { id: "all-500", name: "Orbit-Ready Operator", goal: 500, target: "all", kind: "profit", multiplier: 3 },
  { id: "all-777", name: "Lucky Load Balancer", goal: 777, target: "all", kind: "profit", multiplier: 3 },
  { id: "all-1000", name: "Planetary Compute Grid", goal: 1_000, target: "all", kind: "profit", multiplier: 5 },
];

export const achievements: AchievementDefinition[] = [
  {
    id: "first-rig",
    name: "Garage Compute",
    description: "Own your first GPU Rig.",
  },
  {
    id: "first-manager",
    name: "Hands Off Keyboard",
    description: "Hire any manager.",
  },
  {
    id: "first-upgrade",
    name: "Capital Expenditure",
    description: "Buy any cash upgrade.",
  },
  {
    id: "millionaire",
    name: "Million Dollar Datacenter",
    description: "Earn $1 million in one session.",
  },
  {
    id: "first-angel",
    name: "Term Sheet From Heaven",
    description: "Attract your first angel investor.",
  },
  {
    id: "first-prestige",
    name: "Here We Compute Again",
    description: "Reset once to claim angel investors.",
  },
  {
    id: "all-automated",
    name: "Autonomous Operations",
    description: "Hire every business manager.",
  },
  {
    id: "all-100",
    name: "Hundred-Rack Mindset",
    description: "Own 100 of every business.",
  },
  {
    id: "ten-businesses",
    name: "Full Stack Founder",
    description: "Own at least one of all ten businesses.",
  },
  {
    id: "orbital-operator",
    name: "Low-Orbit Landlord",
    description: "Own your first Orbital Data Center.",
  },
  {
    id: "trillionaire",
    name: "Trillion Token Billing",
    description: "Earn $1 trillion across all sessions.",
  },
];

export const getBusiness = (id: BusinessId) => {
  const business = businesses.find((entry) => entry.id === id);

  if (!business) {
    throw new Error(`Unknown business: ${id}`);
  }

  return business;
};
