import {
  BadgeDollarSign,
  CheckCircle2,
  Cpu,
  Gauge,
  LayoutGrid,
  Lock,
  Play,
  Save,
  Sparkles,
  Trash2,
  Trophy,
  Users,
  type LucideIcon,
} from 'lucide-react'
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react'
import aiSupercomputerImage from './assets/businesses/ai-supercomputer.svg'
import asicFarmImage from './assets/businesses/asic-farm.svg'
import cloudRegionImage from './assets/businesses/cloud-region.svg'
import colocationHallImage from './assets/businesses/colocation-hall.svg'
import hyperscaleCampusImage from './assets/businesses/hyperscale-campus.svg'
import inferenceClusterImage from './assets/businesses/inference-cluster.svg'
import orbitalDataCenterImage from './assets/businesses/orbital-data-center.svg'
import quickUpgradeImage from './assets/businesses/quick-upgrade.png'
import renderRackImage from './assets/businesses/render-rack.svg'
import singleGpuRigImage from './assets/businesses/single-gpu-rig.svg'
import trainingPodImage from './assets/businesses/training-pod.svg'
import {
  achievements,
  allBusinessUnlocks,
  angelUpgrades,
  businesses,
  businessUnlocks,
  cashUpgrades,
} from './game/economy'
import {
  getAngelEffectiveness,
  getBusinessCashPerSecond,
  getBusinessDuration,
  getBusinessRevenue,
  getBuyQuantity,
  getClaimableAngels,
  getNextAllUnlock,
  getNextUnlock,
  getPurchaseCost,
} from './game/engine'
import {
  formatCompact,
  formatDuration,
  formatLevel,
  formatMoney,
  formatMultiplier,
} from './game/format'
import type {
  BusinessDefinition,
  BusinessId,
  BuyMode,
  GameState,
  UnlockDefinition,
  UpgradeDefinition,
} from './game/types'
import { useGame } from './game/useGame'

type Panel = 'managers' | 'upgrades' | 'angels' | 'unlocks' | 'stats'

const businessImages: Record<BusinessId, string> = {
  'single-gpu-rig': singleGpuRigImage,
  'render-rack': renderRackImage,
  'inference-cluster': inferenceClusterImage,
  'training-pod': trainingPodImage,
  'colocation-hall': colocationHallImage,
  'asic-farm': asicFarmImage,
  'cloud-region': cloudRegionImage,
  'hyperscale-campus': hyperscaleCampusImage,
  'ai-supercomputer': aiSupercomputerImage,
  'orbital-data-center': orbitalDataCenterImage,
}

const panelTabs: Array<{ id: Panel; label: string; icon: LucideIcon }> = [
  { id: 'stats', label: 'Swag & Stats', icon: Gauge },
  { id: 'unlocks', label: 'Unlocks', icon: Trophy },
  { id: 'upgrades', label: 'Upgrades', icon: BadgeDollarSign },
  { id: 'managers', label: 'Managers', icon: Users },
  { id: 'angels', label: 'Investors', icon: Sparkles },
]

const panelMeta: Record<
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
  upgrades: {
    title: 'Upgrades',
    tone: 'orange',
    kicker: 'Spend money to make money.',
    help: 'Cash upgrades spend current money. Angel upgrades spend angel investors. Both multiply profits or speed.',
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
    kicker: 'Reset for angel investors and bigger profit bonuses.',
    help: 'Angel investors increase profits. Claiming them restarts your businesses, cash, managers, and cash upgrades.',
  },
}

const buyModes: BuyMode[] = [1, 10, 100, 'next', 'max']

