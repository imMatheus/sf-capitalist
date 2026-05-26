import { Play } from 'lucide-react'
import {
  useEffect,
  useLayoutEffect,
  useRef,
  type CSSProperties,
} from 'react'
import {
  getBusinessCashPerSecond,
  getBusinessDuration,
  getBusinessRevenue,
  getBuyQuantity,
  getNextUnlock,
  getPurchaseCost,
} from '../game/engine'
import { formatCompact, formatLevel, formatMoney } from '../game/format'
import type {
  BusinessDefinition,
  BusinessId,
  BuyMode,
  WorldDefinition,
  WorldState,
} from '../game/types'
import { getBusinessImage } from './assets'
import { fastProgressThresholdSeconds } from './viewModel'

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

export const BusinessRow = ({
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
