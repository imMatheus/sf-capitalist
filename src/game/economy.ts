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
  WorldUnlockCost,
} from "./types";
import { siliconValleyAngelUpgradeRows, siliconValleyCashUpgradeRows } from "./siliconValleyData";
import { chinaAngelUpgradeRows, chinaCashUpgradeRows } from "./chinaData";
import { europeAngelUpgradeRows, europeCashUpgradeRows } from "./europeData";

type UpgradeRow = readonly [string, UpgradeTarget, number, UpgradeDefinition["kind"], number];

export const SAVE_VERSION = 4;
export const BASE_ANGEL_BONUS = 0.02;
export const OFFLINE_CAP_SECONDS = 60 * 60 * 24 * 7;

const siliconValleyBusinesses: BusinessDefinition[] = [
  {
    id: "bitcoin-miner",
    name: "Bitcoin Miner",
    shortName: "Bitcoin",
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
    shortName: "YC",
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
    shortName: "Waymo",
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
    shortName: "Dropout",
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
    shortName: "H100 Cluster",
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
    shortName: "Cursor",
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
    shortName: "Polymarket",
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
    shortName: "GPT-3.5",
    caption: "Consumer AI at scale, billed one prompt at a time.",
    baseCost: 179_159_040,
    costMultiplier: 1.09,
    baseRevenue: 89_579_520,
    baseDuration: 1_536,
    managerCost: 1_000_000_000,
    managerName: "Carrie Capacity",
    accent: "#ffcb8a",
  },
  {
    id: "nvidia",
    name: "Nvidia",
    shortName: "Nvidia",
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
    shortName: "AGI",
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
    shortName: "PandaBuy",
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
    shortName: "Shein",
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
    shortName: "WeChat",
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
    shortName: "Drones",
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
    shortName: "TikTok",
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
    shortName: "Huawei",
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
    shortName: "Kimi",
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
    shortName: "Robot Dog",
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
    shortName: "AMD Chip",
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
    shortName: "DeepSeek",
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
    shortName: "Meatball",
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
    shortName: "GDPR",
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
    shortName: "Leave",
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
    shortName: "Lovable",
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
    shortName: "Berghain",
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
    shortName: "11Labs DJ",
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
    shortName: "Bottle Cap",
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
    shortName: "Transport",
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
    shortName: "Renewables",
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
    shortName: "CERN",
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

const createEuropeStyleBusinessUnlocks = (businesses: BusinessDefinition[]): UnlockDefinition[] => {
  const byIndex: Array<Array<[string, number, number]>> = [
    [
      ["Start A Trend", 10, 3.5],
      ["One Small Step", 20, 4],
      ["Low-G Catwalks", 40, 4.5],
      ["Bounce-Friendly", 80, 5],
      ["Hipster Approved", 160, 5.5],
      ["Made For Walking", 320, 6],
      ["Walking On Sunshine", 640, 6.5],
      ["Miami Over Market", 1280, 7],
      ["Shoe-t To Thrill", 2560, 7.5],
      ["Market Walker", 5120, 999_999_999],
      ["Fly Me To The Boots", 10000, 3.5],
    ],
    Array.from({ length: 27 }, (_, index) => [
      `Gravity Tier ${index + 1}`,
      [30, 60, 90, 120, 160, 200, 240, 280, 330, 380, 430, 480, 540, 600, 660, 720, 790, 860, 940, 1020, 1110, 1200, 1400, 1600, 1800, 2000, 2400][index],
      index === 25 ? 999_999_999 : index < 15 ? 1.5 + index * 0.25 : 5.5 + (index - 15) * 0.25,
    ]),
    [
      ...[10, 20, 40, 60, 80, 100, 120, 240, 480, 600, 1080, 1320, 1800, 2160, 2520, 2880].map(
        (goal, index) => [`Clone Tier ${index + 1}`, goal, 3] as [string, number, number],
      ),
      ["Fresh Shipment of Sam", 360, 3],
      ["What's Mine Is Mine", 840, 3],
      ["1 Eighth Mini-Yous", 1560, 3],
      ["The Clone Skirmishes", 3240, 33],
      ["Sheep Attack", 3600, 33],
      ["Don't Step On Mitosis", 4000, 33],
      ["Repeat Business", 4400, 33],
      ["Double Your Fun", 4800, 33],
      ["Mixed Doubles", 5200, 3333],
      ["Two's Company", 5600, 3333],
      ["Three's A Crowd", 6000, 3333],
      ["So Is Four", 6666, 3333],
    ],
    [25, 50, 75, 100, 150, 200, 250, 300, 350, 400, 450, 500, 700, 900, 1100, 1300, 1500, 1700, 1900, 2100, 2300, 2500].map(
      (goal, index) => [`Express Tier ${index + 1}`, goal, index < 4 ? 3 : index < 11 ? 6 : (index - 10) * 12] as [string, number, number],
    ),
    [
      ["Everyone Knows Your Name", 20, 12],
      ["Always Glad You Came", 50, 12],
      ["Witty Comebacks", 90, 12],
      ["Happy Hour", 180, 22],
      ["Shiny Club Shine", 360, 333],
      ["Charge By The Breath", 720, 4444],
      ["Free Nitrogen", 1440, 55555],
      ["The Bubbly", 2880, 666666],
      ["No Smoking Please", 5720, 7777777],
    ],
    [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 1000, 1200, 1400, 1600, 1800, 2000, 2200, 2400, 2600, 2800, 3000].map(
      (goal, index) => [`Helium Tier ${index + 1}`, goal, index < 16 ? 7 : 777] as [string, number, number],
    ),
    [8, 16, 32, 64, 128, 256, 512, 1024, 2048, 4096].map((goal, index) => [
      `Cheese Tier ${index + 1}`,
      goal,
      index < 8 ? 5 : 88_888_888,
    ]),
    [80, 160, 240, 320, 480, 640, 800, 960, 1200, 1440, 1680, 1920, 2160, 2300, 2540, 2780, 3000].map(
      (goal, index) => [`Park Tier ${index + 1}`, goal, index < 9 ? 8 : 888] as [string, number, number],
    ),
    [25, 50, 75, 100, 150, 200, 250, 300, 350, 400, 450, 500, 600, 700, 800, 900, 1000, 1200, 1400, 1600, 1800, 2000, 2300, 2600, 2900, 3200, 3500, 3800, 4100].map(
      (goal, index) => [`Colony Tier ${index + 1}`, goal, index === 26 ? 9_876_543_210 : index >= 24 ? 33 : 3] as [string, number, number],
    ),
    [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 1000, 1111].map((goal, index) => [
      `Laser Tier ${index + 1}`,
      goal,
      75,
    ]),
  ];

  return businesses.flatMap((business, index) =>
    byIndex[index].map(([name, goal, multiplier]) => ({
      id: `${business.id}-${goal}`,
      name: `${business.shortName}: ${name}`,
      goal,
      target: business.id,
      kind: "profit",
      multiplier,
    })),
  );
};

const europeStyleAllBusinessUnlocks: UnlockDefinition[] = [
  { id: "all-1", name: "Finally", goal: 1, target: "all", kind: "speed", multiplier: 2 },
  { id: "all-5", name: "Now You're Cooking With N204", goal: 5, target: "all", kind: "speed", multiplier: 2 },
  { id: "all-25", name: "Special Relativity", goal: 25, target: "all", kind: "speed", multiplier: 2 },
  { id: "all-50", name: "Just A Phase", goal: 50, target: "all", kind: "speed", multiplier: 2 },
  { id: "all-75", name: "Dark Side Of The Market", goal: 75, target: "all", kind: "speed", multiplier: 2 },
  { id: "all-100", name: "Miami Over Market", goal: 100, target: "all", kind: "speed", multiplier: 2 },
  { id: "all-150", name: "Luny Luna", goal: 150, target: "all", kind: "speed", multiplier: 2 },
  { id: "all-200", name: "Apollo-getic", goal: 200, target: "all", kind: "speed", multiplier: 2 },
  { id: "all-250", name: "Case Of The Mondays", goal: 250, target: "all", kind: "speed", multiplier: 2 },
  { id: "all-300", name: "The Euro-arch", goal: 300, target: "all", kind: "speed", multiplier: 2 },
  { id: "all-350", name: "Shiny Monocle", goal: 350, target: "all", kind: "speed", multiplier: 2 },
  { id: "all-400", name: "Monotheism", goal: 400, target: "all", kind: "speed", multiplier: 2 },
  { id: "all-450", name: "Gany-mead", goal: 450, target: "all", kind: "speed", multiplier: 2 },
  { id: "all-500", name: "Titan-ic Achievement", goal: 500, target: "all", kind: "speed", multiplier: 2 },
  { id: "all-600", name: "Callisto-riffic", goal: 600, target: "all", kind: "speed", multiplier: 2 },
  { id: "all-700", name: "I/O", goal: 700, target: "all", kind: "speed", multiplier: 2 },
  { id: "all-800", name: "Europa Opa", goal: 800, target: "all", kind: "speed", multiplier: 2 },
  { id: "all-900", name: "Tri-tons Of Fun", goal: 900, target: "all", kind: "speed", multiplier: 2 },
  { id: "all-1000", name: "Charon Is Caring", goal: 1_000, target: "all", kind: "speed", multiplier: 2 },
  { id: "all-1111", name: "Continental Achievement", goal: 1_111, target: "all", kind: "speed", multiplier: 2 },
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

const buildWorld = ({
  id,
  name,
  shortName,
  description,
  currencyName,
  currencySymbol,
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
  shortName: string;
  description: string;
  currencyName: string;
  currencySymbol: string;
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
  shortName,
  description,
  currencyName,
  currencySymbol,
  unlockCost,
  startingCash,
  businesses,
  cashUpgrades: createUpgrades(cashUpgradeRows, "cash", businesses),
  angelUpgrades: createUpgrades(angelUpgradeRows, "angels", businesses),
  businessUnlocks: businessUnlocks ?? createBusinessUnlocks(businesses),
  allBusinessUnlocks: allBusinessUnlocks ?? baseAllBusinessUnlocks,
  achievements,
});

export const siliconValleyWorld = buildWorld({
  id: "silicon-valley",
  name: "Silicon Valley",
  shortName: "GPU",
  description: "The original San Francisco compute market.",
  currencyName: "Dollars",
  currencySymbol: "$",
  unlockCost: { currency: "free", amount: 0 },
  startingCash: 4,
  businesses: siliconValleyBusinesses,
  cashUpgradeRows: siliconValleyCashUpgradeRows,
  angelUpgradeRows: siliconValleyAngelUpgradeRows,
});

export const chinaWorld = buildWorld({
  id: "china",
  name: "China",
  shortName: "China",
  description: "A yuan-denominated market with China-style pacing.",
  currencyName: "Yuan",
  currencySymbol: "¥",
  unlockCost: { currency: "megaBucks", amount: 100 },
  startingCash: 0.05,
  businesses: chinaBusinesses,
  cashUpgradeRows: chinaCashUpgradeRows,
  angelUpgradeRows: chinaAngelUpgradeRows,
});

export const europeWorld = buildWorld({
  id: "europe",
  name: "Europe",
  shortName: "Europe",
  description: "A euro-denominated market with Europe-style pacing.",
  currencyName: "Euros",
  currencySymbol: "€",
  unlockCost: { currency: "siliconValleyCash", amount: 10 }, // MATHEUS
  // unlockCost: { currency: "siliconValleyCash", amount: 100_000_000_000_000 },
  startingCash: 5,
  businesses: europeBusinesses,
  cashUpgradeRows: europeCashUpgradeRows,
  angelUpgradeRows: europeAngelUpgradeRows,
  businessUnlocks: createEuropeStyleBusinessUnlocks(europeBusinesses),
  allBusinessUnlocks: europeStyleAllBusinessUnlocks,
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