const getNextBuyMode = (current: BuyMode): BuyMode => {
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

const getTotalCashPerSecond = (state: GameState) =>
  businesses.reduce((total, business) => {
    if (!state.managers[business.id]) {
      return total
    }

    return total + getBusinessCashPerSecond(state, business)
  }, 0)

const getSidebarAvailability = (
  state: GameState,
  claimableAngels: number,
): Partial<Record<Panel, boolean>> => ({
  upgrades:
    cashUpgrades.some(
      (upgrade) => !state.cashUpgrades.includes(upgrade.id) && state.cash >= upgrade.cost,
    ) ||
    angelUpgrades.some(
      (upgrade) =>
        !state.angelUpgrades.includes(upgrade.id) && state.angels >= upgrade.cost,
    ),
  managers: businesses.some(
    (business) => !state.managers[business.id] && state.cash >= business.managerCost,
  ),
  angels: state.angels === 0 && claimableAngels > 0,
})

type QuickBuyOption =
  | {
      kind: 'manager'
      id: BusinessId
      name: string
      description: string
      cost: number
      image: string
      badge: string
    }
  | {
      kind: 'upgrade'
      id: string
      name: string
      description: string
      cost: number
      image: string
      badge: string
    }

const getUpgradeImage = (upgrade: UpgradeDefinition) => {
  if (upgrade.target === 'all') {
    return quickUpgradeImage
  }

  return businessImages[upgrade.target]
}

const getUnlockImage = (unlock: UnlockDefinition) =>
  unlock.target === 'all' ? quickUpgradeImage : businessImages[unlock.target]

const getUnlockTargetName = (unlock: UnlockDefinition) => {
  if (unlock.target === 'all') {
    return 'Everything'
  }

  return (
    businesses.find((business) => business.id === unlock.target)?.shortName ??
    unlock.name
  )
}

const getUnlockCurrent = (state: GameState, unlock: UnlockDefinition) =>
  unlock.target === 'all'
    ? Math.min(
        ...businesses.map((business) => state.businesses[business.id].owned),
      )
    : state.businesses[unlock.target].owned

const isUnlockComplete = (state: GameState, unlock: UnlockDefinition) =>
  getUnlockCurrent(state, unlock) >= unlock.goal

const getUnlockDetailTitle = (unlock: UnlockDefinition) => {
  const [, label] = unlock.name.split(': ')

  return label ?? unlock.name
}

const getUnlockDetailText = (unlock: UnlockDefinition) => {
  const targetName = getUnlockTargetName(unlock)
  const targetLabel = unlock.target === 'all' ? 'Every Business' : targetName
  const effectLabel =
    unlock.kind === 'speed'
      ? `Speed of ${targetLabel}`
      : `Profit of ${targetLabel}`

  return `${unlock.goal} ${targetName} - ${effectLabel} ${formatMultiplier(unlock.multiplier)}!`
}

const formatUpgradeBadge = (upgrade: UpgradeDefinition) => {
  if (upgrade.kind === 'angelEffectiveness') {
    return `+${upgrade.multiplier}%`
  }

  if (upgrade.kind === 'owned') {
    return `+${upgrade.multiplier}`
  }

  return formatMultiplier(upgrade.multiplier)
}

const getQuickBuyOption = (state: GameState): QuickBuyOption | null => {
  const managerOptions: QuickBuyOption[] = businesses
    .filter(
      (business) =>
        !state.managers[business.id] && state.cash >= business.managerCost,
    )
    .map((business) => ({
      kind: 'manager',
      id: business.id,
      name: business.managerName,
      description: `Automates ${business.shortName}`,
      cost: business.managerCost,
      image: businessImages[business.id],
      badge: 'Mgr',
    }))
  const upgradeOptions: QuickBuyOption[] = cashUpgrades
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
      image: getUpgradeImage(upgrade),
      badge: formatUpgradeBadge(upgrade),
    }))

  return (
    [...managerOptions, ...upgradeOptions].sort((a, b) => b.cost - a.cost)[0] ??
    null
  )
}

