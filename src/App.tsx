import {
  BadgeDollarSign,
  CheckCircle2,
  Cpu,
  Gauge,
  Globe2,
  LayoutGrid,
  Lock,
  Menu,
  Play,
  Save,
  Sparkles,
  Trash2,
  Trophy,
  Users,
  X,
  type LucideIcon,
} from 'lucide-react'
import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react'
import chinaTravelImage from '../china.png'
import siliconValleyTravelImage from '../san-francisco.png'
import europeTravelImage from '../europe.png'
import jensenPlayerImage from '../jensen_huang_headshot_transparent.png'
import jackMaImage from '../jack_ma_headshot_transparent.png'
import ursulaPlayerImage from '../ursula_von_der_leyen_headshot_transparent.png'
import { businessIconImages } from './assets/businessIcons'
import quickUpgradeImage from './assets/businesses/quick-upgrade.png'
import { worldList } from './game/economy'
import {
  canUnlockWorld,
  getActiveWorld,
  getActiveWorldState,
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
  WorldDefinition,
  WorldId,
  WorldState,
} from './game/types'
import { useGame } from './game/useGame'

type Panel = 'managers' | 'upgrades' | 'angels' | 'unlocks' | 'travel' | 'stats'

type LevelToast = {
  key: number
  title: string
  detail: string
  image: string
}

const businessImages: Record<string, string> = businessIconImages

const getBusinessImage = (business: BusinessDefinition) =>
  businessImages[business.imageId ?? business.id] ?? quickUpgradeImage

const getBusinessImageById = (
  world: WorldDefinition,
  businessId: BusinessId,
) => {
  const business = world.businesses.find((entry) => entry.id === businessId)

  return business ? getBusinessImage(business) : quickUpgradeImage
}

