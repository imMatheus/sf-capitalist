import type {
  AchievementDefinition,
  AngelInvestorLabels,
  BusinessDefinition,
  BusinessId,
  Currency,
  UnlockDefinition,
  UpgradeDefinition,
  UpgradeTarget,
  WorldDefinition,
  WorldId,
  WorldUnlockCost,
} from "./types";
import { siliconValleyAngelUpgradeRows, siliconValleyCashUpgradeRows } from "./siliconValleyData";
import {
  siliconValleyAllBusinessUnlockRows,
  siliconValleyBusinessUnlockRowsById,
} from "./siliconValleyUnlockData";
import { chinaAngelUpgradeRows, chinaCashUpgradeRows } from "./chinaData";
import { chinaAllBusinessUnlockRows, chinaBusinessUnlockRowsById } from "./chinaUnlockData";
import { europeAngelUpgradeRows, europeCashUpgradeRows } from "./europeData";
import {
  europeAllBusinessUnlockRows,
  europeBusinessUnlockRowsById,
} from "./europeUnlockData";

type UpgradeRow = readonly [string, UpgradeTarget, number, UpgradeDefinition["kind"], number];

export const SAVE_VERSION = 4;
export const BASE_ANGEL_BONUS = 0.02;
export const OFFLINE_CAP_SECONDS = 60 * 60 * 24 * 7;

