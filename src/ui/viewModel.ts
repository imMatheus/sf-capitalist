import {
  BadgeDollarSign,
  Gauge,
  Globe2,
  Sparkles,
  Trophy,
  Users,
} from 'lucide-react'
import { getBusinessCashPerSecond } from '../game/engine'
import { formatCompact, formatMultiplier } from '../game/format'
import type {
  BusinessId,
  BuyMode,
  UnlockDefinition,
  UpgradeDefinition,
  WorldDefinition,
  WorldState,
} from '../game/types'
import { getBusinessImage, getUpgradeImage, getUnlockImage } from './assets'
import type { LevelToast, Panel, PanelTab, QuickBuyOption } from './types'

export const panelTabs: PanelTab[] = [
  { id: 'stats', label: 'Swag & Stats', icon: Gauge },
  { id: 'unlocks', label: 'Unlocks', icon: Trophy },
  { id: 'travel', label: 'Travel', icon: Globe2 },
  { id: 'upgrades', label: 'Upgrades', icon: BadgeDollarSign },
  { id: 'managers', label: 'Managers', icon: Users },
  { id: 'angels', label: 'Investors', icon: Sparkles },
]

export const panelMeta: Record<
  Panel,
  { title: string; tone: string; kicker: string; help: string }
> = {
  stats: {
    title: 'Swag & Stats',
    tone: 'gold',
    kicker: 'The numbers behind your compute empire.',
    help: 'Stats track your current run, lifetime earnings, automation rate, prestige count, achievements, and save controls.',
  },
  unlocks: {
    title: 'Unlocks',
    tone: 'yellow',
    kicker: 'Hit ownership quotas to unlock sweet profit bonuses.',
    help: 'Buy more of each business to reach quotas. Completed quotas boost profit or speed for this run.',
  },
  travel: {
    title: 'Adventures',
    tone: 'travel',
    kicker: 'Choose which market you want to run.',
    help: 'Each destination keeps separate money, investors, managers, upgrades, unlocks, and business progress.',
  },
  upgrades: {
    title: 'Upgrades',
    tone: 'orange',
    kicker: 'Spend money to make money.',
    help: 'Cash upgrades spend current money. Investor upgrades spend your prestige investors. Both multiply profits or speed.',
  },
  managers: {
    title: 'Managers',
    tone: 'blue',
    kicker: 'Hire one to run your businesses for you.',
    help: 'Managers automate a business so it restarts as soon as its timer completes.',
  },
  angels: {
    title: 'Investors',
    tone: 'purple',
    kicker: 'Reset for prestige investors and bigger profit bonuses.',
    help: 'Prestige investors increase profits. Claiming them restarts your businesses, cash, managers, and cash upgrades.',
  },
}

export const fastProgressThresholdSeconds = 0.1

export const getAngelSingularLabel = (world: WorldDefinition) =>
  world.angelInvestorLabels.singular

export const getAngelPluralLabel = (world: WorldDefinition) =>
  world.angelInvestorLabels.plural

export const getAngelShortSingularLabel = (world: WorldDefinition) =>
  world.angelInvestorLabels.shortSingular

export const getAngelShortPluralLabel = (world: WorldDefinition) =>
  world.angelInvestorLabels.shortPlural

export const getAngelShortAmountLabel = (
  value: number,
  world: WorldDefinition,
  precision: number,
) =>
  `${formatCompact(value, precision)} ${
    value === 1
      ? getAngelShortSingularLabel(world)
      : getAngelShortPluralLabel(world)
  }`

export const getPanelKicker = (panel: Panel, world: WorldDefinition) => {
  if (panel === 'angels') {
    return `Reset for ${getAngelPluralLabel(world)} and bigger profit bonuses.`
  }

  return panelMeta[panel].kicker
}

export const getPanelHelp = (panel: Panel, world: WorldDefinition) => {
  if (panel === 'upgrades') {
    return `Cash upgrades spend current money. ${getAngelShortSingularLabel(
      world,
    )} upgrades spend ${getAngelShortPluralLabel(
      world,
    )}. Both multiply profits or speed.`
  }

  if (panel === 'angels') {
    return `${getAngelPluralLabel(
      world,
    )} increase profits. Claiming them restarts your businesses, cash, managers, and cash upgrades.`
  }

  return panelMeta[panel].help
}

export const getNextBuyMode = (current: BuyMode): BuyMode => {
  switch (current) {
    case 1:
      return 10
    case 10:
      return 100
    case 100:
      return 'next'
    case 'next':
      return 'max'
    case 'max':
      return 1
  }
}

export const getTotalCashPerSecond = (state: WorldState, world: WorldDefinition) =>
  world.businesses.reduce((total, business) => {
    if (!state.managers[business.id]) {
      return total
    }

    return total + getBusinessCashPerSecond(state, world, business)
  }, 0)