const App = () => {
  const { state, actions, offlineReport, saveNow } = useGame()
  const [buyMode, setBuyMode] = useState<BuyMode>(1)
  const [panel, setPanel] = useState<Panel | null>(null)
  const claimableAngels = getClaimableAngels(state)
  const angelBonusPercent = state.angels * getAngelEffectiveness(state) * 100
  const totalCashPerSecond = useMemo(
    () => getTotalCashPerSecond(state),
    [state],
  )
  const nextAllUnlock = getNextAllUnlock(state)
  const quickBuyOption = useMemo(() => getQuickBuyOption(state), [state])
  const sidebarAvailability = useMemo(
    () => getSidebarAvailability(state, claimableAngels),
    [state, claimableAngels],
  )
  const cycleBuyMode = () => setBuyMode((current) => getNextBuyMode(current))
  const closePanel = () => setPanel(null)

  useEffect(() => {
    if (!panel) {
      return
    }

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closePanel()
      }
    }

    window.addEventListener('keydown', closeOnEscape)

    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [panel])

  return (
    <div className="adcap-screen min-h-screen overflow-x-hidden text-[#241d17]">
      <div className="adcap-stage">
        <Sidebar
          availability={sidebarAvailability}
          panel={panel}
          setPanel={setPanel}
        />

        <main className="capital-floor">
          <header className="cash-ribbon">
            <div className="brand-chip">
              <Cpu className="h-7 w-7" strokeWidth={3} />
              <span>GPU Capitalist</span>
            </div>
            <CashHeadline value={state.cash} />
            <div className="cash-subline">
              <span>{formatMoney(totalCashPerSecond)} /sec</span>
              <span>{formatCompact(state.angels, 1)} angels</span>
            </div>
            <div className="top-controls">
              <QuickBuyAction
                onBuyManager={actions.buyManager}
                onBuyUpgrade={actions.buyUpgrade}
                option={quickBuyOption}
              />
              <BuyModeTag buyMode={buyMode} onCycle={cycleBuyMode} />
            </div>
          </header>

          {offlineReport ? (
            <div className="offline-note">
              <div>
                <div className="text-lg font-black">Welcome back, boss.</div>
                <div className="text-sm font-bold">
                  {formatDuration(offlineReport.elapsedSeconds)} away earned{' '}
                  {formatMoney(offlineReport.earnings)}.
                </div>
              </div>
              <button
                className="paper-button orange px-5 py-3"
                onClick={actions.dismissOfflineReport}
              >
                Collect
              </button>
            </div>
          ) : null}

          <div className="empire-note">
            <span>Next empire unlock</span>
            <strong>
              {nextAllUnlock
                ? `${nextAllUnlock.goal} of everything: ${nextAllUnlock.name}`
                : 'All empire unlocks cleared'}
            </strong>
          </div>

          <section className="investment-grid">
            {businesses.map((business) => (
              <BusinessRow
                business={business}
                buyMode={buyMode}
                key={business.id}
                onBuy={actions.buyBusiness}
                onStart={actions.startBusiness}
                state={state}
              />
            ))}
          </section>
        </main>
      </div>

      {panel ? (
        <PanelModal onClose={closePanel} panel={panel}>
          {panel === 'managers' ? (
            <ManagersPanel onBuy={actions.buyManager} state={state} />
          ) : null}
          {panel === 'upgrades' ? (
            <UpgradesPanel onBuy={actions.buyUpgrade} state={state} />
          ) : null}
          {panel === 'angels' ? (
            <AngelsPanel
              angelBonusPercent={angelBonusPercent}
              claimableAngels={claimableAngels}
              onReset={actions.resetForAngels}
              state={state}
            />
          ) : null}
          {panel === 'unlocks' ? <UnlocksPanel state={state} /> : null}
          {panel === 'stats' ? (
            <StatsPanel
              angelBonusPercent={angelBonusPercent}
              claimableAngels={claimableAngels}
              onHardReset={actions.hardReset}
              onSave={saveNow}
              state={state}
              totalCashPerSecond={totalCashPerSecond}
            />
          ) : null}
        </PanelModal>
      ) : null}
    </div>
  )
}

interface SidebarProps {
  availability: Partial<Record<Panel, boolean>>
  panel: Panel | null
  setPanel: (panel: Panel) => void
}

const Sidebar = ({ availability, panel, setPanel }: SidebarProps) => (
  <aside className="left-menu">
    <div className="mascot-card" aria-label="GPU Capitalist mascot">
      <div className="top-hat" />
      <div className="mascot-face">
        <Cpu className="h-12 w-12" strokeWidth={2.6} />
      </div>
      <div className="ribbon">GPU & Stats</div>
    </div>

    <nav className="nav-rail" aria-label="Game menu">
      {panelTabs.slice(1).map((tab) => {
        const Icon = tab.icon

        return (
          <button
            className={`paper-tab ${panel === tab.id ? 'active' : ''} ${
              availability[tab.id] ? 'available' : ''
            }`}
            key={tab.id}
            onClick={() => setPanel(tab.id)}
            type="button"
          >
            {availability[tab.id] ? (
              <span className="paper-tab-notification" aria-hidden="true" />
            ) : null}
            <Icon className="h-5 w-5" />
            <span>{tab.label}</span>
          </button>
        )
      })}
    </nav>

    <button
      className={`shop-card ${panel === 'stats' ? 'active' : ''}`}
      onClick={() => setPanel('stats')}
      type="button"
    >
      <span>Shop</span>
      <BadgeDollarSign className="h-11 w-11" />
    </button>
  </aside>
)

interface PanelModalProps {
  panel: Panel
  children: ReactNode
  onClose: () => void
}

const PanelModal = ({ panel, children, onClose }: PanelModalProps) => {
  const meta = panelMeta[panel]
  const [showHelp, setShowHelp] = useState(false)

  return (
    <div className="modal-backdrop" role="presentation">
      <button
        aria-label="Close modal"
        className="modal-dismiss-layer"
        onClick={onClose}
        type="button"
      />
      <section
        aria-labelledby="modal-title"
        aria-modal="true"
        className={`adcap-modal ${meta.tone}`}
        role="dialog"
      >
        <div className="modal-side-tab left" />
        <div className="modal-side-tab right" />
        <div className="modal-title-card">
          <span className="node-burst" aria-hidden="true" />
          <h2 id="modal-title">{meta.title}</h2>
        </div>
        <button
          aria-label="Close modal"
          className="modal-close"
          onClick={onClose}
          type="button"
        >
          X
        </button>
        <button
          aria-expanded={showHelp}
          aria-label="Help"
          className="modal-help"
          onClick={() => setShowHelp((current) => !current)}
          type="button"
        >
          ?
        </button>
        {showHelp ? (
          <div className="modal-help-popover" role="status">
            {meta.help}
          </div>
        ) : null}

        <div className="modal-content">
          <p className="modal-kicker">{meta.kicker}</p>
          <div className="modal-divider" />
          <div className="modal-scroll">{children}</div>
        </div>
      </section>
    </div>
  )
}