const siliconValleyBusinesses: BusinessDefinition[] = [
  {
    id: "bitcoin-miner",
    name: "Bitcoin Miner",
    caption: "Hash rates, cheap power, and a wallet full of upside.",
    baseCost: 4,
    costMultiplier: 1.07,
    baseRevenue: 1,
    baseDuration: 0.6,
    managerCost: 1_000,
    managerName: "Ada Lovelace Ops",
    accent: "#f7d94c",
  },
  {
    id: "yc",
    name: "YC",
    caption: "Batch applications, demo days, and compounding cap tables.",
    baseCost: 60,
    costMultiplier: 1.15,
    baseRevenue: 60,
    baseDuration: 3,
    managerCost: 15_000,
    managerName: "Ray Tracey",
    accent: "#63d2ff",
  },
  {
    id: "waymo",
    name: "Waymo",
    caption: "Autonomous miles with a premium per pickup.",
    baseCost: 720,
    costMultiplier: 1.14,
    baseRevenue: 540,
    baseDuration: 6,
    managerCost: 100_000,
    managerName: "Max Tokens",
    accent: "#9af06f",
  },
  {
    id: "stanford-dropout",
    name: "Stanford Dropout",
    caption: "One unfinished degree and a very finished pitch deck.",
    baseCost: 8_640,
    costMultiplier: 1.13,
    baseRevenue: 4_320,
    baseDuration: 12,
    managerCost: 500_000,
    managerName: "Grad Descent",
    accent: "#ff8a5b",
  },
  {
    id: "h100-gpu-cluster",
    name: "H100 GPU Cluster",
    caption: "Scarce accelerators rented by the hour.",
    baseCost: 103_680,
    costMultiplier: 1.12,
    baseRevenue: 51_840,
    baseDuration: 24,
    managerCost: 1_200_000,
    managerName: "Holly Aisle",
    accent: "#ff6f91",
  },
  {
    id: "cursor-tab",
    name: "Cursor Tab",
    caption: "Autocomplete turns keystrokes into revenue.",
    baseCost: 1_244_160,
    costMultiplier: 1.11,
    baseRevenue: 622_080,
    baseDuration: 96,
    managerCost: 10_000_000,
    managerName: "Hash Gordon",
    accent: "#c59bff",
  },
  {
    id: "polymarket",
    name: "Polymarket",
    caption: "Trade outcomes before anyone agrees what happened.",
    baseCost: 14_929_920,
    costMultiplier: 1.1,
    baseRevenue: 7_464_960,
    baseDuration: 384,
    managerCost: 111_111_111,
    managerName: "Reg Ion",
    accent: "#78f5c5",
  },
  {
    id: "chatgpt-3-5",
    name: "ChatGPT-3.5",
    caption: "Consumer AI at scale, billed one prompt at a time.",
    baseCost: 179_159_040,
    costMultiplier: 1.09,
    baseRevenue: 89_579_520,
    baseDuration: 1_536,
    managerCost: 555_555_555,
    managerName: "Carrie Capacity",
    accent: "#ffcb8a",
  },
  {
    id: "nvidia",
    name: "Nvidia",
    caption: "Sell the picks, shovels, and most of the mountain.",
    baseCost: 2_149_908_480,
    costMultiplier: 1.08,
    baseRevenue: 1_074_954_240,
    baseDuration: 6_144,
    managerCost: 10_000_000_000,
    managerName: "Vector Prime",
    accent: "#a4e86f",
  },
  {
    id: "agi",
    name: "AGI",
    caption: "The final demo that somehow still has a pricing page.",
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
    id: "pandabuy-agent",
    name: "PandaBuy Agent",
    caption: "Source the haul, manage the warehouse, collect the spread.",
    baseCost: 0.05,
    costMultiplier: 1.01,
    baseRevenue: 0.011,
    baseDuration: 0.5,
    managerCost: 100,
    managerName: "Dirtwood Redsmith",
    accent: "#d94235",
  },
  {
    id: "shein-factory",
    name: "Shein Factory",
    caption: "Fast fashion, faster iteration, endless new SKUs.",
    baseCost: 1,
    costMultiplier: 1.03,
    baseRevenue: 1,
    baseDuration: 3,
    managerCost: 5_000,
    managerName: "General Candy Coates",
    accent: "#ffbf3f",
  },
  {
    id: "wechat",
    name: "WeChat",
    caption: "Messages, payments, shops, and daily life in one feed.",
    baseCost: 1_234,
    costMultiplier: 1.05,
    baseRevenue: 4_321,
    baseDuration: 9,
    managerCost: 10_000_000,
    managerName: 'Carlos "Roundhouse" Ray',
    accent: "#4fbf73",
  },
  {
    id: "drone-swarm",
    name: "Drone Swarm",
    caption: "Tiny rotors coordinated into a very large invoice.",
    baseCost: 23_000_000,
    costMultiplier: 1.07,
    baseRevenue: 4_007_310,
    baseDuration: 32,
    managerCost: 1_000_000_000,
    managerName: "M. Wong",
    accent: "#3da8ff",
  },
  {
    id: "tiktok-algo",
    name: "TikTok Algo",
    caption: "Attention routed through an infinitely tuned ranking loop.",
    baseCost: 49_000_000_000,
    costMultiplier: 1.11,
    baseRevenue: 518_783_295,
    baseDuration: 64,
    managerCost: 400_000_000_000,
    managerName: "Hekhov A. Guy",
    accent: "#d86bd8",
  },
  {
    id: "huawei-phone",
    name: "Huawei Phone",
    caption: "Premium hardware with a vertically integrated supply chain.",
    baseCost: 77_000_000_000_000,
    costMultiplier: 1.04,
    baseRevenue: 500_634_321,
    baseDuration: 4,
    managerCost: 100_000_000_000_000,
    managerName: "Sister Ack",
    accent: "#f26d50",
  },
  {
    id: "kimi",
    name: "Kimi",
    caption: "Long-context answers for every tab you forgot was open.",
    baseCost: 5_000_000_000_000_000,
    costMultiplier: 1.07,
    baseRevenue: 7_543_177_325,
    baseDuration: 18,
    managerCost: 15_000_000_000_000_000,
    managerName: "Tommy K. Quaid",
    accent: "#72dcd1",
  },
  {
    id: "robot-dog",
    name: "Robot Dog",
    caption: "Quadruped hardware with a surprisingly loyal margin.",
    baseCost: 1_000_000_000_000_000_000,
    costMultiplier: 1.09,
    baseRevenue: 69_263_532_485,
    baseDuration: 42,
    managerCost: 10_000_000_000_000_000_000,
    managerName: "Marty Landsajob",
    accent: "#2ca35f",
  },
  {
    id: "amd-chip",
    name: "AMD CHIP",
    caption: "Accelerator silicon for anyone chasing the green team.",
    baseCost: 650_000_000_000_000_000_000,
    costMultiplier: 1.12,
    baseRevenue: 3_800_000_000_000,
    baseDuration: 300,
    managerCost: 5_000_000_000_000_000_000_000,
    managerName: "Silicon Shen",
    accent: "#c15fdd",
  },
  {
    id: "deepseek",
    name: "DeepSeek",
    caption: "Open weights, sharp benchmarks, and cheaper inference.",
    baseCost: 13_000_000_000_000_000_000_000_000,
    costMultiplier: 1.25,
    baseRevenue: 99_760_000_000_000_000,
    baseDuration: 43_200,
    managerCost: 200_000_000_000_000_000_000_000_000,
    managerName: "Lieutenant Wildwebs",
    accent: "#6878ff",
  },
];

