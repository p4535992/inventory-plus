
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
  CATEGORY = 'category'
}
