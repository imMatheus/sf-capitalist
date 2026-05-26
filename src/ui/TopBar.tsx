import type { BusinessId, BuyMode, WorldDefinition } from '../game/types'
import { formatMoney } from '../game/format'
import { getAngelShortAmountLabel } from './viewModel'
import type { QuickBuyOption } from './types'

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

interface CapitalHeaderProps {
  buyMode: BuyMode
  cash: number
  angels: number
  playerPortrait: string
  playerPortraitMirrored?: boolean
  quickBuyOption: QuickBuyOption | null
  totalCashPerSecond: number
  world: WorldDefinition
  onBuyManager: (businessId: BusinessId) => void
  onBuyUpgrade: (upgradeId: string) => void
  onCycleBuyMode: () => void
}

export const CapitalHeader = ({
  buyMode,
  cash,
  angels,
  playerPortrait,
  playerPortraitMirrored,
  quickBuyOption,
  totalCashPerSecond,
  world,
  onBuyManager,
  onBuyUpgrade,
  onCycleBuyMode,
}: CapitalHeaderProps) => (
  <header className="cash-ribbon">
    <div
      className="mobile-header-portrait"
      aria-label={
        world.name + ' player icon'
      }
    >
      <img
        alt=""
        className={
          'mobile-header-portrait-img' +
          (playerPortraitMirrored ? ' mirrored' : '')
        }
        draggable={false}
        src={playerPortrait}
      />
    </div>
    <div className="cash-info">
      <CashHeadline value={cash} world={world} />
      <div className="cash-subline">
        <span>
          {formatMoney(totalCashPerSecond, world.currencySymbol)} /sec
        </span>
        <span>{getAngelShortAmountLabel(angels, world, 1)}</span>
      </div>
    </div>
    <div className="top-controls">
      <QuickBuyAction
        onBuyManager={onBuyManager}
        onBuyUpgrade={onBuyUpgrade}
        option={quickBuyOption}
        world={world}
      />
      <BuyModeTag buyMode={buyMode} onCycle={onCycleBuyMode} />
    </div>
  </header>
)

