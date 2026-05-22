import {
  BadgeDollarSign,
  Building2,
  CheckCircle2,
  Cloud,
  Cpu,
  Factory,
  Gauge,
  HardDrive,
  Play,
  Save,
  Server,
  Sparkles,
  Trash2,
  Trophy,
  Users,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { useMemo, useState, type CSSProperties } from "react";
import {
  achievements,
  allBusinessUnlocks,
  angelUpgrades,
  businesses,
  businessUnlocks,
  cashUpgrades,
} from "./game/economy";
import {
  getAngelEffectiveness,
  getBusinessCashPerSecond,
  getBusinessDuration,
  getBusinessRevenue,
  getBuyQuantity,
  getClaimableAngels,
  getMaxAffordableQuantity,
  getNextAllUnlock,
  getNextUnlock,
  getPurchaseCost,
} from "./game/engine";
import { formatCompact, formatDuration, formatMoney, formatMultiplier } from "./game/format";
import type { BusinessDefinition, BusinessId, BuyMode, GameState, UpgradeDefinition } from "./game/types";
import { useGame } from "./game/useGame";

type Panel = "managers" | "upgrades" | "angels" | "unlocks" | "stats";

const businessIcons: Record<BusinessId, LucideIcon> = {
  "single-gpu-rig": Cpu,
  "render-rack": Server,
  "inference-cluster": Zap,
  "training-pod": Gauge,
  "colocation-hall": Building2,
  "asic-farm": HardDrive,
  "cloud-region": Cloud,
  "hyperscale-campus": Factory,
};

const panelTabs: Array<{ id: Panel; label: string; icon: LucideIcon }> = [
  { id: "stats", label: "Swag & Stats", icon: Gauge },
  { id: "unlocks", label: "Unlocks", icon: Trophy },
  { id: "upgrades", label: "Upgrades", icon: BadgeDollarSign },
  { id: "managers", label: "Managers", icon: Users },
  { id: "angels", label: "Investors", icon: Sparkles },
];

const buyModes: BuyMode[] = [1, 10, 100, "max"];

const getTotalCashPerSecond = (state: GameState) =>
  businesses.reduce((total, business) => {
    if (!state.managers[business.id]) {
      return total;
    }

    return total + getBusinessCashPerSecond(state, business);
  }, 0);

const App = () => {
  const { state, actions, offlineReport, saveNow } = useGame();
  const [buyMode, setBuyMode] = useState<BuyMode>(1);
  const [panel, setPanel] = useState<Panel>("upgrades");
  const claimableAngels = getClaimableAngels(state);
  const angelBonusPercent = state.angels * getAngelEffectiveness(state) * 100;
  const totalCashPerSecond = useMemo(() => getTotalCashPerSecond(state), [state]);
  const nextAllUnlock = getNextAllUnlock(state);
  const angelMultiplier = 1 + state.angels * getAngelEffectiveness(state);

  return (
    <div className="adcap-screen min-h-screen overflow-x-hidden text-[#241d17]">
      <div className="adcap-stage">
        <Sidebar panel={panel} setPanel={setPanel} />

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
              <div className="angel-badge">
                <Building2 className="h-8 w-8" />
                <strong>{formatMultiplier(angelMultiplier)}</strong>
              </div>
              <div className="buy-tag">
                <span>Buy</span>
                <strong>{buyMode === "max" ? "Max" : `x${buyMode}`}</strong>
              </div>
              <div className="buy-mode-cluster" aria-label="Buy quantity">
                {buyModes.map((mode) => (
                  <button
                    className={mode === buyMode ? "active" : ""}
                    key={mode}
                    onClick={() => setBuyMode(mode)}
                    type="button"
                  >
                    {mode === "max" ? "Max" : `x${mode}`}
                  </button>
                ))}
              </div>
            </div>
          </header>

          {offlineReport ? (
            <div className="offline-note">
              <div>
                <div className="text-lg font-black">Welcome back, boss.</div>
                <div className="text-sm font-bold">
                  {formatDuration(offlineReport.elapsedSeconds)} away earned {formatMoney(offlineReport.earnings)}.
                </div>
              </div>
              <button className="paper-button orange px-5 py-3" onClick={actions.dismissOfflineReport}>
                Collect
              </button>
            </div>
          ) : null}

          <div className="empire-note">
            <span>Next empire unlock</span>
            <strong>
              {nextAllUnlock
                ? `${nextAllUnlock.goal} of everything: ${nextAllUnlock.name}`
                : "All empire unlocks cleared"}
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

          <section className="drawer-card">
            <div className="drawer-title">
              {panelTabs.find((tab) => tab.id === panel)?.label}
            </div>
            <div className="drawer-body">
              {panel === "managers" ? (
                <ManagersPanel onBuy={actions.buyManager} state={state} />
              ) : null}
              {panel === "upgrades" ? (
                <UpgradesPanel onBuy={actions.buyUpgrade} state={state} upgrades={cashUpgrades} />
              ) : null}
              {panel === "angels" ? (
                <AngelsPanel
                  claimableAngels={claimableAngels}
                  onBuyUpgrade={actions.buyUpgrade}
                  onReset={actions.resetForAngels}
                  state={state}
                />
              ) : null}
              {panel === "unlocks" ? <UnlocksPanel state={state} /> : null}
              {panel === "stats" ? (
                <StatsPanel
                  angelBonusPercent={angelBonusPercent}
                  claimableAngels={claimableAngels}
                  onHardReset={actions.hardReset}
                  onSave={saveNow}
                  state={state}
                  totalCashPerSecond={totalCashPerSecond}
                />
              ) : null}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};

interface SidebarProps {
  panel: Panel;
  setPanel: (panel: Panel) => void;
}

const Sidebar = ({ panel, setPanel }: SidebarProps) => (
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
        const Icon = tab.icon;

        return (
          <button
            className={`paper-tab ${panel === tab.id ? "active" : ""}`}
            key={tab.id}
            onClick={() => setPanel(tab.id)}
            type="button"
          >
            <Icon className="h-5 w-5" />
            <span>{tab.label}</span>
          </button>
        );
      })}
    </nav>

    <button
      className={`shop-card ${panel === "stats" ? "active" : ""}`}
      onClick={() => setPanel("stats")}
      type="button"
    >
      <span>Shop</span>
      <BadgeDollarSign className="h-11 w-11" />
    </button>
  </aside>
);