const splitMoney = (value: number) => {
  const formatted = formatMoney(value)
  const [amount, ...scale] = formatted.split(' ')

  return {
    amount,
    scale: scale.join(' ').toUpperCase() || 'CASH',
  }
}

const CashHeadline = ({ value }: { value: number }) => {
  const money = splitMoney(value)

  return (
    <div className="cash-headline">
      <strong>{money.amount}</strong>
      <span>{money.scale}</span>
    </div>
  )
}

interface QuickBuyActionProps {
  option: QuickBuyOption | null
  onBuyManager: (businessId: BusinessId) => void
  onBuyUpgrade: (upgradeId: string) => void
}

const QuickBuyAction = ({
  option,
  onBuyManager,
  onBuyUpgrade,
}: QuickBuyActionProps) => {
  if (!option) {
    return null
  }

  const buy = () => {
    if (option.kind === 'manager') {
      onBuyManager(option.id)
      return
    }

    onBuyUpgrade(option.id)
  }
  const title = `Buy ${option.name}: ${option.description} (${formatMoney(option.cost)})`

  return (
    <div className={`quick-buy-action ${option.kind}`} title={title}>
      <button className="quick-buy-button" onClick={buy} type="button">
        Buy
      </button>
      <button
        className="quick-buy-card"
        onClick={buy}
        type="button"
        aria-label={title}
      >
        <img
          alt=""
          className="quick-buy-image"
          draggable={false}
          src={option.image}
        />
        <strong>{option.badge}</strong>
      </button>
    </div>
  )
}

interface BuyModeTagProps {
  buyMode: BuyMode
  onCycle: () => void
}

const BuyModeTag = ({ buyMode, onCycle }: BuyModeTagProps) => {
  const label =
    buyMode === 'max' ? 'Max' : buyMode === 'next' ? 'Next' : `x${buyMode}`

  return (
    <button
      aria-label={`Cycle buy multiplier, currently ${label}`}
      className="buy-tag"
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          onCycle()
        }
      }}
      onPointerDown={(event) => {
        event.preventDefault()
        onCycle()
      }}
      type="button"
    >
      <span>Buy</span>
      <strong>{label}</strong>
    </button>
  )
}

const formatCountdown = (seconds: number): string => {
  const safeSeconds = Math.max(0, seconds)

  if (safeSeconds < 0.1) {
    return '0.0s'
  }

  if (safeSeconds < 10) {
    return `${Math.min(9.9, safeSeconds).toFixed(1)}s`
  }

  const totalSeconds = Math.ceil(safeSeconds)
  const secs = totalSeconds % 60
  const minutes = Math.floor(totalSeconds / 60) % 60
  const hours = Math.floor(totalSeconds / 3_600) % 24
  const days = Math.floor(totalSeconds / 86_400)

  if (days > 0) {
    return `${days}d ${String(hours).padStart(2, '0')}h`
  }

  if (hours > 0) {
    return `${hours}h ${String(minutes).padStart(2, '0')}m`
  }

  if (minutes > 0) {
    return `${minutes}m ${String(secs).padStart(2, '0')}s`
  }

  return `${totalSeconds}s`
}

const getScaleLabel = (value: number) => {
  const [, ...scale] = formatCompact(value, 3).split(' ')

  return scale.join(' ').toUpperCase() || 'CASH'
}

const getAmountLabel = (value: number) => formatCompact(value, 3).split(' ')[0]

interface BusinessRowProps {
  business: BusinessDefinition
  buyMode: BuyMode
  state: GameState
  onBuy: (businessId: BusinessId, mode: BuyMode) => void
  onStart: (businessId: BusinessId) => void
}