export const getSidebarAvailability = (
  state: WorldState,
  world: WorldDefinition,
  claimableAngels: number,
): Partial<Record<Panel, boolean>> => ({
  upgrades:
    world.cashUpgrades.some(
      (upgrade) =>
        !state.cashUpgrades.includes(upgrade.id) && state.cash >= upgrade.cost,
    ) ||
    world.angelUpgrades.some(
      (upgrade) =>
        !state.angelUpgrades.includes(upgrade.id) &&
        state.angels >= upgrade.cost,
    ),
  managers: world.businesses.some(
    (business) =>
      !state.managers[business.id] && state.cash >= business.managerCost,
  ),
  angels: state.angels === 0 && claimableAngels > 0,
})

export const getUnlockTargetName = (
  unlock: UnlockDefinition,
  world: WorldDefinition,
) => {
  if (unlock.target === 'all') {
    return 'Everything'
  }

  return (
    world.businesses.find((business) => business.id === unlock.target)?.name ??
    unlock.name
  )
}

export const getUnlockCurrent = (
  state: WorldState,
  world: WorldDefinition,
  unlock: UnlockDefinition,
) => {
  const triggerTarget = unlock.triggerTarget ?? unlock.target

  return triggerTarget === 'all'
    ? Math.min(
        ...world.businesses.map(
          (business) => state.businesses[business.id].owned,
        ),
      )
    : state.businesses[triggerTarget].owned
}

export const isUnlockComplete = (
  state: WorldState,
  world: WorldDefinition,
  unlock: UnlockDefinition,
) => getUnlockCurrent(state, world, unlock) >= unlock.goal

export const getUnlockDetailTitle = (unlock: UnlockDefinition) => {
  const [, label] = unlock.name.split(': ')

  return label ?? unlock.name
}

export const getUnlockEffectLabel = (unlock: UnlockDefinition) =>
  unlock.kind === 'reward'
    ? (unlock.reward ?? 'Reward')
    : `${unlock.kind} ${formatMultiplier(unlock.multiplier)}`

export const getUnlockDetailText = (
  unlock: UnlockDefinition,
  world: WorldDefinition,
) => {
  const targetName = getUnlockTargetName(unlock, world)
  const triggerTarget = unlock.triggerTarget ?? unlock.target
  const triggerName =
    triggerTarget === unlock.target || triggerTarget === 'all'
      ? targetName
      : (world.businesses.find((business) => business.id === triggerTarget)
          ?.name ?? targetName)

  if (unlock.kind === 'reward') {
    return `${unlock.goal} ${triggerName} - ${unlock.reward ?? 'Reward'}!`
  }

  const targetLabel = unlock.target === 'all' ? 'Every Business' : targetName
  const effectLabel =
    unlock.kind === 'speed'
      ? `Speed of ${targetLabel}`
      : `Profit of ${targetLabel}`

  return `${unlock.goal} ${triggerName} - ${effectLabel} ${formatMultiplier(unlock.multiplier)}!`
}

export const createOwnedStatePreview = (
  state: WorldState,
  businessId: BusinessId,
  owned: number,
): WorldState => ({
  ...state,
  businesses: {
    ...state.businesses,
    [businessId]: {
      ...state.businesses[businessId],
      owned,
    },
  },
})

export const getNewUnlockToast = (
  beforeState: WorldState,
  afterState: WorldState,
  world: WorldDefinition,
): Omit<LevelToast, 'key'> | null => {
  const newlyCompleted = [
    ...world.businessUnlocks,
    ...world.allBusinessUnlocks,
  ].filter(
    (unlock) =>
      !isUnlockComplete(beforeState, world, unlock) &&
      isUnlockComplete(afterState, world, unlock),
  )

  const unlock = newlyCompleted.sort((a, b) => a.goal - b.goal).at(-1)

  if (!unlock) {
    return null
  }

  return {
    title: getUnlockEffectLabel(unlock),
    detail: getUnlockTargetName(unlock, world),
    image: getUnlockImage(unlock, world),
  }
}

export const formatUpgradeBadge = (upgrade: UpgradeDefinition) => {
  if (upgrade.kind === 'angelEffectiveness') {
    return `+${upgrade.multiplier}%`
  }

  if (upgrade.kind === 'owned') {
    return `+${upgrade.multiplier}`
  }

  return formatMultiplier(upgrade.multiplier)
}

export const getQuickBuyOption = (
  state: WorldState,
  world: WorldDefinition,
): QuickBuyOption | null => {
  const managerOptions: QuickBuyOption[] = world.businesses
    .filter(
      (business) =>
        !state.managers[business.id] && state.cash >= business.managerCost,
    )
    .map((business) => ({
      kind: 'manager',
      id: business.id,
      name: business.managerName,
      description: `Automates ${business.name}`,
      cost: business.managerCost,
      image: getBusinessImage(world, business),
      badge: 'Mgr',
    }))
  const upgradeOptions: QuickBuyOption[] = world.cashUpgrades
    .filter(
      (upgrade) =>
        !state.cashUpgrades.includes(upgrade.id) && state.cash >= upgrade.cost,
    )
    .map((upgrade) => ({
      kind: 'upgrade',
      id: upgrade.id,
      name: upgrade.name,
      description: upgrade.description,
      cost: upgrade.cost,
      image: getUpgradeImage(upgrade, world),
      badge: formatUpgradeBadge(upgrade),
    }))

  return (
    [...managerOptions, ...upgradeOptions].sort((a, b) => a.cost - b.cost)[0] ??
    null
  )
}