const splitMoney = (value: number) => {
  const formatted = formatMoney(value);
  const [amount, ...scale] = formatted.split(" ");

  return {
    amount,
    scale: scale.join(" ").toUpperCase() || "CASH",
  };
};

const CashHeadline = ({ value }: { value: number }) => {
  const money = splitMoney(value);

  return (
    <div className="cash-headline">
      <strong>{money.amount}</strong>
      <span>{money.scale}</span>
    </div>
  );
};

const formatClock = (seconds: number): string => {
  const totalSeconds = Math.max(0, Math.ceil(seconds));
  const hours = Math.floor(totalSeconds / 3_600);
  const minutes = Math.floor((totalSeconds % 3_600) / 60);
  const secs = totalSeconds % 60;

  return [hours, minutes, secs].map((part) => String(part).padStart(2, "0")).join(":");
};

const getScaleLabel = (value: number) => {
  const [, ...scale] = formatCompact(value, 3).split(" ");

  return scale.join(" ").toUpperCase() || "CASH";
};

const getAmountLabel = (value: number) => formatCompact(value, 3).split(" ")[0];

interface BusinessRowProps {
  business: BusinessDefinition;
  buyMode: BuyMode;
  state: GameState;
  onBuy: (businessId: BusinessId, mode: BuyMode) => void;
  onStart: (businessId: BusinessId) => void;
}

