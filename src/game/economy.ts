import type {
  AchievementDefinition,
  BusinessDefinition,
  BusinessId,
  UnlockDefinition,
  UpgradeDefinition,
} from "./types";

export const SAVE_VERSION = 1;
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
    managerCost: 2_500_000,
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
    managerCost: 100_000_000,
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
];

const businessUpgradeNames: Record<BusinessId, string[]> = {
  "single-gpu-rig": ["RGB Fans", "Used Enterprise Cards", "Weekend Overclock"],
  "render-rack": ["Shader Cache", "Queue Optimizer", "Specular Upsell"],
  "inference-cluster": ["Tokenizer Turbo", "Batching Broker", "Low-Latency Lobbies"],
  "training-pod": ["Gradient Grease", "Checkpoint Vault", "Epoch Express"],
  "colocation-hall": ["Raised Floor", "Smart PDUs", "Contractual Uptime"],
  "asic-farm": ["Immersion Baths", "Hashrate Hedges", "Firmware Fortune"],
  "cloud-region": ["Availability Zones", "Reserved Instances", "Premium Egress"],
  "hyperscale-campus": ["Substation Handshake", "Lake Loop Cooling", "Sovereign Campus"],
};

const businessCashUpgradeCosts: Record<BusinessId, number[]> = {
  "single-gpu-rig": [250, 25_000, 2_500_000],
  "render-rack": [1_000, 100_000, 10_000_000],
  "inference-cluster": [10_000, 1_000_000, 100_000_000],
  "training-pod": [100_000, 10_000_000, 1_000_000_000],
  "colocation-hall": [1_000_000, 100_000_000, 10_000_000_000],
  "asic-farm": [10_000_000, 1_000_000_000, 100_000_000_000],
  "cloud-region": [100_000_000, 10_000_000_000, 1_000_000_000_000],
  "hyperscale-campus": [1_000_000_000, 100_000_000_000, 10_000_000_000_000],
};

const generatedCashUpgrades = businesses.flatMap((business) =>
  businessUpgradeNames[business.id].map<UpgradeDefinition>((name, index) => ({
    id: `${business.id}-cash-${index + 1}`,
    name,
    description: `${business.shortName} profits x${index === 2 ? 5 : 3}.`,
    cost: businessCashUpgradeCosts[business.id][index],
    currency: "cash",
    target: business.id,
    kind: "profit",
    multiplier: index === 2 ? 5 : 3,
  })),
);

export const cashUpgrades: UpgradeDefinition[] = [
  ...generatedCashUpgrades,
  {
    id: "all-liquid-cooling",
    name: "Liquid Cooling Lobbyists",
    description: "All profits x3.",
    cost: 50_000_000,
    currency: "cash",
    target: "all",
    kind: "profit",
    multiplier: 3,
  },
  {
    id: "all-power-contract",
    name: "Suspiciously Cheap Power",
    description: "All profits x5.",
    cost: 5_000_000_000,
    currency: "cash",
    target: "all",
    kind: "profit",
    multiplier: 5,
  },
  {
    id: "all-fiber-backbone",
    name: "Private Fiber Backbone",
    description: "All profits x7.",
    cost: 500_000_000_000,
    currency: "cash",
    target: "all",
    kind: "profit",
    multiplier: 7,
  },
  {
    id: "angel-share-plan",
    name: "Angel Share Plan",
    description: "Angel effectiveness x2.",
    cost: 1_000_000_000_000,
    currency: "cash",
    target: "all",
    kind: "angelEffectiveness",
    multiplier: 2,
  },
];

export const angelUpgrades: UpgradeDefinition[] = [
  {
    id: "angel-seed-round",
    name: "Seed Round From Above",
    description: "All profits x3.",
    cost: 10,
    currency: "angels",
    target: "all",
    kind: "profit",
    multiplier: 3,
  },
  {
    id: "angel-cooling",
    name: "Celestial Cooling",
    description: "All business speeds x2.",
    cost: 50,
    currency: "angels",
    target: "all",
    kind: "speed",
    multiplier: 2,
  },
  {
    id: "angel-inference",
    name: "Prophetic Inference",
    description: "Inference Cluster profits x9.",
    cost: 250,
    currency: "angels",
    target: "inference-cluster",
    kind: "profit",
    multiplier: 9,
  },
  {
    id: "angel-training",
    name: "Heavenly Hyperparameters",
    description: "Training Pod profits x9.",
    cost: 1_000,
    currency: "angels",
    target: "training-pod",
    kind: "profit",
    multiplier: 9,
  },
  {
    id: "angel-campus",
    name: "Clouds Above The Cloud",
    description: "All profits x15.",
    cost: 10_000,
    currency: "angels",
    target: "all",
    kind: "profit",
    multiplier: 15,
  },
  {
    id: "angel-efficiency",
    name: "Board Seat With Wings",
    description: "Angel effectiveness x2.",
    cost: 100_000,
    currency: "angels",
    target: "all",
    kind: "angelEffectiveness",
    multiplier: 2,
  },
];

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
  { id: "all-25", name: "Mogul Mode", goal: 25, target: "all", kind: "speed", multiplier: 2 },
  { id: "all-50", name: "Rack Baron", goal: 50, target: "all", kind: "speed", multiplier: 2 },
  { id: "all-100", name: "Compute Tycoon", goal: 100, target: "all", kind: "speed", multiplier: 2 },
  { id: "all-200", name: "Regional Monopoly", goal: 200, target: "all", kind: "profit", multiplier: 2 },
  { id: "all-300", name: "Theoretical Hyperscaler", goal: 300, target: "all", kind: "profit", multiplier: 2 },
  { id: "all-500", name: "Too Big To Throttle", goal: 500, target: "all", kind: "profit", multiplier: 3 },
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