const europeBusinesses: BusinessDefinition[] = [
  {
    id: "ikea-meatball",
    name: "Ikea Meatball",
    caption: "Flat-pack dining economics with cafeteria-scale throughput.",
    baseCost: 5,
    costMultiplier: 1.05,
    baseRevenue: 1,
    baseDuration: 2,
    managerCost: 750,
    managerName: "Lena Lensmaker",
    accent: "#2f7fd1",
  },
  {
    id: "gdpr-compliance",
    name: "GDPR Compliance",
    caption: "Consent banners, audit trails, and billable paperwork.",
    baseCost: 105,
    costMultiplier: 1.21,
    baseRevenue: 21,
    baseDuration: 7,
    managerCost: 22_500,
    managerName: "Gracie Stone",
    accent: "#9b6ee3",
  },
  {
    id: "parental-leave",
    name: "Parental Leave",
    caption: "Time off, strong benefits, and productivity that still ships.",
    baseCost: 2_929,
    costMultiplier: 1.07,
    baseRevenue: 2_001,
    baseDuration: 28,
    managerCost: 150_000,
    managerName: "Dolly Pardon",
    accent: "#51b7b1",
  },
  {
    id: "lovable-credits",
    name: "Lovable Credits",
    caption: "Prompt-to-product tokens for the app you built at lunch.",
    baseCost: 42_525,
    costMultiplier: 1.19,
    baseRevenue: 376,
    baseDuration: 2,
    managerCost: 1_850_000,
    managerName: "Jean Luc Turanga",
    accent: "#ef8d31",
  },
  {
    id: "berghain-club",
    name: "Berghain Club",
    caption: "Scarce entry, loud rooms, and impeccable pricing power.",
    baseCost: 493_025,
    costMultiplier: 1.09,
    baseRevenue: 98_820,
    baseDuration: 45,
    managerCost: 4_300_000,
    managerName: "Strange Lange",
    accent: "#61a544",
  },
  {
    id: "elevenlabs-dj",
    name: "ElevenLabs DJ",
    caption: "Synthetic voices over a four-on-the-floor revenue loop.",
    baseCost: 18_753_525,
    costMultiplier: 1.15,
    baseRevenue: 1_976_400,
    baseDuration: 180,
    managerCost: 145_000_000,
    managerName: "Hurdy Gurdy",
    accent: "#4da3e6",
  },
  {
    id: "tethered-bottle-cap",
    name: "Tethered Bottle Cap",
    caption: "A tiny regulation with continent-scale manufacturing impact.",
    baseCost: 393_824_025,
    costMultiplier: 1.13,
    baseRevenue: 32_940_000,
    baseDuration: 600,
    managerCost: 33_333_000_000,
    managerName: "Nick Gromcraft",
    accent: "#f0c34f",
  },
  {
    id: "public-transport",
    name: "Public Transport",
    caption: "Trains, trams, and monthly passes at civic scale.",
    baseCost: 8_270_304_525,
    costMultiplier: 1.17,
    baseRevenue: 1_152_900_000,
    baseDuration: 3_000,
    managerCost: 55_000_000_000,
    managerName: "Willy Dizzy",
    accent: "#e35b68",
  },
  {
    id: "renewable-energy",
    name: "Renewable Energy",
    caption: "Wind, solar, and grid balancing with subsidized upside.",
    baseCost: 173_676_395_025,
    costMultiplier: 1.11,
    baseRevenue: 11_067_840_000,
    baseDuration: 14_400,
    managerCost: 1_530_000_000_000,
    managerName: "Mike Jameson Wolf",
    accent: "#8958d4",
  },
  {
    id: "cern",
    name: "CERN",
    caption: "Particle physics, big tunnels, and grant-sized revenue.",
    baseCost: 1_000_000_000_000,
    costMultiplier: 1.5,
    baseRevenue: 332_035_200_000,
    baseDuration: 86_400,
    managerCost: 11_109_000_000_000,
    managerName: "Dr. Bad News",
    accent: "#d8463f",
  },
];

