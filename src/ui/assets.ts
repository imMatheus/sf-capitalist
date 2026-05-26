import jackMaImage from '../assets/portraits/jack-ma.png'
import jensenPlayerImage from '../assets/portraits/jensen-huang.png'
import ursulaPlayerImage from '../assets/portraits/ursula-von-der-leyen.png'
import chinaScoutImage from '../assets/scouts/china.png'
import europeScoutImage from '../assets/scouts/europe.png'
import siliconValleyScoutImage from '../assets/scouts/silicon-valley.png'
import welcomeImageAsset from '../assets/ui/welcome.png'
import chinaTravelImage from '../assets/worlds/china.png'
import europeTravelImage from '../assets/worlds/europe.png'
import siliconValleyTravelImage from '../assets/worlds/silicon-valley.png'
import { businessIconImages } from '../assets/businessIcons'
import quickUpgradeImageAsset from '../assets/businesses/quick-upgrade.png'
import type {
  BusinessDefinition,
  BusinessId,
  UnlockDefinition,
  UpgradeDefinition,
  WorldDefinition,
  WorldId,
} from '../game/types'

const businessImages: Record<string, string> = businessIconImages

export const quickUpgradeImage = quickUpgradeImageAsset
export const welcomeImage = welcomeImageAsset

export const travelImages: Record<WorldId, string> = {
  'silicon-valley': siliconValleyTravelImage,
  china: chinaTravelImage,
  europe: europeTravelImage,
}

export const playerPortraits: Record<WorldId, { image: string; mirrored?: boolean }> =
  {
    'silicon-valley': { image: jensenPlayerImage },
    // Swap only this entry when the China-specific portrait is ready.
    china: { image: jackMaImage },
    europe: { image: ursulaPlayerImage, mirrored: true },
  }

export const scoutImages: Record<WorldId, string> = {
  'silicon-valley': siliconValleyScoutImage,
  china: chinaScoutImage,
  europe: europeScoutImage,
}

export const getBusinessImage = (business: BusinessDefinition) =>
  businessImages[business.imageId ?? business.id] ?? quickUpgradeImage

export const getBusinessImageById = (
  world: WorldDefinition,
  businessId: BusinessId,
) => {
  const business = world.businesses.find((entry) => entry.id === businessId)

  return business ? getBusinessImage(business) : quickUpgradeImage
}

export const getUpgradeImage = (
  upgrade: UpgradeDefinition,
  world: WorldDefinition,
) => {
  if (upgrade.target === 'all') {
    return quickUpgradeImage
  }

  return getBusinessImageById(world, upgrade.target)
}

export const getUnlockImage = (
  unlock: UnlockDefinition,
  world: WorldDefinition,
) =>
  unlock.target === 'all'
    ? quickUpgradeImage
    : getBusinessImageById(world, unlock.target)