const panelTabs: Array<{ id: Panel; label: string; icon: LucideIcon }> = [
  { id: 'stats', label: 'Swag & Stats', icon: Gauge },
  { id: 'unlocks', label: 'Unlocks', icon: Trophy },
  { id: 'travel', label: 'Travel', icon: Globe2 },
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
  travel: {
    title: 'Adventures',
    tone: 'travel',
    kicker: 'Choose which market you want to run.',
    help: 'Each destination keeps separate money, angels, managers, upgrades, unlocks, and business progress.',
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
const fastProgressThresholdSeconds = 0.1

const travelImages: Record<WorldId, string> = {
  'silicon-valley': siliconValleyTravelImage,
  china: chinaTravelImage,
  europe: europeTravelImage,
}

const playerPortraits: Record<WorldId, { image: string; mirrored?: boolean }> =
  {
    'silicon-valley': { image: jensenPlayerImage },
    // Swap only this entry when the China-specific portrait is ready.
    china: { image: jackMaImage },
    europe: { image: ursulaPlayerImage, mirrored: true },
  }

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

const getTotalCashPerSecond = (state: WorldState, world: WorldDefinition) =>
  world.businesses.reduce((total, business) => {
    if (!state.managers[business.id]) {
      return total
    }

    return total + getBusinessCashPerSecond(state, world, business)
  }, 0)

const getSidebarAvailability = (
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

const getUpgradeImage = (
  upgrade: UpgradeDefinition,
  world: WorldDefinition,
) => {
  if (upgrade.target === 'all') {
    return quickUpgradeImage
  }

  return getBusinessImageById(world, upgrade.target)
}

const getUnlockImage = (unlock: UnlockDefinition, world: WorldDefinition) =>
  unlock.target === 'all'
    ? quickUpgradeImage
    : getBusinessImageById(world, unlock.target)

const getUnlockTargetName = (
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

const getUnlockCurrent = (
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

const isUnlockComplete = (
  state: WorldState,
  world: WorldDefinition,
  unlock: UnlockDefinition,
) => getUnlockCurrent(state, world, unlock) >= unlock.goal

const getUnlockDetailTitle = (unlock: UnlockDefinition) => {
  const [, label] = unlock.name.split(': ')

  return label ?? unlock.name
}

const getUnlockEffectLabel = (unlock: UnlockDefinition) =>
  unlock.kind === 'reward'
    ? (unlock.reward ?? 'Reward')
    : `${unlock.kind} ${formatMultiplier(unlock.multiplier)}`

const getUnlockDetailText = (
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

const createOwnedStatePreview = (
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

const getNewUnlockToast = (
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

const formatUpgradeBadge = (upgrade: UpgradeDefinition) => {
  if (upgrade.kind === 'angelEffectiveness') {
    return `+${upgrade.multiplier}%`
  }

  if (upgrade.kind === 'owned') {
    return `+${upgrade.multiplier}`
  }

  return formatMultiplier(upgrade.multiplier)
}

const getQuickBuyOption = (
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
      image: getBusinessImage(business),
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

const App = () => {
  const { state, actions, offlineReport, saveNow } = useGame()
  const world = getActiveWorld(state)
  const worldState = getActiveWorldState(state)
  const [buyMode, setBuyMode] = useState<BuyMode>(1)
  const [panel, setPanel] = useState<Panel | null>(null)
  const [levelToast, setLevelToast] = useState<LevelToast | null>(null)
  const levelToastTimerRef = useRef<number | null>(null)
  const levelToastKeyRef = useRef(0)
  const claimableAngels = getClaimableAngels(worldState)
  const angelBonusPercent =
    worldState.angels * getAngelEffectiveness(worldState, world) * 100
  const totalCashPerSecond = useMemo(
    () => getTotalCashPerSecond(worldState, world),
    [worldState, world],
  )
  const nextAllUnlock = getNextAllUnlock(worldState, world)
  const quickBuyOption = useMemo(
    () => getQuickBuyOption(worldState, world),
    [worldState, world],
  )
  const sidebarAvailability = useMemo(
    () => getSidebarAvailability(worldState, world, claimableAngels),
    [worldState, world, claimableAngels],
  )
  const cycleBuyMode = () => setBuyMode((current) => getNextBuyMode(current))
  const closePanel = () => setPanel(null)

  const clearLevelToastTimer = () => {
    if (levelToastTimerRef.current !== null) {
      window.clearTimeout(levelToastTimerRef.current)
      levelToastTimerRef.current = null
    }
  }

  const showLevelToast = (toast: Omit<LevelToast, 'key'>) => {
    clearLevelToastTimer()
    levelToastKeyRef.current += 1
    setLevelToast({ ...toast, key: levelToastKeyRef.current })
    levelToastTimerRef.current = window.setTimeout(() => {
      setLevelToast(null)
      levelToastTimerRef.current = null
    }, 2_500)
  }

  const buyBusinessWithToast = (businessId: BusinessId, mode: BuyMode) => {
    const business = world.businesses.find((entry) => entry.id === businessId)

    if (!business) {
      return
    }

    const currentBusiness = worldState.businesses[businessId]
    const quantity = getBuyQuantity(worldState, world, business, mode)
    const cost = getPurchaseCost(business, currentBusiness.owned, quantity)

    if (quantity <= 0 || cost > worldState.cash || !Number.isFinite(cost)) {
      return
    }

    const afterState = createOwnedStatePreview(
      worldState,
      businessId,
      currentBusiness.owned + quantity,
    )
    const toast = getNewUnlockToast(worldState, afterState, world)

    actions.buyBusiness(businessId, mode)

    if (toast) {
      showLevelToast(toast)
    }
  }

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

  useEffect(
    () => () => {
      clearLevelToastTimer()
    },
    [],
  )

  return (
    <div className={`adcap-screen theme-${world.id} min-h-screen text-[#241d17]`}>
      <div className="adcap-stage">
        <Sidebar
          availability={sidebarAvailability}
          panel={panel}
          playerPortrait={playerPortraits[world.id].image}
          playerPortraitMirrored={playerPortraits[world.id].mirrored}
          worldName={world.name}
          setPanel={setPanel}
        />

        <main className="capital-floor">
          <header className="cash-ribbon">
            <div
              className="mobile-header-portrait"
              aria-label={`${world.name} player icon`}
            >
              <img
                alt=""
                className={`mobile-header-portrait-img${
                  playerPortraits[world.id].mirrored ? ' mirrored' : ''
                }`}
                draggable={false}
                src={playerPortraits[world.id].image}
              />
            </div>
            <div className="cash-info">
              <CashHeadline value={worldState.cash} world={world} />
              <div className="cash-subline">
                <span>
                  {formatMoney(totalCashPerSecond, world.currencySymbol)} /sec
                </span>
                <span>{formatCompact(worldState.angels, 1)} angels</span>
              </div>
            </div>
            <div className="top-controls">
              <QuickBuyAction
                onBuyManager={actions.buyManager}
                onBuyUpgrade={actions.buyUpgrade}
                option={quickBuyOption}
                world={world}
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
                  {formatMoney(offlineReport.earnings, world.currencySymbol)}.
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
            {world.businesses.map((business) => (
              <BusinessRow
                business={business}
                buyMode={buyMode}
                key={business.id}
                onBuy={buyBusinessWithToast}
                onStart={actions.startBusiness}
                state={worldState}
                world={world}
              />
            ))}
          </section>
        </main>
      </div>

      {panel ? (
        <PanelModal onClose={closePanel} panel={panel}>
          {panel === 'managers' ? (
            <ManagersPanel
              onBuy={actions.buyManager}
              state={worldState}
              world={world}
            />
          ) : null}
          {panel === 'upgrades' ? (
            <UpgradesPanel
              onBuy={actions.buyUpgrade}
              state={worldState}
              world={world}
            />
          ) : null}
          {panel === 'travel' ? (
            <TravelPanel
              activeWorldId={state.activeWorldId}
              gameState={state}
              onUnlock={actions.unlockWorld}
              onSelect={(worldId) => {
                actions.switchWorld(worldId)
                closePanel()
              }}
            />
          ) : null}
          {panel === 'angels' ? (
            <AngelsPanel
              angelBonusPercent={angelBonusPercent}
              claimableAngels={claimableAngels}
              onReset={actions.resetForAngels}
              state={worldState}
              world={world}
            />
          ) : null}
          {panel === 'unlocks' ? (
            <UnlocksPanel state={worldState} world={world} />
          ) : null}
          {panel === 'stats' ? (
            <StatsPanel
              angelBonusPercent={angelBonusPercent}
              claimableAngels={claimableAngels}
              onHardReset={actions.hardReset}
              onSave={saveNow}
              state={worldState}
              totalCashPerSecond={totalCashPerSecond}
              world={world}
            />
          ) : null}
        </PanelModal>
      ) : null}
      {levelToast ? (
        <LevelToastView key={levelToast.key} toast={levelToast} />
      ) : null}
    </div>
  )
}

const LevelToastView = ({ toast }: { toast: LevelToast }) => (
  <div className="level-toast" role="status">
    <img alt="" draggable={false} src={toast.image} />
    <div>
      <strong>{toast.title}</strong>
      <span>{toast.detail}</span>
    </div>
  </div>
)

interface SidebarProps {
  availability: Partial<Record<Panel, boolean>>
  panel: Panel | null
  playerPortrait: string
  playerPortraitMirrored?: boolean
  worldName: string
  setPanel: (panel: Panel) => void
}

const Sidebar = ({
  availability,
  panel,
  playerPortrait,
  playerPortraitMirrored,
  worldName,
  setPanel,
}: SidebarProps) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const selectPanel = (nextPanel: Panel) => {
    setPanel(nextPanel)
    setMobileMenuOpen(false)
  }

  useEffect(() => {
    if (!mobileMenuOpen) {
      return
    }

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMobileMenuOpen(false)
      }
    }

    window.addEventListener('keydown', closeOnEscape)

    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [mobileMenuOpen])

  return (
    <aside className="left-menu">
      <div className="mascot-card" aria-label={`${worldName} player icon`}>
        <img
          alt=""
          className={`mascot-portrait${playerPortraitMirrored ? ' mirrored' : ''}`}
          draggable={false}
          src={playerPortrait}
        />
        <div className="ribbon">GPU & Stats</div>
      </div>

      <div
        className="mobile-player-card"
        aria-label={`${worldName} player icon`}
      >
        <img
          alt=""
          className={`mobile-player-portrait${playerPortraitMirrored ? ' mirrored' : ''}`}
          draggable={false}
          src={playerPortrait}
        />
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
              onClick={() => selectPanel(tab.id)}
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
        onClick={() => selectPanel('stats')}
        type="button"
      >
        <span>Shop</span>
        <BadgeDollarSign className="h-11 w-11" />
      </button>

      <div className="mobile-bottom-nav" aria-label="Mobile game menu">
        <button
          aria-controls="mobile-panel-menu"
          aria-expanded={mobileMenuOpen}
          className="mobile-menu-button"
          onClick={() => setMobileMenuOpen((current) => !current)}
          type="button"
        >
          <Menu className="h-9 w-9" strokeWidth={4} />
          <span>Menu</span>
        </button>
      </div>

      {mobileMenuOpen ? (
        <div className="mobile-menu-backdrop" role="presentation">
          <button
            aria-label="Close mobile menu"
            className="mobile-menu-dismiss"
            onClick={() => setMobileMenuOpen(false)}
            type="button"
          />
          <nav
            aria-label="Mobile pages"
            className="mobile-menu-sheet"
            id="mobile-panel-menu"
          >
            {panelTabs.map((tab) => {
              const Icon = tab.icon

              return (
                <button
                  className={`mobile-menu-item ${panel === tab.id ? 'active' : ''}`}
                  key={tab.id}
                  onClick={() => selectPanel(tab.id)}
                  type="button"
                >
                  <span
                    className={`mobile-menu-status ${availability[tab.id] ? 'available' : ''}`}
                    aria-hidden="true"
                  />
                  <Icon className="h-6 w-6" />
                  <span>{tab.label}</span>
                </button>
              )
            })}
            <button
              aria-label="Close mobile menu"
              className="mobile-menu-close"
              onClick={() => setMobileMenuOpen(false)}
              type="button"
            >
              <X className="h-11 w-11" strokeWidth={4} />
            </button>
          </nav>
        </div>
      ) : null}
    </aside>
  )
}

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

const splitMoney = (value: number, world: WorldDefinition) => {
  const formatted = formatMoney(value, world.currencySymbol)
  const [amount, ...scale] = formatted.split(' ')

  return {
    amount,
    scale: scale.join(' ').toUpperCase() || world.currencyName.toUpperCase(),
  }
}

const CashHeadline = ({
  value,
  world,
}: {
  value: number
  world: WorldDefinition
}) => {
  const money = splitMoney(value, world)

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
  world: WorldDefinition
}

const QuickBuyAction = ({
  option,
  onBuyManager,
  onBuyUpgrade,
  world,
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
  const title = `Buy ${option.name}: ${option.description} (${formatMoney(option.cost, world.currencySymbol)})`
  const caption =
    option.kind === 'upgrade' && option.badge.toLowerCase().startsWith('x')
      ? `Profit ${option.badge}`
      : option.badge

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
      <span className="quick-buy-caption">{caption}</span>
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

const getScaleLabel = (value: number, world: WorldDefinition) => {
  const [, ...scale] = formatCompact(value, 3).split(' ')

  return scale.join(' ').toUpperCase() || world.currencyName.toUpperCase()
}

const getAmountLabel = (value: number) => formatCompact(value, 3).split(' ')[0]

const getRevenueFillScale = (
  progress: number,
  duration: number,
  elapsedSeconds: number,
  loops: boolean,
) => {
  if (duration <= 0) {
    return 0
  }

  const totalProgress = Math.max(0, progress + elapsedSeconds)
  const visibleProgress = loops
    ? totalProgress % duration
    : Math.min(duration, totalProgress)

  return Math.min(1, Math.max(0, visibleProgress / duration))
}

interface RevenueFillProps {
  active: boolean
  automated: boolean
  duration: number
  fastCycle: boolean
  progress: number
}

const RevenueFill = ({
  active,
  automated,
  duration,
  fastCycle,
  progress,
}: RevenueFillProps) => {
  const fillRef = useRef<HTMLSpanElement | null>(null)
  const baselineRef = useRef({
    duration,
    progress,
    updatedAt: 0,
  })
  const initialScale =
    active && fastCycle
      ? 1
      : active
        ? getRevenueFillScale(progress, duration, 0, automated)
        : 0

  useLayoutEffect(() => {
    baselineRef.current = {
      duration,
      progress,
      updatedAt: performance.now(),
    }

    if (fillRef.current) {
      fillRef.current.style.transform = `scaleX(${initialScale})`
    }
  }, [active, automated, duration, fastCycle, initialScale, progress])

  useEffect(() => {
    const fill = fillRef.current

    if (!fill) {
      return
    }

    if (!active) {
      fill.style.transform = 'scaleX(0)'
      return
    }

    if (fastCycle) {
      fill.style.transform = 'scaleX(1)'
      return
    }

    let frameId = 0
    const draw = (now: number) => {
      const baseline = baselineRef.current
      const elapsedSeconds = (now - baseline.updatedAt) / 1_000
      const scale = getRevenueFillScale(
        baseline.progress,
        baseline.duration,
        elapsedSeconds,
        automated,
      )

      fill.style.transform = `scaleX(${scale})`
      frameId = window.requestAnimationFrame(draw)
    }

    frameId = window.requestAnimationFrame(draw)

    return () => window.cancelAnimationFrame(frameId)
  }, [active, automated, duration, fastCycle])

  return (
    <span
      className={`revenue-fill ${fastCycle ? 'fast-progress' : ''}`}
      ref={fillRef}
      style={{ transform: `scaleX(${initialScale})` }}
    />
  )
}

interface BusinessRowProps {
  business: BusinessDefinition
  buyMode: BuyMode
  state: WorldState
  world: WorldDefinition
  onBuy: (businessId: BusinessId, mode: BuyMode) => void
  onStart: (businessId: BusinessId) => void
}

const BusinessRow = ({
  business,
  buyMode,
  state,
  world,
  onBuy,
  onStart,
}: BusinessRowProps) => {
  const businessState = state.businesses[business.id]
  const quantity = getBuyQuantity(state, world, business, buyMode)
  const purchaseCost = getPurchaseCost(business, businessState.owned, quantity)
  const canBuy = quantity > 0 && state.cash >= purchaseCost
  const buyLabel = `Buy ${quantity}`
  const displayCost =
    quantity > 0
      ? purchaseCost
      : getPurchaseCost(business, businessState.owned, 1)
  const duration = getBusinessDuration(state, world, business)
  const revenue = getBusinessRevenue(state, world, business)
  const automated = state.managers[business.id]
  const showProgress = businessState.running || automated
  const fastCycle = duration < fastProgressThresholdSeconds && showProgress
  const progressSeconds = showProgress
    ? Math.min(duration, Math.max(0, businessState.progress))
    : 0
  const canStart =
    businessState.owned > 0 && !businessState.running && !automated
  const timeRemaining =
    businessState.running || automated
      ? duration - businessState.progress
      : duration
  const nextUnlock = getNextUnlock(state, world, business.id)
  const unlockGoals = world.businessUnlocks
    .filter((unlock) => (unlock.triggerTarget ?? unlock.target) === business.id)
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
    ? `${formatMoney(getBusinessCashPerSecond(state, world, business), world.currencySymbol)} /sec`
    : `${formatMoney(revenue, world.currencySymbol)} /run`

  if (businessState.owned === 0) {
    const firstPurchaseCost = getPurchaseCost(business, 0, 1)
    const canUnlock = state.cash >= firstPurchaseCost

    return (
      <article
        className={`business-unlock-card ${canUnlock ? 'affordable' : 'locked'}`}
        style={{ '--business-accent': business.accent } as CSSProperties}
      >
        <button
          aria-label={`Buy ${business.name} for ${formatMoney(firstPurchaseCost, world.currencySymbol)}`}
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
              src={getBusinessImage(business)}
            />
          </span>
          <span className="business-unlock-copy">
            <strong>{business.name}</strong>
            <span>{formatMoney(firstPurchaseCost, world.currencySymbol)}</span>
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
            src={getBusinessImage(business)}
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
          <h2>{business.name}</h2>
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
          <RevenueFill
            active={showProgress}
            automated={automated}
            duration={duration}
            fastCycle={fastCycle}
            progress={progressSeconds}
          />
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
            <em>{getScaleLabel(displayCost, world)}</em>
          </button>
          <div className="time-block">{formatCountdown(timeRemaining)}</div>
        </div>
      </div>
    </article>
  )
}

interface ManagersPanelProps {
  state: WorldState
  world: WorldDefinition
  onBuy: (businessId: BusinessId) => void
}

const CurrencyPills = ({
  active,
  onSelect,
  state,
  world,
}: {
  active: 'cash' | 'angels'
  onSelect?: (currency: 'cash' | 'angels') => void
  state: WorldState
  world: WorldDefinition
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
        ? formatMoney(state.cash, world.currencySymbol)
        : `${formatCompact(state.angels, 1)} angels`}
    </strong>
  </div>
)

const ManagerCashBalance = ({
  state,
  world,
}: {
  state: WorldState
  world: WorldDefinition
}) => (
  <div className="manager-cash-balance">
    <BadgeDollarSign aria-hidden="true" />
    <span>Cash on hand</span>
    <strong>{formatMoney(state.cash, world.currencySymbol)}</strong>
  </div>
)

const ManagersPanel = ({ state, world, onBuy }: ManagersPanelProps) => (
  <div className="space-y-2">
    <ManagerCashBalance state={state} world={world} />
    {[...world.businesses]
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
              src={getBusinessImage(business)}
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
              {hired
                ? 'Hired'
                : formatMoney(business.managerCost, world.currencySymbol)}
            </button>
          </div>
        )
      })}
  </div>
)

interface TravelPanelProps {
  activeWorldId: WorldId
  gameState: GameState
  onUnlock: (worldId: WorldId) => void
  onSelect: (worldId: WorldId) => void
}

const getTravelUnlockLabel = (world: WorldDefinition, prefix = false) => {
  if (world.unlockCost.currency === 'free') {
    return 'Free'
  }

  const cost =
    world.unlockCost.currency === 'megaBucks'
      ? `${formatCompact(world.unlockCost.amount, 0)} MB`
      : formatMoney(world.unlockCost.amount, '$')

  return prefix ? `Unlock ${cost}` : cost
}

const TravelPanel = ({
  activeWorldId,
  gameState,
  onUnlock,
  onSelect,
}: TravelPanelProps) => {
  const [unlockingWorldId, setUnlockingWorldId] = useState<WorldId | null>(null)
  const unlockTimerRef = useRef<number | null>(null)

  useEffect(
    () => () => {
      if (unlockTimerRef.current !== null) {
        window.clearTimeout(unlockTimerRef.current)
      }
    },
    [],
  )

  const animateUnlock = (worldId: WorldId) => {
    if (unlockTimerRef.current !== null) {
      window.clearTimeout(unlockTimerRef.current)
    }

    setUnlockingWorldId(worldId)
    onUnlock(worldId)
    unlockTimerRef.current = window.setTimeout(() => {
      setUnlockingWorldId(null)
      unlockTimerRef.current = null
    }, 1050)
  }

  return (
    <div className="travel-panel">
      <div className="mega-bucks-balance">
        <Globe2 className="h-5 w-5" />
        <span>{formatCompact(gameState.megaBucks, 0)} Mega Bucks</span>
        <span>
          {formatMoney(gameState.worlds['silicon-valley'].cash, '$')} Silicon
          Valley cash
        </span>
      </div>

      <div className="travel-destinations">
        {worldList.map((world) => {
          const active = activeWorldId === world.id
          const unlocked = gameState.unlockedWorldIds.includes(world.id)
          const canUnlock = canUnlockWorld(gameState, world)
          const unlocking = unlockingWorldId === world.id
          const statusLabel = unlocking
            ? 'Unlocked!'
            : active
              ? 'Current'
              : unlocked
                ? 'Launch!'
                : canUnlock
                  ? getTravelUnlockLabel(world, true)
                  : getTravelUnlockLabel(world)

          return (
            <button
              aria-label={`${world.name}: ${statusLabel}`}
              className={`travel-choice ${world.id} ${active ? 'active' : ''} ${
                unlocked && !unlocking ? '' : 'locked'
              } ${!unlocked && canUnlock ? 'affordable-locked' : ''} ${
                unlocking ? 'unlocking' : ''
              }`}
              disabled={active || unlocking || (!unlocked && !canUnlock)}
              key={world.id}
              onClick={() => {
                if (unlocked) {
                  onSelect(world.id)
                  return
                }

                animateUnlock(world.id)
              }}
              type="button"
            >
              <span className="travel-choice-ribbon">{world.name}</span>
              <img
                alt=""
                className="travel-choice-image"
                draggable={false}
                src={travelImages[world.id]}
              />
              {!unlocked || unlocking ? (
                <span className="travel-choice-lock" aria-hidden="true">
                  <Lock className="travel-lock-svg" />
                </span>
              ) : null}
              <span className="travel-choice-status">{statusLabel}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

interface UpgradesPanelProps {
  state: WorldState
  world: WorldDefinition
  onBuy: (upgradeId: string) => void
}

const UpgradesPanel = ({ state, world, onBuy }: UpgradesPanelProps) => {
  const [currency, setCurrency] = useState<'cash' | 'angels'>('cash')
  const upgrades =
    currency === 'cash' ? world.cashUpgrades : world.angelUpgrades
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
      <CurrencyPills
        active={currency}
        onSelect={setCurrency}
        state={state}
        world={world}
      />
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
              src={getUpgradeImage(upgrade, world)}
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
                  ? formatMoney(upgrade.cost, world.currencySymbol)
                  : `${formatCompact(upgrade.cost, 0)} angels`}
            </button>
          </div>
        )
      })}
    </div>
  )
}

interface AngelsPanelProps {
  state: WorldState
  world: WorldDefinition
  claimableAngels: number
  angelBonusPercent: number
  onReset: () => void
}

const AngelsPanel = ({
  state,
  world,
  claimableAngels,
  angelBonusPercent,
  onReset,
}: AngelsPanelProps) => {
  const [confirmResetOpen, setConfirmResetOpen] = useState(false)

  const confirmReset = () => {
    setConfirmResetOpen(false)
    onReset()
  }

  return (
    <div className="investor-layout">
      <div className="angel-total-banner">
        <div>Your Total Angels</div>
        <strong>{formatCompact(state.angels, 2)}</strong>
      </div>

      <div className="investor-cards">
        <div className="investor-card">
          <strong>
            {formatCompact(getAngelEffectiveness(state, world) * 100, 2)}%
          </strong>
          <span>Profit Bonus Per Angel</span>
          <em>{formatCompact(angelBonusPercent, 2)}% total bonus</em>
        </div>
        <div className="investor-card claim">
          <strong>{formatCompact(claimableAngels, 2)}</strong>
          <span>Angels Claimed With Restart</span>
          <button
            className="adcap-button"
            disabled={claimableAngels <= 0}
            onClick={() => setConfirmResetOpen(true)}
            type="button"
          >
            Claim
          </button>
          <em>Restart your businesses</em>
        </div>
      </div>

      {confirmResetOpen ? (
        <div
          aria-labelledby="investor-confirm-title"
          aria-modal="true"
          className="investor-confirm-backdrop"
          onClick={() => setConfirmResetOpen(false)}
          role="dialog"
        >
          <div
            className="investor-confirm-card"
            onClick={(event) => event.stopPropagation()}
          >
            <span className="investor-confirm-kicker">
              Reset {world.name}
            </span>
            <h3 id="investor-confirm-title">Claim your new angels?</h3>
            <strong>{formatCompact(claimableAngels, 2)}</strong>
            <p>
              This restarts your businesses, cash, managers, and upgrades in
              this market. Your current angels and completed achievements stay.
            </p>
            <div className="investor-confirm-actions">
              <button
                className="adcap-button red"
                onClick={() => setConfirmResetOpen(false)}
                type="button"
              >
                Cancel
              </button>
              <button
                className="adcap-button green"
                onClick={confirmReset}
                type="button"
              >
                Claim
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

const UnlocksPanel = ({
  state,
  world,
}: {
  state: WorldState
  world: WorldDefinition
}) => {
  const [view, setView] = useState<'upcoming' | 'gallery'>('upcoming')
  const [activeUnlockId, setActiveUnlockId] = useState<string | null>(null)
  const nextBusinessUnlocks = world.businesses
    .map((business) => getNextUnlock(state, world, business.id))
    .filter((unlock): unlock is UnlockDefinition => Boolean(unlock))
  const nextAllUnlock = getNextAllUnlock(state, world)
  const upcomingUnlocks = nextAllUnlock
    ? [...nextBusinessUnlocks, nextAllUnlock]
    : nextBusinessUnlocks
  const galleryUnlocks = [...world.businessUnlocks, ...world.allBusinessUnlocks]
  const completedUnlocks = galleryUnlocks.filter((unlock) =>
    isUnlockComplete(state, world, unlock),
  ).length
  const visibleUnlocks = view === 'upcoming' ? upcomingUnlocks : galleryUnlocks
  const activeUnlock =
    view === 'gallery'
      ? (galleryUnlocks.find((unlock) => unlock.id === activeUnlockId) ?? null)
      : null

  const hideUnlockDetail = () => {
    setActiveUnlockId(null)
  }

  const showUnlockDetail = (unlock: UnlockDefinition) => {
    setActiveUnlockId(unlock.id)
  }

  useEffect(() => {
    hideUnlockDetail()
  }, [view])

  const getUnlockDetailHandlers = (unlock: UnlockDefinition) => ({
    active: activeUnlockId === unlock.id,
    onActivate: () => showUnlockDetail(unlock),
  })

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
          : `Every quota in your ${world.name} empire. Completed levels are checked off.`}
      </p>

      {visibleUnlocks.length > 0 ? (
        <div
          className={`unlock-detail-shell ${view} ${activeUnlock ? 'has-detail' : ''}`}
        >
          {view === 'gallery' ? (
            <UnlockGalleryDetail
              onClose={hideUnlockDetail}
              unlock={activeUnlock}
              world={world}
            />
          ) : null}
          <div className={`unlock-card-grid ${view}`}>
            {visibleUnlocks.map((unlock) => (
              <UnlockCard
                {...(view === 'gallery' ? getUnlockDetailHandlers(unlock) : {})}
                complete={isUnlockComplete(state, world, unlock)}
                key={unlock.id}
                unlock={unlock}
                world={world}
                variant={view}
              />
            ))}
          </div>
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
  onActivate,
  unlock,
  world,
  variant = 'upcoming',
}: {
  active?: boolean
  complete: boolean
  onActivate?: () => void
  unlock: UnlockDefinition
  world: WorldDefinition
  variant?: 'upcoming' | 'gallery'
}) => {
  const className = `unlock-card ${variant} ${complete ? 'complete' : 'locked'} ${active ? 'active' : ''}`
  const content = (
    <>
      {complete ? <CheckCircle2 className="unlock-check h-9 w-9" /> : null}
      {!complete && variant === 'gallery' ? (
        <Lock className="unlock-lock h-8 w-8" />
      ) : null}
      <img alt="" draggable={false} src={getUnlockImage(unlock, world)} />
      <strong>{unlock.goal}</strong>
      <span>{getUnlockTargetName(unlock, world)}</span>
      <small>{getUnlockEffectLabel(unlock)}</small>
    </>
  )

  if (!onActivate) {
    return (
      <div className={className} title={unlock.name}>
        {content}
      </div>
    )
  }

  return (
    <button
      aria-label={`${unlock.name}: ${getUnlockDetailText(unlock, world)}`}
      className={className}
      onClick={onActivate}
      title={unlock.name}
      type="button"
    >
      {content}
    </button>
  )
}

const UnlockGalleryDetail = ({
  unlock,
  onClose,
  world,
}: {
  unlock: UnlockDefinition | null
  onClose: () => void
  world: WorldDefinition
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
        <p>{getUnlockDetailText(unlock, world)}</p>
      </>
    ) : null}
  </div>
)

interface StatsPanelProps {
  state: WorldState
  world: WorldDefinition
  totalCashPerSecond: number
  claimableAngels: number
  angelBonusPercent: number
  onSave: () => void
  onHardReset: () => void
}

const StatsPanel = ({
  state,
  world,
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
        <StatTile
          label="Session"
          value={formatMoney(state.sessionEarnings, world.currencySymbol)}
        />
        <StatTile
          label="Lifetime"
          value={formatMoney(state.lifetimeEarnings, world.currencySymbol)}
        />
        <StatTile
          label="Cash/sec"
          value={formatMoney(totalCashPerSecond, world.currencySymbol)}
        />
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
          {world.achievements.map((achievement) => {
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