const BusinessRow = ({ business, buyMode, state, onBuy, onStart }: BusinessRowProps) => {
  const businessState = state.businesses[business.id];
  const Icon = businessIcons[business.id];
  const quantity = getBuyQuantity(state, business, buyMode);
  const purchaseCost = getPurchaseCost(business, businessState.owned, quantity);
  const maxAffordable = getMaxAffordableQuantity(business, businessState.owned, state.cash);
  const canBuy = quantity > 0 && state.cash >= purchaseCost;
  const displayQuantity = buyMode === "max" ? maxAffordable : quantity;
  const displayCost =
    quantity > 0 ? purchaseCost : getPurchaseCost(business, businessState.owned, 1);
  const duration = getBusinessDuration(state, business);
  const revenue = getBusinessRevenue(state, business);
  const progressPercent = Math.min(100, (businessState.progress / duration) * 100);
  const automated = state.managers[business.id];
  const barPercent = businessState.running || automated ? progressPercent : businessState.owned > 0 ? 100 : 0;
  const canStart = businessState.owned > 0 && !businessState.running && !automated;
  const timeRemaining = businessState.running || automated ? duration - businessState.progress : 0;
  const nextUnlock = getNextUnlock(state, business.id);
  const revenueLabel = automated
    ? `${formatMoney(getBusinessCashPerSecond(state, business))} /sec`
    : `${formatMoney(revenue)} /run`;

  return (
    <article className="investment-card" style={{ "--business-accent": business.accent } as CSSProperties}>
      <div className="investment-icon-wrap">
        <div className="investment-icon">
          <Icon className="h-8 w-8" strokeWidth={3} />
        </div>
        <div className="owned-count">{formatCompact(businessState.owned, 0)}</div>
      </div>

      <div className="investment-control">
        <div className="investment-name-row">
          <h2>{business.shortName}</h2>
          {automated ? <span>Managed</span> : <span>{formatDuration(duration)}</span>}
        </div>
        <button
          className={`revenue-arrow ${canStart ? "ready" : ""}`}
          onClick={() => {
            if (canStart) {
              onStart(business.id);
            }
          }}
          title={canStart ? "Start production" : business.caption}
          type="button"
        >
          <span className="revenue-fill" style={{ width: `${barPercent}%` }} />
          <span className="revenue-text">{revenueLabel}</span>
          {canStart ? <Play className="revenue-play h-4 w-4" fill="currentColor" /> : null}
        </button>

        <div className="purchase-row">
          <button
            className="buy-block"
            disabled={!canBuy}
            onClick={() => onBuy(business.id, buyMode)}
            type="button"
          >
            <span>Buy {buyMode === "max" ? "Max" : `x${displayQuantity}`}</span>
            <strong>{getAmountLabel(displayCost)}</strong>
            <em>{getScaleLabel(displayCost)}</em>
          </button>
          <div className="time-block">{formatClock(timeRemaining)}</div>
        </div>

        <div className="unlock-hint">
          {nextUnlock
            ? `${nextUnlock.goal} owned unlocks ${formatMultiplier(nextUnlock.multiplier)} ${nextUnlock.kind}`
            : "All ownership unlocks cleared"}
        </div>
      </div>
    </article>
  );
};

interface ManagersPanelProps {
  state: GameState;
  onBuy: (businessId: BusinessId) => void;
}

const ManagersPanel = ({ state, onBuy }: ManagersPanelProps) => (
  <div className="space-y-2">
    {businesses.map((business) => {
      const hired = state.managers[business.id];
      const affordable = state.cash >= business.managerCost;

      return (
        <div className="shop-row" key={business.id}>
          <div className="min-w-0">
            <div className="font-black uppercase text-[#3a2208]">{business.managerName}</div>
            <div className="text-sm font-bold text-[#684114]">Runs {business.name}</div>
          </div>
          <button
            className="adcap-button green shrink-0 px-3 py-2 text-sm"
            disabled={hired || !affordable}
            onClick={() => onBuy(business.id)}
            type="button"
          >
            {hired ? "Hired" : formatMoney(business.managerCost)}
          </button>
        </div>
      );
    })}
  </div>
);

interface UpgradesPanelProps {
  state: GameState;
  upgrades: UpgradeDefinition[];
  onBuy: (upgradeId: string) => void;
}

const UpgradesPanel = ({ state, upgrades, onBuy }: UpgradesPanelProps) => {
  const sorted = [...upgrades].sort((a, b) => a.cost - b.cost);

  return (
    <div className="space-y-2">
      {sorted.map((upgrade) => {
        const owned =
          upgrade.currency === "cash"
            ? state.cashUpgrades.includes(upgrade.id)
            : state.angelUpgrades.includes(upgrade.id);
        const balance = upgrade.currency === "cash" ? state.cash : state.angels;
        const affordable = balance >= upgrade.cost;

        return (
          <div className="shop-row" key={upgrade.id}>
            <div className="min-w-0">
              <div className="font-black uppercase text-[#3a2208]">{upgrade.name}</div>
              <div className="text-sm font-bold text-[#684114]">{upgrade.description}</div>
            </div>
            <button
              className="adcap-button gold shrink-0 px-3 py-2 text-sm"
              disabled={owned || !affordable}
              onClick={() => onBuy(upgrade.id)}
              type="button"
            >
              {owned
                ? "Owned"
                : upgrade.currency === "cash"
                  ? formatMoney(upgrade.cost)
                  : `${formatCompact(upgrade.cost, 0)} angels`}
            </button>
          </div>
        );
      })}
    </div>
  );
};

interface AngelsPanelProps {
  state: GameState;
  claimableAngels: number;
  onReset: () => void;
  onBuyUpgrade: (upgradeId: string) => void;
}