const formatUpgradeNumber = (value: number) => Number(value.toFixed(8)).toString();

const getTargetName = (businesses: BusinessDefinition[], target: UpgradeTarget) =>
  target === "all" ? "All businesses" : businesses.find((business) => business.id === target)?.name ?? target;

const getUpgradeDescription = (
  businesses: BusinessDefinition[],
  target: UpgradeTarget,
  kind: UpgradeDefinition["kind"],
  value: number,
  angelInvestorLabels: AngelInvestorLabels,
) => {
  switch (kind) {
    case "angelEffectiveness":
      return `${angelInvestorLabels.shortSingular} effectiveness +${formatUpgradeNumber(value)}%.`;
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
  angelInvestorLabels: AngelInvestorLabels,
) =>
  rows.map<UpgradeDefinition>(([name, target, cost, kind, multiplier], index) => ({
    id: `${currency}-${index + 1}-${slugify(name)}`,
    name,
    description: getUpgradeDescription(businesses, target, kind, multiplier, angelInvestorLabels),
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
      name: `${business.name}: ${unlock.label}`,
      goal: unlock.goal,
      target: business.id,
      kind: unlock.kind,
      multiplier: unlock.multiplier,
    })),
  );

const createSiliconValleyBusinessUnlocks = (
  businesses: BusinessDefinition[],
): UnlockDefinition[] =>
  businesses.flatMap<UnlockDefinition>((business) => {
    const rows = siliconValleyBusinessUnlockRowsById[business.id];

    if (!rows) {
      return businessUnlockGoals.map((unlock) => ({
        id: `${business.id}-${unlock.goal}`,
        name: `${business.name}: ${unlock.label}`,
        goal: unlock.goal,
        target: business.id,
        kind: unlock.kind,
        multiplier: unlock.multiplier,
      }));
    }

    return rows.map(([name, goal, target, kind, multiplier, reward]) => ({
      id: `${business.id}-${goal}-${slugify(name)}`,
      name: `${business.name}: ${name}`,
      goal,
      triggerTarget: target === business.id ? undefined : business.id,
      target,
      kind,
      multiplier,
      reward,
    }));
  });

const siliconValleyAllBusinessUnlocks: UnlockDefinition[] =
  siliconValleyAllBusinessUnlockRows.map(([name, goal, target, kind, multiplier, reward]) => ({
    id: `all-${goal}-${slugify(name)}`,
    name,
    goal,
    target,
    kind,
    multiplier,
    reward,
  }));

const createChinaBusinessUnlocks = (businesses: BusinessDefinition[]): UnlockDefinition[] =>
  businesses.flatMap<UnlockDefinition>((business) => {
    const rows = chinaBusinessUnlockRowsById[business.id];

    if (!rows) {
      return businessUnlockGoals.map((unlock) => ({
        id: `${business.id}-${unlock.goal}`,
        name: `${business.name}: ${unlock.label}`,
        goal: unlock.goal,
        target: business.id,
        kind: unlock.kind,
        multiplier: unlock.multiplier,
      }));
    }

    return rows.map(([name, goal, kind, multiplier]) => ({
      id: `${business.id}-${goal}-${slugify(name)}`,
      name: `${business.name}: ${name}`,
      goal,
      target: business.id,
      kind,
      multiplier,
    }));
  });

