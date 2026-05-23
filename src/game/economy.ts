import type {
  AchievementDefinition,
  BusinessDefinition,
  BusinessId,
  Currency,
  UnlockDefinition,
  UpgradeDefinition,
  UpgradeTarget,
  WorldDefinition,
  WorldId,
} from "./types";
import { earthAngelUpgradeRows, earthCashUpgradeRows } from "./adventureCapitalistEarthData";
import { chinaAngelUpgradeRows, chinaCashUpgradeRows } from "./adventureCapitalistMarsData";

type UpgradeRow = readonly [string, UpgradeTarget, number, UpgradeDefinition["kind"], number];

export const SAVE_VERSION = 3;
export const BASE_ANGEL_BONUS = 0.02;
export const OFFLINE_CAP_SECONDS = 60 * 60 * 24 * 7;

const earthBusinesses: BusinessDefinition[] = [
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

const chinaBusinesses: BusinessDefinition[] = [
  {
    id: "rare-earth-mine",
    name: "Rare Earth Mine",
    shortName: "Rare Earth",
    caption: "Extract strategic minerals for the next hardware cycle.",
    baseCost: 0.05,
    costMultiplier: 1.01,
    baseRevenue: 0.011,
    baseDuration: 0.5,
    managerCost: 100,
    managerName: "Dirtwood Redsmith",
    accent: "#d94235",
  },
  {
    id: "e-commerce-marketplace",
    name: "E-Commerce Marketplace",
    shortName: "Marketplace",
    caption: "Flash sales, warehouse robots, and checkout fees.",
    baseCost: 1,
    costMultiplier: 1.03,
    baseRevenue: 1,
    baseDuration: 3,
    managerCost: 5_000,
    managerName: "General Candy Coates",
    accent: "#ffbf3f",
  },
  {
    id: "ev-plant",
    name: "EV Plant",
    shortName: "EV Plant",
    caption: "Stamp metal, ship batteries, optimize every line.",
    baseCost: 1_234,
    costMultiplier: 1.05,
    baseRevenue: 4_321,
    baseDuration: 9,
    managerCost: 10_000_000,
    managerName: 'Carlos "Roundhouse" Ray',
    accent: "#4fbf73",
  },
  {
    id: "drone-factory",
    name: "Drone Factory",
    shortName: "Drones",
    caption: "Tiny rotors, massive order book.",
    baseCost: 23_000_000,
    costMultiplier: 1.07,
    baseRevenue: 4_007_310,
    baseDuration: 32,
    managerCost: 1_000_000_000,
    managerName: "M. Wong",
    accent: "#3da8ff",
  },
  {
    id: "firewall-cloud",
    name: "Firewall Cloud",
    shortName: "Firewall",
    caption: "Compliance tooling with enterprise margins.",
    baseCost: 49_000_000_000,
    costMultiplier: 1.11,
    baseRevenue: 518_783_295,
    baseDuration: 64,
    managerCost: 400_000_000_000,
    managerName: "Hekhov A. Guy",
    accent: "#d86bd8",
  },
  {
    id: "livestream-agency",
    name: "Livestream Agency",
    shortName: "Livestreams",
    caption: "Creators, storefronts, and endless commission splits.",
    baseCost: 77_000_000_000_000,
    costMultiplier: 1.04,
    baseRevenue: 500_634_321,
    baseDuration: 4,
    managerCost: 100_000_000_000_000,
    managerName: "Sister Ack",
    accent: "#f26d50",
  },
  {
    id: "ai-tutor-app",
    name: "AI Tutor App",
    shortName: "AI Tutor",
    caption: "Personalized homework help with recurring billing.",
    baseCost: 5_000_000_000_000_000,
    costMultiplier: 1.07,
    baseRevenue: 7_543_177_325,
    baseDuration: 18,
    managerCost: 15_000_000_000_000_000,
    managerName: "Tommy K. Quaid",
    accent: "#72dcd1",
  },
  {
    id: "smartphone-campus",
    name: "Smartphone Campus",
    shortName: "Phones",
    caption: "Glass rectangles at planetary scale.",
    baseCost: 1_000_000_000_000_000_000,
    costMultiplier: 1.09,
    baseRevenue: 69_263_532_485,
    baseDuration: 42,
    managerCost: 10_000_000_000_000_000_000,
    managerName: "Marty Landsajob",
    accent: "#2ca35f",
  },
  {
    id: "semiconductor-foundry",
    name: "Semiconductor Foundry",
    shortName: "Foundry",
    caption: "Etch wafers, package accelerators, and sell the bottleneck.",
    baseCost: 650_000_000_000_000_000_000,
    costMultiplier: 1.12,
    baseRevenue: 3_800_000_000_000,
    baseDuration: 300,
    managerCost: 5_000_000_000_000_000_000_000,
    managerName: "Silicon Shen",
    accent: "#c15fdd",
  },
  {
    id: "high-speed-rail-grid",
    name: "High-Speed Rail Grid",
    shortName: "Rail Grid",
    caption: "Move people, freight, and valuations at speed.",
    baseCost: 13_000_000_000_000_000_000_000_000,
    costMultiplier: 1.25,
    baseRevenue: 99_760_000_000_000_000,
    baseDuration: 43_200,
    managerCost: 200_000_000_000_000_000_000_000_000,
    managerName: "Lieutenant Wildwebs",
    accent: "#6878ff",
  },
];

const formatUpgradeNumber = (value: number) => Number(value.toFixed(8)).toString();

const getTargetName = (businesses: BusinessDefinition[], target: UpgradeTarget) =>
  target === "all" ? "All businesses" : businesses.find((business) => business.id === target)?.shortName ?? target;

const getUpgradeDescription = (
  businesses: BusinessDefinition[],
  target: UpgradeTarget,
  kind: UpgradeDefinition["kind"],
  value: number,
) => {
  switch (kind) {
    case "angelEffectiveness":
      return `Angel investor effectiveness +${formatUpgradeNumber(value)}%.`;
    case "owned":
      return `+${formatUpgradeNumber(value)} ${getTargetName(businesses, target)}.`;
    case "speed":
      return target === "all"
        ? `All business speeds x${formatUpgradeNumber(value)}.`
        : `${getTargetName(businesses, target)} speeds x${formatUpgradeNumber(value)}.`;
    case "profit":
      return target === "all"
        ? `All profits x${formatUpgradeNumber(value)}.`
        : `${getTargetName(businesses, target)} profits x${formatUpgradeNumber(value)}.`;
  }
};

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const createUpgrades = (
  rows: readonly UpgradeRow[],
  currency: Currency,
  businesses: BusinessDefinition[],
) =>
  rows.map<UpgradeDefinition>(([name, target, cost, kind, multiplier], index) => ({
    id: `${currency}-${index + 1}-${slugify(name)}`,
    name,
    description: getUpgradeDescription(businesses, target, kind, multiplier),
    cost,
    currency,
    target,
    kind,
    multiplier,
  }));

const createBusinessUnlocks = (businesses: BusinessDefinition[]): UnlockDefinition[] =>
  businesses.flatMap((business) =>
    businessUnlockGoals.map((unlock) => ({
      id: `${business.id}-${unlock.goal}`,
      name: `${business.shortName}: ${unlock.label}`,
      goal: unlock.goal,
      target: business.id,
      kind: unlock.kind,
      multiplier: unlock.multiplier,
    })),
  );

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

const baseAllBusinessUnlocks: UnlockDefinition[] = [
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

const buildWorld = ({
  id,
  name,
  shortName,
  description,
  currencyName,
  currencySymbol,
  unlockCostMegaBucks,
  startingCash,
  businesses,
  cashUpgradeRows,
  angelUpgradeRows,
}: {
  id: WorldId;
  name: string;
  shortName: string;
  description: string;
  currencyName: string;
  currencySymbol: string;
  unlockCostMegaBucks: number;
  startingCash: number;
  businesses: BusinessDefinition[];
  cashUpgradeRows: readonly UpgradeRow[];
  angelUpgradeRows: readonly UpgradeRow[];
}): WorldDefinition => ({
  id,
  name,
  shortName,
  description,
  currencyName,
  currencySymbol,
  unlockCostMegaBucks,
  startingCash,
  businesses,
  cashUpgrades: createUpgrades(cashUpgradeRows, "cash", businesses),
  angelUpgrades: createUpgrades(angelUpgradeRows, "angels", businesses),
  businessUnlocks: createBusinessUnlocks(businesses),
  allBusinessUnlocks: baseAllBusinessUnlocks,
  achievements,
});

export const earthWorld = buildWorld({
  id: "earth",
  name: "Earth",
  shortName: "GPU",
  description: "The original San Francisco compute market.",
  currencyName: "Dollars",
  currencySymbol: "$",
  unlockCostMegaBucks: 0,
  startingCash: 4,
  businesses: earthBusinesses,
  cashUpgradeRows: earthCashUpgradeRows,
  angelUpgradeRows: earthAngelUpgradeRows,
});

export const chinaWorld = buildWorld({
  id: "china",
  name: "China",
  shortName: "China",
  description: "A yuan-denominated market with Mars-style pacing.",
  currencyName: "Yuan",
  currencySymbol: "¥",
  unlockCostMegaBucks: 100,
  startingCash: 0.05,
  businesses: chinaBusinesses,
  cashUpgradeRows: chinaCashUpgradeRows,
  angelUpgradeRows: chinaAngelUpgradeRows,
});

export const worlds = {
  earth: earthWorld,
  china: chinaWorld,
} satisfies Record<WorldId, WorldDefinition>;

export const worldList = Object.values(worlds);

export const businesses = earthWorld.businesses;
export const cashUpgrades = earthWorld.cashUpgrades;
export const angelUpgrades = earthWorld.angelUpgrades;
export const businessUnlocks = earthWorld.businessUnlocks;
export const allBusinessUnlocks = earthWorld.allBusinessUnlocks;

export const getWorld = (id: WorldId) => worlds[id] ?? earthWorld;

export const getBusiness = (id: BusinessId, world: WorldDefinition = earthWorld) => {
  const business = world.businesses.find((entry) => entry.id === id);

  if (!business) {
    throw new Error(`Unknown business: ${id}`);
  }

  return business;
};