const BusinessRow = ({
  business,
  buyMode,
  state,
  onBuy,
  onStart,
}: BusinessRowProps) => {
  const businessState = state.businesses[business.id]
  const quantity = getBuyQuantity(state, business, buyMode)
  const purchaseCost = getPurchaseCost(business, businessState.owned, quantity)
  const canBuy = quantity > 0 && state.cash >= purchaseCost
  const buyLabel = `Buy ${quantity}`
  const displayCost =
    quantity > 0
      ? purchaseCost
      : getPurchaseCost(business, businessState.owned, 1)
  const duration = getBusinessDuration(state, business)
  const revenue = getBusinessRevenue(state, business)
  const progressPercent = Math.min(
    100,
    (businessState.progress / duration) * 100,
  )
  const automated = state.managers[business.id]
  const showProgress = businessState.running || automated
  const fastCycle = duration < 0.5 && showProgress
  const barPercent = fastCycle
    ? 100
    : showProgress
      ? progressPercent
      : 0
  const canStart =
    businessState.owned > 0 && !businessState.running && !automated
  const timeRemaining =
    businessState.running || automated
      ? duration - businessState.progress
      : duration
  const nextUnlock = getNextUnlock(state, business.id)
  const unlockGoals = businessUnlocks
    .filter((unlock) => unlock.target === business.id)
    .map((unlock) => unlock.goal)
  const previousUnlockGoal = nextUnlock
    ? Math.max(0, ...unlockGoals.filter((goal) => goal < nextUnlock.goal))
    : Math.max(0, ...unlockGoals)
  const ownedProgressPercent = nextUnlock
    ? Math.min(
        100,
        Math.max(
          0,
          ((businessState.owned - previousUnlockGoal) /
            (nextUnlock.goal - previousUnlockGoal)) *
            100,
        ),
      )
    : 100
  const revenueLabel = automated
    ? `${formatMoney(getBusinessCashPerSecond(state, business))} /sec`
    : `${formatMoney(revenue)} /run`

  if (businessState.owned === 0) {
    const firstPurchaseCost = getPurchaseCost(business, 0, 1)
    const canUnlock = state.cash >= firstPurchaseCost

    return (
      <article
        className={`business-unlock-card ${canUnlock ? 'affordable' : 'locked'}`}
        style={{ '--business-accent': business.accent } as CSSProperties}
      >
        <button
          aria-label={`Buy ${business.name} for ${formatMoney(firstPurchaseCost)}`}
          className="business-unlock-button"
          disabled={!canUnlock}
          onClick={() => onBuy(business.id, 1)}
          title={business.caption}
          type="button"
        >
          <span className="business-unlock-icon">
            <img
              alt=""
              className="business-image"
              draggable={false}
              src={businessImages[business.id]}
            />
          </span>
          <span className="business-unlock-copy">
            <strong>{business.name}</strong>
            <span>{formatMoney(firstPurchaseCost)}</span>
          </span>
        </button>
      </article>
    )
  }

  return (
    <article
      className="investment-card"
      style={{ '--business-accent': business.accent } as CSSProperties}
    >
      <div className="investment-icon-wrap">
        <button
          aria-disabled={!canStart}
          aria-label={canStart ? `Start ${business.name}` : business.caption}
          className={`investment-icon ${canStart ? 'ready' : ''}`}
          onClick={() => {
            if (canStart) {
              onStart(business.id)
            }
          }}
          title={canStart ? `Start ${business.name}` : business.caption}
          type="button"
        >
          <img
            alt=""
            className="business-image"
            draggable={false}
            src={businessImages[business.id]}
          />
        </button>
        <div
          className="owned-count"
          style={
            { '--owned-progress': `${ownedProgressPercent}%` } as CSSProperties
          }
        >
          <span>{formatLevel(businessState.owned)}</span>
        </div>
      </div>

      <div className="investment-control">
        <div className="investment-name-row">
          <h2>{business.shortName}</h2>
        </div>
        <button
          className={`revenue-arrow ${canStart ? 'ready' : ''} ${fastCycle ? 'fast-cycle' : ''}`}
          onClick={() => {
            if (canStart) {
              onStart(business.id)
            }
          }}
          title={canStart ? 'Start production' : business.caption}
          type="button"
        >
          <span className="revenue-fill" style={{ width: `${barPercent}%` }} />
          <span className="revenue-text">{revenueLabel}</span>
          {canStart ? (
            <Play className="revenue-play h-4 w-4" fill="currentColor" />
          ) : null}
        </button>

        <div className="purchase-row">
          <button
            className="buy-block"
            disabled={!canBuy}
            onClick={() => onBuy(business.id, buyMode)}
            type="button"
          >
            <span>{buyLabel}</span>
            <strong>{getAmountLabel(displayCost)}</strong>
            <em>{getScaleLabel(displayCost)}</em>
          </button>
          <div className="time-block">{formatCountdown(timeRemaining)}</div>
        </div>
      </div>
    </article>
  )
}

interface ManagersPanelProps {
  state: GameState
  onBuy: (businessId: BusinessId) => void
}

const CurrencyPills = ({
  active,
  onSelect,
  state,
}: {
  active: 'cash' | 'angels'
  onSelect?: (currency: 'cash' | 'angels') => void
  state: GameState
}) => (
  <div className="modal-pills">
    <button
      className={active === 'cash' ? 'active' : ''}
      disabled={!onSelect}
      onClick={() => onSelect?.('cash')}
      type="button"
    >
      <BadgeDollarSign className="h-9 w-9" />
      <span>Cash</span>
    </button>
    <button
      className={active === 'angels' ? 'active' : ''}
      disabled={!onSelect}
      onClick={() => onSelect?.('angels')}
      type="button"
    >
      <Sparkles className="h-9 w-9" />
      <span>Angels</span>
    </button>
    <strong>
      {active === 'cash'
        ? formatMoney(state.cash)
        : `${formatCompact(state.angels, 1)} angels`}
    </strong>
  </div>
)