const chinaAllBusinessUnlocks: UnlockDefinition[] = chinaAllBusinessUnlockRows.map(
  ([name, goal, kind, multiplier]) => ({
    id: `all-${goal}-${slugify(name)}`,
    name,
    goal,
    target: "all",
    kind,
    multiplier,
  }),
);

const createEuropeBusinessUnlocks = (
  businesses: BusinessDefinition[],
): UnlockDefinition[] =>
  businesses.flatMap<UnlockDefinition>((business) => {
    const rows = europeBusinessUnlockRowsById[business.id];

    if (!rows) {
      return businessUnlockGoals.map((unlock) => ({
        id: `${business.id}-${unlock.goal}`,
        name: `${business.name}: ${unlock.label}`,
        goal: unlock.goal,
        target: business.id,
        kind: unlock.kind,
        multiplier: unlock.multiplier,
      }));
    }

    return rows.map(([name, goal, target, kind, multiplier]) => ({
      id: `${business.id}-${goal}-${slugify(name)}`,
      name: `${business.name}: ${name}`,
      goal,
      triggerTarget: target === business.id ? undefined : business.id,
      target,
      kind,
      multiplier,
    }));
  });

const europeAllBusinessUnlocks: UnlockDefinition[] =
  europeAllBusinessUnlockRows.map(([name, goal, target, kind, multiplier]) => ({
    id: `all-${goal}-${slugify(name)}`,
    name,
    goal,
    target,
    kind,
    multiplier,
  }));

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

const createAchievements = (angelInvestorLabels: AngelInvestorLabels): AchievementDefinition[] => [
  {
    id: "first-rig",
    name: "First Block",
    description: "Own your first Bitcoin Miner.",
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
    name: "Million Dollar Demo Day",
    description: "Earn $1 million in one session.",
  },
  {
    id: "first-angel",
    name: "Term Sheet From Heaven",
    description: `Attract your first ${angelInvestorLabels.singular}.`,
  },
  {
    id: "first-prestige",
    name: "Here We Compute Again",
    description: `Reset once to claim ${angelInvestorLabels.plural}.`,
  },
  {
    id: "all-automated",
    name: "Autonomous Operations",
    description: "Hire every business manager.",
  },
  {
    id: "all-100",
    name: "Hundred-Startup Mindset",
    description: "Own 100 of every business.",
  },
  {
    id: "ten-businesses",
    name: "Full Stack Founder",
    description: "Own at least one of all ten businesses.",
  },
  {
    id: "orbital-operator",
    name: "AGI Operator",
    description: "Own your first AGI.",
  },
  {
    id: "trillionaire",
    name: "Trillion Token Billing",
    description: "Earn $1 trillion across all sessions.",
  },
];

export const achievements = createAchievements({
  singular: "a16z scout",
  plural: "a16z scouts",
  shortSingular: "Scout",
  shortPlural: "Scouts",
});

const buildWorld = ({
  id,
  name,
  description,
  currencyName,
  currencySymbol,
  angelInvestorLabels,
  unlockCost,
  startingCash,
  businesses,
  cashUpgradeRows,
  angelUpgradeRows,
  businessUnlocks,
  allBusinessUnlocks,
}: {
  id: WorldId;
  name: string;
  description: string;
  currencyName: string;
  currencySymbol: string;
  angelInvestorLabels: AngelInvestorLabels;
  unlockCost: WorldUnlockCost;
  startingCash: number;
  businesses: BusinessDefinition[];
  cashUpgradeRows: readonly UpgradeRow[];
  angelUpgradeRows: readonly UpgradeRow[];
  businessUnlocks?: UnlockDefinition[];
  allBusinessUnlocks?: UnlockDefinition[];
}): WorldDefinition => ({
  id,
  name,
  description,
  currencyName,
  currencySymbol,
  angelInvestorLabels,
  unlockCost,
  startingCash,
  businesses,
  cashUpgrades: createUpgrades(cashUpgradeRows, "cash", businesses, angelInvestorLabels),
  angelUpgrades: createUpgrades(angelUpgradeRows, "angels", businesses, angelInvestorLabels),
  businessUnlocks: businessUnlocks ?? createBusinessUnlocks(businesses),
  allBusinessUnlocks: allBusinessUnlocks ?? baseAllBusinessUnlocks,
  achievements: createAchievements(angelInvestorLabels),
});

