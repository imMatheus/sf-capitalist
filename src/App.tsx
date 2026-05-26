import { useEffect, useMemo, useRef, useState } from 'react'
import {
  getActiveWorld,
  getActiveWorldState,
  getAngelEffectiveness,
  getBuyQuantity,
  getClaimableAngels,
  getPurchaseCost,
} from './game/engine'
import { formatDuration, formatMoney } from './game/format'
import type { BusinessId, BuyMode } from './game/types'
import { useGame } from './game/useGame'
import { playerPortraits } from './ui/assets'
import { BusinessRow } from './ui/BusinessRow'
import { GamePanelContent } from './ui/Panels'
import { LevelToastView, PanelModal, Sidebar } from './ui/Shell'
import { CapitalHeader } from './ui/TopBar'
import type { LevelToast, Panel } from './ui/types'
import {
  createOwnedStatePreview,
  getNewUnlockToast,
  getNextBuyMode,
  getQuickBuyOption,
  getSidebarAvailability,
  getTotalCashPerSecond,
} from './ui/viewModel'

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
    <div
      className={`adcap-screen theme-${world.id} min-h-screen text-[#241d17]`}
    >
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
          <CapitalHeader
            angels={worldState.angels}
            buyMode={buyMode}
            cash={worldState.cash}
            onBuyManager={actions.buyManager}
            onBuyUpgrade={actions.buyUpgrade}
            onCycleBuyMode={cycleBuyMode}
            playerPortrait={playerPortraits[world.id].image}
            playerPortraitMirrored={playerPortraits[world.id].mirrored}
            quickBuyOption={quickBuyOption}
            totalCashPerSecond={totalCashPerSecond}
            world={world}
          />

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
        <PanelModal onClose={closePanel} panel={panel} world={world}>
          <GamePanelContent
            angelBonusPercent={angelBonusPercent}
            claimableAngels={claimableAngels}
            gameState={state}
            onBuyManager={actions.buyManager}
            onBuyUpgrade={actions.buyUpgrade}
            onHardReset={actions.hardReset}
            onResetForAngels={actions.resetForAngels}
            onSave={saveNow}
            onSelectWorld={(worldId) => {
              actions.switchWorld(worldId)
              closePanel()
            }}
            onUnlockWorld={actions.unlockWorld}
            panel={panel}
            state={worldState}
            totalCashPerSecond={totalCashPerSecond}
            world={world}
          />
        </PanelModal>
      ) : null}
      {levelToast ? (
        <LevelToastView key={levelToast.key} toast={levelToast} />
      ) : null}
    </div>
  )
}

export default App
