import type { LucideIcon } from 'lucide-react'
import type { BusinessId } from '../game/types'

export type Panel = 'managers' | 'upgrades' | 'angels' | 'unlocks' | 'travel' | 'stats'

export type LevelToast = {
  key: number
  title: string
  detail: string
  image: string
}

export type PanelTab = {
  id: Panel
  label: string
  icon: LucideIcon
}

export type QuickBuyOption =
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
