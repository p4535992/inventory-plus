import type { ItemData } from '@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/module.mjs';
import CONSTANTS from './constants';
import type { InventoryPlus } from './inventory-plus';
import { Category, EncumbranceData, EncumbranceDnd5e, InventoryPlusFlags } from './inventory-plus-models';
import { debug, is_real_number, warn } from './lib/lib';

const API = {
  inventoryPlus: <InventoryPlus>{},

  calculateWeightFromActorId(actorIdOrName: string): EncumbranceDnd5e | undefined {
    const actorEntity = game.actors?.get(actorIdOrName) || game.actors?.getName(actorIdOrName);
    if (!actorEntity) {
      warn(`No actor found for id '${actorIdOrName}'`, true);
      return undefined;
    }
    return this.calculateWeightFromActor(actorEntity);
  },

  calculateWeightFromActor(actorEntity: Actor): EncumbranceDnd5e | undefined {
    if (!actorEntity) {
      warn(`No actor is passed`, true);
      return undefined;
    }
    // Integration with Variant Encumbrance
    if (
      game.modules.get('variant-encumbrance-dnd5e')?.active &&
      game.settings.get(CONSTANTS.MODULE_NAME, 'enableIntegrationWithVariantEncumbrance')
    ) {
      const encumbranceData = <
        EncumbranceData //@ts-ignore
      >game.modules.get('variant-encumbrance-dnd5e')?.api.calculateWeightOnActor(actorEntity);
      const encumbrane5e = encumbranceData.encumbrance;
      return encumbrane5e;
    }

    const inventoryItems: Item[] = [];
    // const isAlreadyInActor = <Item>actorEntity.items?.find((itemTmp: Item) => itemTmp.id === currentItemId);
    const physicalItems = ['weapon', 'equipment', 'consumable', 'tool', 'backpack', 'loot'];
    actorEntity.data.items.contents.forEach((im: Item) => {
      if (im && physicalItems.includes(im.type)) {
        inventoryItems.push(im);
      }
    });
    // if (!isAlreadyInActor) {
    //   const im = <Item>game.items?.find((itemTmp: Item) => itemTmp.id === currentItemId);
    //   if (im && physicalItems.includes(im.type)) {
    //     inventoryItems.push(im);
    //   }
    // }

    const invPlusCategoriesWeightToAdd = new Map<string, number>();
    let totalWeight = <number>inventoryItems.reduce((weight, item) => {
      if (!physicalItems.includes(item.type)) {
        return weight;
      }

      const itemQuantity =
        //@ts-ignore
        (item.data.quantity && item.data.quantity != item.data.data?.quantity
          ? //@ts-ignore
            item.data.quantity
          : //@ts-ignore
            item.data.data?.quantity) || 0;

      let itemWeight =
        //@ts-ignore
        (item.data.weight && item.data.weight != item.data.data?.weight
          ? //@ts-ignore
            item.data.weight
          : //@ts-ignore
            item.data.data?.weight) || 0;

      // let ignoreEquipmentCheck = false;

      // Retrieve flag 'categorys' from inventory plus module
      const inventoryPlusCategories = <any[]>actorEntity.getFlag(CONSTANTS.MODULE_NAME, InventoryPlusFlags.CATEGORYS);
      if (inventoryPlusCategories) {
        // "weapon", "equipment", "consumable", "tool", "backpack", "loot"
        let actorHasCustomCategories = false;
        for (const categoryId in inventoryPlusCategories) {
          if (
            // This is a error from the inventory plus developer flags stay on 'item.data' not on the 'item'
            //@ts-ignore
            (item.flags &&
              //@ts-ignore
              item.flags[CONSTANTS.MODULE_NAME]?.category === categoryId) ||
            (item.data?.flags &&
              //@ts-ignore
              item.data?.flags[CONSTANTS.MODULE_NAME]?.category === categoryId) ||
            //@ts-ignore
            (item.data?.data?.flags &&
              //@ts-ignore
              item.data?.data?.flags[CONSTANTS.MODULE_NAME]?.category === categoryId)
          ) {
            const section = inventoryPlusCategories[categoryId];
            // Ignore weight
            if (section?.ignoreWeight == true) {
              itemWeight = 0;
              // ignoreEquipmentCheck = true;
            }
            // Inherent weight
            if (Number(section?.ownWeight) > 0) {
              if (!invPlusCategoriesWeightToAdd.has(categoryId)) {
                // invPlusCategoriesWeightToAdd.set(categoryId, Number(section.ownWeight));
                itemWeight = Number(section.ownWeight);
              }
            }
            // EXIT FOR
            actorHasCustomCategories = true;
            break;
          }
        }
        if (!actorHasCustomCategories) {
          for (const categoryId in inventoryPlusCategories) {
            if (item.type === categoryId) {
              const section = inventoryPlusCategories[categoryId];
              // Ignore weight
              if (section?.ignoreWeight == true) {
                itemWeight = 0;
                // ignoreEquipmentCheck = true;
              }
              // Inherent weight
              if (Number(section?.ownWeight) > 0) {
                if (!invPlusCategoriesWeightToAdd.has(categoryId)) {
                  // invPlusCategoriesWeightToAdd.set(categoryId, Number(section.ownWeight));
                  itemWeight = Number(section.ownWeight);
                }
              }
              // EXIT FOR
              break;
            }
          }
        }
        let eqpMultiplyer = 1;
        if (game.settings.get(CONSTANTS.MODULE_NAME, 'enableEquipmentMultiplier')) {
          eqpMultiplyer = <number>game.settings.get(CONSTANTS.MODULE_NAME, 'equipmentMultiplier') || 1;
        }
        //@ts-ignore
        const e = <number>item.data.data.equipped ? eqpMultiplyer : 1;

        const appliedWeight = itemQuantity * itemWeight * e;
        return weight + appliedWeight;
      }
    }, 0);

    // [Optional] add Currency Weight (for non-transformed actors)
    //@ts-ignore
    if (game.settings.get('dnd5e', 'currencyWeight') && actorEntity.data.data.currency) {
      //@ts-ignore
      const currency = actorEntity.data.data.currency;
      const numCoins = <number>Object.values(currency).reduce((val: any, denom: any) => (val += Math.max(denom, 0)), 0);

      let currencyPerWeight = 0;
      if (game.settings.get('dnd5e', 'metricWeightUnits')) {
        //@ts-ignore
        currencyPerWeight = CONFIG.DND5E.encumbrance.currencyPerWeight.metric;
      } else {
        //@ts-ignore
        currencyPerWeight = CONFIG.DND5E.encumbrance.currencyPerWeight.imperial;
      }

      totalWeight += numCoins / currencyPerWeight;
    }

    // Compute Encumbrance percentage
    const pct =
      //@ts-ignore
      (actorEntity.data.data.attributes.encumbrance.value / actorEntity.data.data.attributes.encumbrance.max) * 100;

    //@ts-ignore
    return ((<EncumbranceDnd5e>actorEntity.data.data.attributes.encumbrance) = {
      value: totalWeight && is_real_number(totalWeight) ? totalWeight.toNearest(0.1) : 0,
      //@ts-ignore
      max: actorEntity.data.data.attributes.encumbrance.max,
      pct: pct,
      encumbered: pct > 200 / 3,
    });
  },

  calculateWeight(inventory: Category[], currency: number): number {
    let customWeight = 0;
    for (const id in inventory) {
      const section = <Category>inventory[id];
      if (!section) {
        warn(`Can't find the section with id '${id}'`, true);
        continue;
      }
      if (section.ignoreWeight !== true) {
        for (const i of <ItemData[]>section.items) {
          debug(i);
          let eqpMultiplyer = 1;
          if (game.settings.get(CONSTANTS.MODULE_NAME, 'enableEquipmentMultiplier')) {
            eqpMultiplyer = <number>game.settings.get(CONSTANTS.MODULE_NAME, 'equipmentMultiplier') || 1;
          }
          //@ts-ignore
          const e = <number>i.data.equipped ? eqpMultiplyer : 1;
          //@ts-ignore
          customWeight += i.totalWeight * e;
        }
      }
      if (Number(section.ownWeight) > 0) {
        customWeight += Number(section.ownWeight);
      }
    }

    let coinWeight = 0;
    if (game.settings.get('dnd5e', 'currencyWeight')) {
      const numCoins = <number>(
        Object.values(currency).reduce((val: number, denom: number) => (val += Math.max(denom, 0)), 0)
      );
      if (game.settings.get('dnd5e', 'metricWeightUnits')) {
        //@ts-ignore
        coinWeight = Math.round((numCoins * 10) / CONFIG.DND5E.encumbrance.currencyPerWeight.metric) / 10;
      } else {
        //@ts-ignore
        coinWeight = Math.round((numCoins * 10) / CONFIG.DND5E.encumbrance.currencyPerWeight.imperial) / 10;
      }
    }
    customWeight += coinWeight;

    customWeight = Number(customWeight.toFixed(2));

    return customWeight;
  },

  isCategoryFulled(actor: Actor, categoryType: string, itemData: ItemData): boolean {
    //@ts-ignore
    const inventoryPlus = actor.sheet?.inventoryPlus;
    const categoryWeight = inventoryPlus.getCategoryItemWeight(categoryType);
    //@ts-ignore
    const itemWeight = itemData.data.weight * itemData.data.quantity;
    const maxWeight = Number(
      inventoryPlus.customCategorys[categoryType].maxWeight ? inventoryPlus.customCategorys[categoryType].maxWeight : 0,
    );

    if (isNaN(maxWeight) || maxWeight <= 0 || maxWeight >= categoryWeight + itemWeight) {
      return false;
    } else {
      return true;
    }
  },

  isAcceptableType(categoryRef: Category, itemData: ItemData) {
    if (categoryRef.explicitTypes && categoryRef.explicitTypes.length > 0) {
      const acceptableTypes = categoryRef.explicitTypes.filter((i) => {
        return i.isSelected;
      });
      if (acceptableTypes && acceptableTypes.length == 0) {
        return true;
      }
      if (acceptableTypes && acceptableTypes.length == 1 && acceptableTypes[0]?.id == '') {
        return true;
      }
      let isOk = false;
      for (const acc of acceptableTypes) {
        if (acc.id === itemData.type) {
          isOk = true;
          break;
        }
      }
      return isOk;
    } else {
      return true;
    }
  },
};

export default API;
