export enum Vertical {
  FASHION = 'fashion',
  HOME = 'home',
  GENERAL = 'general',
}

export interface IdsDistribution {
  existingIds: string[];
  missingIds: string[];
}