const ManagersPanel = ({ state, onBuy }: ManagersPanelProps) => (
  <div className="space-y-2">
    <CurrencyPills active="cash" state={state} />
    {[...businesses]
      .sort(
        (a, b) => Number(state.managers[a.id]) - Number(state.managers[b.id]),
      )
      .map((business) => {
        const hired = state.managers[business.id]
        const affordable = state.cash >= business.managerCost

        return (
          <div
            className={`shop-row ${hired ? 'complete' : ''}`}
            key={business.id}
          >
            <img
              alt=""
              className="modal-row-icon"
              draggable={false}
              src={businessImages[business.id]}
            />
            <div className="min-w-0">
              <div className="font-black uppercase text-[#3a2208]">
                {business.managerName}
              </div>
              <div className="text-sm font-bold text-[#684114]">
                Runs {business.name}
              </div>
            </div>
            <button
              className="adcap-button green shrink-0 px-3 py-2 text-sm"
              disabled={hired || !affordable}
              onClick={() => onBuy(business.id)}
              type="button"
            >
              {hired ? 'Hired' : formatMoney(business.managerCost)}
            </button>
          </div>
        )
      })}
  </div>
)

interface UpgradesPanelProps {
  state: GameState
  onBuy: (upgradeId: string) => void
}

const UpgradesPanel = ({ state, onBuy }: UpgradesPanelProps) => {
  const [currency, setCurrency] = useState<'cash' | 'angels'>('cash')
  const upgrades = currency === 'cash' ? cashUpgrades : angelUpgrades
  const sorted = [...upgrades].sort((a, b) => {
    const aOwned =
      a.currency === 'cash'
        ? state.cashUpgrades.includes(a.id)
        : state.angelUpgrades.includes(a.id)
    const bOwned =
      b.currency === 'cash'
        ? state.cashUpgrades.includes(b.id)
        : state.angelUpgrades.includes(b.id)

    if (aOwned !== bOwned) {
      return Number(aOwned) - Number(bOwned)
    }

    return a.cost - b.cost
  })

  return (
    <div className="space-y-2">
      <CurrencyPills active={currency} onSelect={setCurrency} state={state} />
      {sorted.map((upgrade) => {
        const owned =
          upgrade.currency === 'cash'
            ? state.cashUpgrades.includes(upgrade.id)
            : state.angelUpgrades.includes(upgrade.id)
        const balance = upgrade.currency === 'cash' ? state.cash : state.angels
        const affordable = balance >= upgrade.cost

        return (
          <div
            className={`shop-row ${owned ? 'complete' : ''}`}
            key={upgrade.id}
          >
            <img
              alt=""
              className="modal-row-icon"
              draggable={false}
              src={getUpgradeImage(upgrade)}
            />
            <div className="min-w-0">
              <div className="font-black uppercase text-[#3a2208]">
                {upgrade.name}
              </div>
              <div className="text-sm font-bold text-[#684114]">
                {upgrade.description}
              </div>
            </div>
            <button
              className="adcap-button gold shrink-0 px-3 py-2 text-sm"
              disabled={owned || !affordable}
              onClick={() => onBuy(upgrade.id)}
              type="button"
            >
              {owned
                ? 'Owned'
                : upgrade.currency === 'cash'
                  ? formatMoney(upgrade.cost)
                  : `${formatCompact(upgrade.cost, 0)} angels`}
            </button>
          </div>
        )
      })}
    </div>
  )
}

interface AngelsPanelProps {
  state: GameState
  claimableAngels: number
  angelBonusPercent: number
  onReset: () => void
}

const AngelsPanel = ({
  state,
  claimableAngels,
  angelBonusPercent,
  onReset,
}: AngelsPanelProps) => (
  <div className="investor-layout">
    <div className="angel-total-banner">
      <div>Your Total Angels</div>
      <strong>{formatCompact(state.angels, 2)}</strong>
    </div>

    <div className="investor-cards">
      <div className="investor-card">
        <strong>{formatCompact(getAngelEffectiveness(state) * 100, 2)}%</strong>
        <span>Profit Bonus Per Angel</span>
        <em>{formatCompact(angelBonusPercent, 2)}% total bonus</em>
      </div>
      <div className="investor-card claim">
        <strong>{formatCompact(claimableAngels, 2)}</strong>
        <span>Angels Claimed With Restart</span>
        <button
          className="adcap-button"
          disabled={claimableAngels <= 0}
          onClick={onReset}
          type="button"
        >
          Claim
        </button>
        <em>Restart your businesses</em>
      </div>
    </div>
  </div>
)

