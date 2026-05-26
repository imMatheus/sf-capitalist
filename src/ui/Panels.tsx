import {
  BadgeDollarSign,
  CheckCircle2,
  Globe2,
  LayoutGrid,
  Lock,
  Save,
  Sparkles,
  Trash2,
  Trophy,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import {
  canUnlockWorld,
  getAngelEffectiveness,
  getNextAllUnlock,
  getNextUnlock,
} from '../game/engine'
import { worldList } from '../game/economy'
import { formatCompact, formatMoney } from '../game/format'
import type {
  BusinessId,
  GameState,
  UnlockDefinition,
  WorldDefinition,
  WorldId,
  WorldState,
} from '../game/types'
import {
  getBusinessImage,
  getUnlockImage,
  getUpgradeImage,
  scoutImages,
  travelImages,
} from './assets'
import {
  getAngelPluralLabel,
  getAngelShortAmountLabel,
  getAngelShortPluralLabel,
  getAngelShortSingularLabel,
  getAngelSingularLabel,
  getUnlockDetailText,
  getUnlockDetailTitle,
  getUnlockEffectLabel,
  getUnlockTargetName,
  isUnlockComplete,
} from './viewModel'
import type { Panel } from './types'

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
      <span>{getAngelShortPluralLabel(world)}</span>
    </button>
    <strong>
      {active === 'cash'
        ? formatMoney(state.cash, world.currencySymbol)
        : getAngelShortAmountLabel(state.angels, world, 1)}
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

export const ManagersPanel = ({ state, world, onBuy }: ManagersPanelProps) => (
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

  const cost = formatMoney(world.unlockCost.amount, '$')

  return prefix ? `Unlock ${cost}` : cost
}

export const TravelPanel = ({
  activeWorldId,
  gameState,
  onUnlock,
  onSelect,
}: TravelPanelProps) => {
  const [unlockingWorldId, setUnlockingWorldId] = useState<WorldId | null>(null)
  const unlockTimerRef = useRef<number | null>(null)
  const travelWorldOrder: WorldId[] = ['silicon-valley', 'europe', 'china']
  const travelWorlds = travelWorldOrder
    .map((worldId) => worldList.find((world) => world.id === worldId))
    .filter((world): world is WorldDefinition => Boolean(world))

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
      <div className="travel-cash-balance">
        <Globe2 className="h-5 w-5" />
        <span>
          {formatMoney(gameState.worlds['silicon-valley'].cash, '$')} Earth
          dollars
        </span>
      </div>

      <div className="travel-destinations">
        {travelWorlds.map((world) => {
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

export const UpgradesPanel = ({ state, world, onBuy }: UpgradesPanelProps) => {
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
                  : getAngelShortAmountLabel(upgrade.cost, world, 0)}
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

export const AngelsPanel = ({
  state,
  world,
  claimableAngels,
  angelBonusPercent,
  onReset,
}: AngelsPanelProps) => {
  const [confirmResetOpen, setConfirmResetOpen] = useState(false)
  const angelSingularLabel = getAngelSingularLabel(world)
  const angelPluralLabel = getAngelPluralLabel(world)

  const confirmReset = () => {
    setConfirmResetOpen(false)
    onReset()
  }

  const scoutImage = scoutImages[world.id]

  return (
    <div className="investor-layout">
      <div className="investor-hero">
        <img
          alt=""
          className="investor-scout investor-scout-left"
          draggable={false}
          src={scoutImage}
        />
        <div className="angel-total-banner">
          <div>Total {angelPluralLabel}</div>
          <strong>{formatCompact(state.angels, 2)}</strong>
        </div>
        <img
          alt=""
          className="investor-scout investor-scout-right"
          draggable={false}
          src={scoutImage}
        />
      </div>

      <div className="investor-cards">
        <div className="investor-card">
          <strong>
            {formatCompact(getAngelEffectiveness(state, world) * 100, 2)}%
          </strong>
          <span>Profit Bonus Per {angelSingularLabel}</span>
          <em>{formatCompact(angelBonusPercent, 2)}% total bonus</em>
        </div>
        <div className="investor-card claim">
          <strong>{formatCompact(claimableAngels, 2)}</strong>
          <span>New {angelPluralLabel} after restart</span>
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
            <span className="investor-confirm-kicker">Reset {world.name}</span>
            <h3 id="investor-confirm-title">
              Claim your new {angelPluralLabel}?
            </h3>
            <strong>{formatCompact(claimableAngels, 2)}</strong>
            <p>
              This restarts your businesses, cash, managers, and upgrades in
              this market. Your current {angelPluralLabel} and completed
              achievements stay.
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

export const UnlocksPanel = ({
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

export const StatsPanel = ({
  state,
  world,
  totalCashPerSecond,
  claimableAngels,
  angelBonusPercent,
  onSave,
  onHardReset,
}: StatsPanelProps) => {
  const [confirmHardResetOpen, setConfirmHardResetOpen] = useState(false)
  const unlockedAchievements = new Set(state.achievements)

  const confirmHardReset = () => {
    setConfirmHardResetOpen(false)
    onHardReset()
  }

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
          label={`${getAngelShortSingularLabel(world)} bonus`}
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
          onClick={() => setConfirmHardResetOpen(true)}
        >
          <Trash2 className="h-4 w-4" />
          Reset
        </button>
      </div>

      {confirmHardResetOpen ? (
        <div
          aria-labelledby="stats-reset-confirm-title"
          aria-modal="true"
          className="investor-confirm-backdrop"
          onClick={() => setConfirmHardResetOpen(false)}
          role="dialog"
        >
          <div
            className="investor-confirm-card"
            onClick={(event) => event.stopPropagation()}
          >
            <span className="investor-confirm-kicker">Hard reset</span>
            <h3 id="stats-reset-confirm-title">Reset everything?</h3>
            <strong>All</strong>
            <p>
              This clears your current run, saved progress, achievements,
              unlocks, upgrades, managers, and all market progress.
            </p>
            <div className="investor-confirm-actions">
              <button
                className="adcap-button green"
                onClick={() => setConfirmHardResetOpen(false)}
                type="button"
              >
                Cancel
              </button>
              <button
                className="adcap-button red"
                onClick={confirmHardReset}
                type="button"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <div>
        <div className="mb-2 flex items-center gap-2 text-xs font-black uppercase text-[#3a2208]">
          <Trophy className="h-4 w-4" />
          Achievements
        </div>
        <div className="achievement-list">
          {world.achievements.map((achievement) => {
            const unlocked = unlockedAchievements.has(achievement.id)

            return (
              <div
                className={`achievement-row ${unlocked ? 'unlocked' : ''}`}
                key={achievement.id}
              >
                <div>
                  <div className="achievement-title">{achievement.name}</div>
                  <div className="achievement-description">
                    {achievement.description}
                  </div>
                </div>
                {unlocked ? (
                  <CheckCircle2 className="achievement-check" />
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

interface GamePanelContentProps {
  angelBonusPercent: number
  claimableAngels: number
  gameState: GameState
  panel: Panel
  state: WorldState
  totalCashPerSecond: number
  world: WorldDefinition
  onBuyManager: (businessId: BusinessId) => void
  onBuyUpgrade: (upgradeId: string) => void
  onHardReset: () => void
  onResetForAngels: () => void
  onSave: () => void
  onSelectWorld: (worldId: WorldId) => void
  onUnlockWorld: (worldId: WorldId) => void
}

export const GamePanelContent = ({
  angelBonusPercent,
  claimableAngels,
  gameState,
  panel,
  state,
  totalCashPerSecond,
  world,
  onBuyManager,
  onBuyUpgrade,
  onHardReset,
  onResetForAngels,
  onSave,
  onSelectWorld,
  onUnlockWorld,
}: GamePanelContentProps) => {
  switch (panel) {
    case 'managers':
      return <ManagersPanel onBuy={onBuyManager} state={state} world={world} />
    case 'upgrades':
      return <UpgradesPanel onBuy={onBuyUpgrade} state={state} world={world} />
    case 'travel':
      return (
        <TravelPanel
          activeWorldId={gameState.activeWorldId}
          gameState={gameState}
          onSelect={onSelectWorld}
          onUnlock={onUnlockWorld}
        />
      )
    case 'angels':
      return (
        <AngelsPanel
          angelBonusPercent={angelBonusPercent}
          claimableAngels={claimableAngels}
          onReset={onResetForAngels}
          state={state}
          world={world}
        />
      )
    case 'unlocks':
      return <UnlocksPanel state={state} world={world} />
    case 'stats':
      return (
        <StatsPanel
          angelBonusPercent={angelBonusPercent}
          claimableAngels={claimableAngels}
          onHardReset={onHardReset}
          onSave={onSave}
          state={state}
          totalCashPerSecond={totalCashPerSecond}
          world={world}
        />
      )
  }
}
