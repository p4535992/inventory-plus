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
  DISABLE_DEFAULT_CATEGORIES = 'disableDefaultCategories'
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


// "DND5E.ItemTypeClass": "Class",
// "DND5E.ItemTypeClassPl": "Class Levels",
// "DND5E.ItemTypeConsumable": "Consumable",
// "DND5E.ItemTypeConsumablePl": "Consumables",
// "DND5E.ItemTypeContainer": "Container",
// "DND5E.ItemTypeBackground": "Background",
// "DND5E.ItemTypeBackgroundPl": "Backgrounds",
// "DND5E.ItemTypeBackpack": "Container",
// "DND5E.ItemTypeContainerPl": "Containers",
// "DND5E.ItemTypeEquipment": "Equipment",
// "DND5E.ItemTypeEquipmentPl": "Equipment",
// "DND5E.ItemTypeFeat": "Feature",
// "DND5E.ItemTypeLoot": "Loot",
// "DND5E.ItemTypeLootPl": "Loot",
// "DND5E.ItemTypeTool": "Tool",
// "DND5E.ItemTypeToolPl": "Tools",
// "DND5E.ItemTypeSpell": "Spell",
// "DND5E.ItemTypeSpellPl": "Spells",
// "DND5E.ItemTypeSubclass": "Subclass",
// "DND5E.ItemTypeSubclassPl": "Subclasses",
// "DND5E.ItemTypeWeapon": "Weapon",
// "DND5E.ItemTypeWeaponPl": "Weapons",

export const inventoryPlusItemType = [
  {id:'', name:'None', namePl:'None', img:'', isSelected: false},
  {id:'weapon', name:'DND5E.ItemTypeWeapon', namePl:'DND5E.ItemTypeWeaponPl', img:'', isSelected: false},
  {id:'equipment', name:'DND5E.ItemTypeEquipment', namePl:'DND5E.ItemTypeEquipmentPl', img:'', isSelected: false},
  {id:'consumable', name:'DND5E.ItemTypeConsumable', namePl:'DND5E.ItemTypeConsumablePl', img:'', isSelected: false},
  {id:'tool', name:'DND5E.ItemTypeTool', namePl:'DND5E.ItemTypeToolPl', img:'', isSelected: false},
  {id:'loot', name:'DND5E.ItemTypeLoot', namePl:'DND5E.ItemTypeLootPl', img:'', isSelected: false},
  {id:'background', name:'DND5E.ItemTypeBackground', namePl:'DND5E.ItemTypeBackgroundPl', img:'', isSelected: false},
  {id:'class', name:'DND5E.ItemTypeClass', namePl:'DND5E.ItemTypeClassPl', img:'', isSelected: false},
  {id:'subclass', name:'DND5E.ItemTypeSubclass', namePl:'DND5E.ItemTypeSubclassPl', img:'', isSelected: false},
  {id:'spell', name:'DND5E.ItemTypeSpell', namePl:'DND5E.ItemTypeSpellPl', img:'', isSelected: false},
  {id:'feat', name:'DND5E.ItemTypeFeat', namePl:'DND5E.ItemTypeFeatPl', img:'', isSelected: false},
  {id:'backpack', name:'DND5E.ItemTypeContainer', namePl:'DND5E.ItemTypeContainerPl', img:'', isSelected: false},
  {id:'set', name:'Armor set', namePl:'Armor set', img:'', isSelected: false},
]