const UnlocksPanel = ({ state }: { state: GameState }) => {
  const [view, setView] = useState<'upcoming' | 'gallery'>('upcoming')
  const [activeGalleryUnlockId, setActiveGalleryUnlockId] = useState<
    string | null
  >(null)
  const galleryDetailTimerRef = useRef<number | null>(null)
  const nextBusinessUnlocks = businesses
    .map((business) => getNextUnlock(state, business.id))
    .filter((unlock): unlock is UnlockDefinition => Boolean(unlock))
  const nextAllUnlock = getNextAllUnlock(state)
  const upcomingUnlocks = nextAllUnlock
    ? [...nextBusinessUnlocks, nextAllUnlock]
    : nextBusinessUnlocks
  const galleryUnlocks = [...businessUnlocks, ...allBusinessUnlocks]
  const completedUnlocks = galleryUnlocks.filter((unlock) =>
    isUnlockComplete(state, unlock),
  ).length
  const visibleUnlocks = view === 'upcoming' ? upcomingUnlocks : galleryUnlocks
  const activeGalleryUnlock =
    view === 'gallery'
      ? (galleryUnlocks.find((unlock) => unlock.id === activeGalleryUnlockId) ??
        null)
      : null

  const clearGalleryDetailTimer = () => {
    if (galleryDetailTimerRef.current !== null) {
      window.clearTimeout(galleryDetailTimerRef.current)
      galleryDetailTimerRef.current = null
    }
  }

  const hideGalleryDetail = () => {
    clearGalleryDetailTimer()
    setActiveGalleryUnlockId(null)
  }

  const showGalleryDetail = (unlock: UnlockDefinition, timed = false) => {
    clearGalleryDetailTimer()
    setActiveGalleryUnlockId(unlock.id)

    if (timed) {
      galleryDetailTimerRef.current = window.setTimeout(() => {
        setActiveGalleryUnlockId((current) =>
          current === unlock.id ? null : current,
        )
        galleryDetailTimerRef.current = null
      }, 3_000)
    }
  }

  useEffect(
    () => () => {
      clearGalleryDetailTimer()
    },
    [],
  )

  useEffect(() => {
    if (view !== 'gallery') {
      hideGalleryDetail()
    }
  }, [view])

  return (
    <div className="unlock-panel">
      <div className="unlock-view-tabs" aria-label="Unlock views">
        <button
          className={`unlock-view-tab ${view === 'upcoming' ? 'active' : ''}`}
          onClick={() => setView('upcoming')}
          type="button"
        >
          <span className="unlock-view-icon">
            <CheckCircle2 className="h-12 w-12" />
          </span>
          <strong>Unlocks</strong>
        </button>
        <button
          className={`unlock-view-tab ${view === 'gallery' ? 'active' : ''}`}
          onClick={() => setView('gallery')}
          type="button"
        >
          <span className="unlock-view-icon">
            <LayoutGrid className="h-12 w-12" />
          </span>
          <strong>Gallery</strong>
        </button>
        <span className="unlock-completion-count">
          {completedUnlocks}/{galleryUnlocks.length}
        </span>
      </div>

      <p className="unlock-panel-copy">
        {view === 'upcoming'
          ? 'Get your investments to these quotas to unlock sweet profit bonuses.'
          : 'Every quota in your data center empire. Completed levels are checked off.'}
      </p>

      {view === 'gallery' ? (
        <div className="unlock-gallery-shell">
          <div className="unlock-card-grid gallery">
            {galleryUnlocks.map((unlock) => (
              <UnlockCard
                active={activeGalleryUnlockId === unlock.id}
                complete={isUnlockComplete(state, unlock)}
                key={unlock.id}
                onBlur={() => {
                  if (galleryDetailTimerRef.current === null) {
                    setActiveGalleryUnlockId(null)
                  }
                }}
                onFocus={() => {
                  if (galleryDetailTimerRef.current === null) {
                    showGalleryDetail(unlock)
                  }
                }}
                onMouseEnter={() => {
                  if (galleryDetailTimerRef.current === null) {
                    showGalleryDetail(unlock)
                  }
                }}
                onMouseLeave={() => {
                  if (galleryDetailTimerRef.current === null) {
                    setActiveGalleryUnlockId(null)
                  }
                }}
                onTouchActivate={() => showGalleryDetail(unlock, true)}
                unlock={unlock}
                variant="gallery"
              />
            ))}
          </div>
          <UnlockGalleryDetail
            onClose={hideGalleryDetail}
            unlock={activeGalleryUnlock}
          />
        </div>
      ) : visibleUnlocks.length > 0 ? (
        <div className={`unlock-card-grid ${view}`}>
          {visibleUnlocks.map((unlock) => (
            <UnlockCard
              complete={isUnlockComplete(state, unlock)}
              key={unlock.id}
              unlock={unlock}
            />
          ))}
        </div>
      ) : (
        <div className="unlock-empty">All unlock quotas cleared.</div>
      )}
    </div>
  )
}

