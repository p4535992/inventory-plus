import type { ItemData } from '@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/data.mjs';

export class Category {
  label: string;
  dataset: { type: string };
  sortFlag: number;
  ignoreWeight: boolean;
  maxWeight: number;
  ownWeight: number;
  collapsed: boolean;
  items: ItemData[];
}

export enum InventoryPlusFlags {
  CATEGORYS = 'categorys',
  CATEGORY = 'category',
}

export class EncumbranceDnd5e {
  value: number;
  max: number;
  pct: number;
  encumbered?: boolean; //Vehicle not have this
}

export class EncumbranceData {
  totalWeight: number;
  totalWeightToDisplay: number;
  lightMax: number;
  mediumMax: number;
  heavyMax: number;
  encumbranceTier: number;
  speedDecrease: number;
  unit: string;
  encumbrance: EncumbranceDnd5e;
}

export class EncumbranceBulkData extends EncumbranceData {
  inventorySlot: number;
  minimumBulk: number;
}
