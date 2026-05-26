import { BadgeDollarSign, Menu, X } from 'lucide-react'
import { useEffect, useState, type ReactNode } from 'react'
import type { WorldDefinition } from '../game/types'
import { getPanelHelp, getPanelKicker, panelMeta, panelTabs } from './viewModel'
import type { LevelToast, Panel } from './types'

export const StartupLoader = ({ image }: { image: string }) => (
  <div
    aria-label="Loading Silicon Valley"
    className="startup-loader"
    role="status"
  >
    <img
      alt=""
      className="startup-loader-image"
      draggable={false}
      src={image}
    />
    <svg
      aria-hidden="true"
      className="startup-loader-title"
      preserveAspectRatio="xMidYMid meet"
      viewBox="0 0 900 260"
    >
      <path d="M 120 160 Q 450 62 780 160" fill="none" id="startup-title-arc" />
      <text>
        <textPath
          href="#startup-title-arc"
          startOffset="50%"
          textAnchor="middle"
        >
          SF Capitalist
        </textPath>
      </text>
    </svg>
  </div>
)

export const LevelToastView = ({ toast }: { toast: LevelToast }) => (
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

export const Sidebar = ({
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
        <div className="ribbon">SF Capitalist</div>
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
        <span>Stats</span>
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
  world: WorldDefinition
  onClose: () => void
}

export const PanelModal = ({
  panel,
  children,
  world,
  onClose,
}: PanelModalProps) => {
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
            {getPanelHelp(panel, world)}
          </div>
        ) : null}

        <div className="modal-content">
          <p className="modal-kicker">{getPanelKicker(panel, world)}</p>
          <div className="modal-divider" />
          <div className="modal-scroll">{children}</div>
        </div>
      </section>
    </div>
  )
}