const UnlockCard = ({
  active = false,
  complete,
  onBlur,
  onFocus,
  onMouseEnter,
  onMouseLeave,
  onTouchActivate,
  unlock,
  variant = 'upcoming',
}: {
  active?: boolean
  complete: boolean
  onBlur?: () => void
  onFocus?: () => void
  onMouseEnter?: () => void
  onMouseLeave?: () => void
  onTouchActivate?: () => void
  unlock: UnlockDefinition
  variant?: 'upcoming' | 'gallery'
}) => {
  const className = `unlock-card ${variant} ${complete ? 'complete' : 'locked'} ${active ? 'active' : ''}`
  const content = (
    <>
      {complete ? <CheckCircle2 className="unlock-check h-9 w-9" /> : null}
      {!complete && variant === 'gallery' ? (
        <Lock className="unlock-lock h-8 w-8" />
      ) : null}
      <img alt="" draggable={false} src={getUnlockImage(unlock)} />
      <strong>{unlock.goal}</strong>
      <span>{getUnlockTargetName(unlock)}</span>
      <small>
        {unlock.kind} {formatMultiplier(unlock.multiplier)}
      </small>
    </>
  )

  if (variant === 'gallery') {
    return (
      <button
        aria-label={`${unlock.name}: ${getUnlockDetailText(unlock)}`}
        className={className}
        onBlur={onBlur}
        onFocus={onFocus}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        onPointerDown={(event) => {
          if (event.pointerType !== 'mouse') {
            onTouchActivate?.()
          }
        }}
        title={unlock.name}
        type="button"
      >
        {content}
      </button>
    )
  }

  return (
    <div className={className} title={unlock.name}>
      {content}
    </div>
  )
}

const UnlockGalleryDetail = ({
  unlock,
  onClose,
}: {
  unlock: UnlockDefinition | null
  onClose: () => void
}) => (
  <div
    className={`unlock-gallery-detail ${unlock ? 'visible' : ''}`}
    aria-hidden={!unlock}
  >
    {unlock ? (
      <>
        <button
          aria-label="Close unlock detail"
          onClick={onClose}
          type="button"
        >
          X
        </button>
        <strong>{getUnlockDetailTitle(unlock)}</strong>
        <p>{getUnlockDetailText(unlock)}</p>
      </>
    ) : null}
  </div>
)

interface StatsPanelProps {
  state: GameState
  totalCashPerSecond: number
  claimableAngels: number
  angelBonusPercent: number
  onSave: () => void
  onHardReset: () => void
}

const StatsPanel = ({
  state,
  totalCashPerSecond,
  claimableAngels,
  angelBonusPercent,
  onSave,
  onHardReset,
}: StatsPanelProps) => {
  const unlockedAchievements = new Set(state.achievements)

  return (
    <div className="space-y-3">
      <div className="stats-grid">
        <StatTile label="Session" value={formatMoney(state.sessionEarnings)} />
        <StatTile
          label="Lifetime"
          value={formatMoney(state.lifetimeEarnings)}
        />
        <StatTile label="Cash/sec" value={formatMoney(totalCashPerSecond)} />
        <StatTile
          label="Prestiges"
          value={formatCompact(state.prestigeCount, 0)}
        />
        <StatTile label="Claimable" value={formatCompact(claimableAngels, 1)} />
        <StatTile
          label="Angel bonus"
          value={`${formatCompact(angelBonusPercent, 1)}%`}
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button
          className="adcap-button green flex items-center justify-center gap-2 px-3 py-3"
          onClick={onSave}
        >
          <Save className="h-4 w-4" />
          Save
        </button>
        <button
          className="adcap-button red flex items-center justify-center gap-2 px-3 py-3"
          onClick={onHardReset}
        >
          <Trash2 className="h-4 w-4" />
          Reset
        </button>
      </div>

      <div>
        <div className="mb-2 flex items-center gap-2 text-xs font-black uppercase text-[#3a2208]">
          <Trophy className="h-4 w-4" />
          Achievements
        </div>
        <div className="space-y-2">
          {achievements.map((achievement) => {
            const unlocked = unlockedAchievements.has(achievement.id)

            return (
              <div
                className={`achievement-row ${unlocked ? 'unlocked' : ''}`}
                key={achievement.id}
              >
                <div>
                  <div className="font-black uppercase">{achievement.name}</div>
                  <div className="text-sm font-bold">
                    {achievement.description}
                  </div>
                </div>
                {unlocked ? (
                  <CheckCircle2 className="h-5 w-5 shrink-0" />
                ) : null}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

const StatTile = ({ label, value }: { label: string; value: string }) => (
  <div className="stat-tile">
    <div>{label}</div>
    <strong>{value}</strong>
  </div>
)

export default App