const AngelsPanel = ({ state, claimableAngels, onReset, onBuyUpgrade }: AngelsPanelProps) => (
  <div className="space-y-3">
    <div className="angel-box">
      <div className="text-xs font-black uppercase text-[#fff1a6]">Angel investors waiting</div>
      <div className="text-3xl font-black text-white">{formatCompact(claimableAngels, 2)}</div>
      <div className="mt-1 text-sm font-bold text-[#ffe271]">
        Resetting keeps lifetime earnings and converts waiting investors into permanent angel balance.
      </div>
      <button
        className="adcap-button green mt-3 w-full px-4 py-3"
        disabled={claimableAngels <= 0}
        onClick={onReset}
        type="button"
      >
        Claim Angels
      </button>
    </div>

    <UpgradesPanel onBuy={onBuyUpgrade} state={state} upgrades={angelUpgrades} />
  </div>
);

const UnlocksPanel = ({ state }: { state: GameState }) => {
  const minimumOwned = Math.min(...businesses.map((business) => state.businesses[business.id].owned));

  return (
    <div className="space-y-3">
      <div>
        <div className="mb-2 text-xs font-black uppercase text-[#3a2208]">Empire unlocks</div>
        <div className="space-y-2">
          {allBusinessUnlocks.map((unlock) => {
            const complete = minimumOwned >= unlock.goal;

            return (
              <UnlockRow complete={complete} current={minimumOwned} key={unlock.id} unlock={unlock} />
            );
          })}
        </div>
      </div>
      <div>
        <div className="mb-2 text-xs font-black uppercase text-[#3a2208]">Business unlocks</div>
        <div className="space-y-2">
          {businesses.map((business) => {
            const nextUnlock = getNextUnlock(state, business.id);

            return nextUnlock ? (
              <UnlockRow
                complete={false}
                current={state.businesses[business.id].owned}
                key={business.id}
                unlock={nextUnlock}
              />
            ) : (
              <div className="shop-row" key={business.id}>
                <div className="font-black uppercase text-[#3a2208]">{business.shortName}</div>
                <CheckCircle2 className="h-5 w-5 text-[#2d7d38]" />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const UnlockRow = ({
  complete,
  current,
  unlock,
}: {
  complete: boolean;
  current: number;
  unlock: (typeof businessUnlocks)[number];
}) => (
  <div className={`shop-row ${complete ? "complete" : ""}`}>
    <div className="min-w-0">
      <div className="font-black uppercase text-[#3a2208]">{unlock.name}</div>
      <div className="text-sm font-bold text-[#684114]">
        {Math.min(current, unlock.goal)} / {unlock.goal} for {formatMultiplier(unlock.multiplier)} {unlock.kind}
      </div>
    </div>
    {complete ? <CheckCircle2 className="h-5 w-5 shrink-0 text-[#2d7d38]" /> : null}
  </div>
);

interface StatsPanelProps {
  state: GameState;
  totalCashPerSecond: number;
  claimableAngels: number;
  angelBonusPercent: number;
  onSave: () => void;
  onHardReset: () => void;
}

const StatsPanel = ({
  state,
  totalCashPerSecond,
  claimableAngels,
  angelBonusPercent,
  onSave,
  onHardReset,
}: StatsPanelProps) => {
  const unlockedAchievements = new Set(state.achievements);

  return (
    <div className="space-y-3">
      <div className="stats-grid">
        <StatTile label="Session" value={formatMoney(state.sessionEarnings)} />
        <StatTile label="Lifetime" value={formatMoney(state.lifetimeEarnings)} />
        <StatTile label="Cash/sec" value={formatMoney(totalCashPerSecond)} />
        <StatTile label="Prestiges" value={formatCompact(state.prestigeCount, 0)} />
        <StatTile label="Claimable" value={formatCompact(claimableAngels, 1)} />
        <StatTile label="Angel bonus" value={`${formatCompact(angelBonusPercent, 1)}%`} />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button className="adcap-button green flex items-center justify-center gap-2 px-3 py-3" onClick={onSave}>
          <Save className="h-4 w-4" />
          Save
        </button>
        <button className="adcap-button red flex items-center justify-center gap-2 px-3 py-3" onClick={onHardReset}>
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
            const unlocked = unlockedAchievements.has(achievement.id);

            return (
              <div className={`achievement-row ${unlocked ? "unlocked" : ""}`} key={achievement.id}>
                <div>
                  <div className="font-black uppercase">{achievement.name}</div>
                  <div className="text-sm font-bold">{achievement.description}</div>
                </div>
                {unlocked ? <CheckCircle2 className="h-5 w-5 shrink-0" /> : null}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const StatTile = ({ label, value }: { label: string; value: string }) => (
  <div className="stat-tile">
    <div>{label}</div>
    <strong>{value}</strong>
  </div>
);

export default App;
