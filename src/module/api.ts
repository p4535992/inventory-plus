import type { ItemData } from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/module.mjs";
import CONSTANTS from "./constants";
import { Category, InventoryPlusFlags } from "./inventory-plus-models";
import { debug, warn } from "./lib/lib";

const API = {

  calculateWeightFromActor(actorIdOrName:string): number{
    const actorEntity = game.actors?.get(actorIdOrName) || game.actors?.getName(actorIdOrName);
    if(!actorEntity){
      warn(`No actor found for id '${actorIdOrName}'`, true);
      return 0;
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
        const appliedWeight = itemQuantity * itemWeight;
        return weight + appliedWeight;
      }
    }, 0);

    // [Optional] add Currency Weight (for non-transformed actors)
    //@ts-ignore
    if (game.settings.get('dnd5e', 'currencyWeight') && actorEntity.data.data.currency) {
      //@ts-ignore
      const currency = actorEntity.data.data.currency;
      const numCoins = <number>(
        Object.values(currency).reduce((val: any, denom: any) => (val += Math.max(denom, 0)), 0)
      );

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
    totalWeight = totalWeight.toNearest(0.1);

    return totalWeight;
  },


  calculateWeight(inventory: Category[], currency: number): number {
    let customWeight = 0;
    for (const id in inventory) {
      const section = <Category>inventory[id];
      if(!section){
        warn(`Can't find the section with id '${id}'`, true);
        continue;
      }
      if (section.ignoreWeight !== true) {
        for (const i of <ItemData[]>section.items) {
          debug(i);
          //@ts-ignore
          customWeight += i.totalWeight;
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
  }

};

export default API;