export const siliconValleyWorld = buildWorld({
  id: "silicon-valley",
  name: "Silicon Valley",
  description: "The original San Francisco compute market.",
  currencyName: "Dollars",
  currencySymbol: "$",
  angelInvestorLabels: {
    singular: "a16z scout",
    plural: "a16z scouts",
    shortSingular: "Scout",
    shortPlural: "Scouts",
  },
  unlockCost: { currency: "free", amount: 0 },
  startingCash: 4,
  businesses: siliconValleyBusinesses,
  cashUpgradeRows: siliconValleyCashUpgradeRows,
  angelUpgradeRows: siliconValleyAngelUpgradeRows,
  businessUnlocks: createSiliconValleyBusinessUnlocks(siliconValleyBusinesses),
  allBusinessUnlocks: siliconValleyAllBusinessUnlocks,
});

export const chinaWorld = buildWorld({
  id: "china",
  name: "China",
  description: "A yuan-denominated market with China-style pacing.",
  currencyName: "Yuan",
  currencySymbol: "¥",
  angelInvestorLabels: {
    singular: "HongShan scout",
    plural: "HongShan scouts",
    shortSingular: "Scout",
    shortPlural: "Scouts",
  },
  unlockCost: { currency: "megaBucks", amount: 100 },
  startingCash: 0.05,
  businesses: chinaBusinesses,
  cashUpgradeRows: chinaCashUpgradeRows,
  angelUpgradeRows: chinaAngelUpgradeRows,
  businessUnlocks: createChinaBusinessUnlocks(chinaBusinesses),
  allBusinessUnlocks: chinaAllBusinessUnlocks,
});

export const europeWorld = buildWorld({
  id: "europe",
  name: "Europe",
  description: "A euro-denominated market with Europe-style pacing.",
  currencyName: "Euros",
  currencySymbol: "€",
  angelInvestorLabels: {
    singular: "EQT scout",
    plural: "EQT scouts",
    shortSingular: "scout",
    shortPlural: "scouts",
  },
  unlockCost: { currency: "siliconValleyCash", amount: 10 }, // MATHEUS
  // unlockCost: { currency: "siliconValleyCash", amount: 100_000_000_000_000 },
  startingCash: 5,
  businesses: europeBusinesses,
  cashUpgradeRows: europeCashUpgradeRows,
  angelUpgradeRows: europeAngelUpgradeRows,
  businessUnlocks: createEuropeBusinessUnlocks(europeBusinesses),
  allBusinessUnlocks: europeAllBusinessUnlocks,
});

export const worlds = {
  "silicon-valley": siliconValleyWorld,
  china: chinaWorld,
  europe: europeWorld,
} satisfies Record<WorldId, WorldDefinition>;

export const worldList = Object.values(worlds);

export const businesses = siliconValleyWorld.businesses;
export const cashUpgrades = siliconValleyWorld.cashUpgrades;
export const angelUpgrades = siliconValleyWorld.angelUpgrades;
export const businessUnlocks = siliconValleyWorld.businessUnlocks;
export const allBusinessUnlocks = siliconValleyWorld.allBusinessUnlocks;

export const getWorld = (id: WorldId) => worlds[id] ?? siliconValleyWorld;

export const getBusiness = (id: BusinessId, world: WorldDefinition = siliconValleyWorld) => {
  const business = world.businesses.find((entry) => entry.id === id);

  if (!business) {
    throw new Error(`Unknown business: ${id}`);
  }

  return business;
};
