import type { ItemData } from '@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/data.mjs';
import { getApi, setApi } from '../main';
import API from './api';
import CONSTANTS from './constants';
import { InventoryPlus } from './inventory-plus';
import { InventoryPlusFlags } from './inventory-plus-models';
import { getCSSName, warn } from './lib/lib';

export const initHooks = async (): Promise<void> => {
  // registerSettings();
  // registerLibwrappers();
  // Hooks.once('socketlib.ready', registerSocket);
  // if (game.settings.get(CONSTANTS.MODULE_NAME, 'debugHooks')) {
  //   for (const hook of Object.values(HOOKS)) {
  //     if (typeof hook === 'string') {
  //       Hooks.on(hook, (...args) => debug(`Hook called: ${hook}`, ...args));
  //       debug(`Registered hook: ${hook}`);
  //     } else {
  //       for (const innerHook of Object.values(hook)) {
  //         Hooks.on(<string>innerHook, (...args) => debug(`Hook called: ${innerHook}`, ...args));
  //         debug(`Registered hook: ${innerHook}`);
  //       }
  //     }
  //   }
  // }
};

export const setupHooks = async (): Promise<void> => {
  setApi(API);
};

export const readyHooks = async (): Promise<void> => {
  // checkSystem();
  // registerHotkeys();
  // Hooks.callAll(HOOKS.READY);

  // Add any additional hooks if necessary
  // InventoryPlus.replaceGetData();
  // InventoryPlus.replaceOnDropItem();

  //@ts-ignore
  libWrapper.register(
    CONSTANTS.MODULE_NAME,
    'game.dnd5e.applications.ActorSheet5eCharacter.prototype.getData',
    function (wrapper, ...args) {
      const sheetData = wrapper(...args);

      // let app = this;
      const actor = <Actor>this.actor;
      const newInventory = InventoryPlus.processInventory(this, actor, sheetData.inventory);
      sheetData.inventory = newInventory;

      sheetData.data.attributes.encumbrance.value = API.calculateWeight(
        sheetData.inventory,
        //@ts-ignore
        actor.data.data.currency,
      );
      sheetData.data.attributes.encumbrance.pct =
        (sheetData.data.attributes.encumbrance.value / sheetData.data.attributes.encumbrance.max) * 100;

      return sheetData;
    },
    'WRAPPER',
  );

  //@ts-ignore
  libWrapper.register(
    CONSTANTS.MODULE_NAME,
    'game.dnd5e.applications.ActorSheet5eCharacter.prototype._onDropItem',
    async function (wrapped, ...args) {
      const [event, data] = args;
      const actor = <Actor>this.actor;
      const itemTypeCurrent = data?.type || event.type;
      if (itemTypeCurrent != 'Item') {
        warn(`Type is not 'Item'`);
        return;
      }

      const itemId = data?.data?._id || data?.id; // || event.id || event.data?._id;
      if (!itemId) {
        warn(`No id founded for the item`);
        return;
      }

      const itemCurrent: Item = game.items?.get(itemId) || <Item>actor.items.get(itemId) || undefined;
      if (!itemCurrent) {
        warn(`No itemCurrent founded for the item`);
        return;
      }

      const itemData: ItemData = itemCurrent?.data;
      if (!itemData) {
        warn(`No itemdata founded for the item`);
        return;
      }

      // Yea i hate my life
      const actorId = data.actorId;
      let createdItem:Item|undefined = undefined;


      // dropping item outside inventory list, but ignore if already owned item
      const targetLi = <HTMLLIElement>$(event.target).parents('li')[0];
      let targetType = '';
      const targetCss = getCSSName('sub-header');
      if (targetLi && targetLi.className) {
        if (targetLi.className.trim().indexOf(<string>targetCss) !== -1) {
          targetType = <string>$(targetLi).find('.item-control')[0]?.dataset.type;
        } else if (targetLi.className.trim().indexOf('item') !== -1) {
          const itemId = <string>targetLi.dataset.itemId;
          const item = <Item>this.object.items.get(itemId);
          targetType = this.inventoryPlus.getItemType(item.data);
        }
      }else{
        warn(`No target li html founded`, true);
        // return;
      }

      // dropping new item
      if (actorId !== this.object.id || itemData === undefined) {
        if (!actor.items.get(<string>itemId)) {
          // START WEIGHT CONTROL
          // changing item list
          const itemType = this.inventoryPlus.getItemType(itemData); // data.data
          if (itemType !== targetType) {
            const categoryWeight = this.inventoryPlus.getCategoryItemWeight(targetType);
            //@ts-ignore
            const itemWeight = itemData.data.weight * itemData.data.quantity;
            const maxWeight = Number(
              this.inventoryPlus.customCategorys[targetType].maxWeight
                ? this.inventoryPlus.customCategorys[targetType].maxWeight
                : 0,
            );

            if (isNaN(maxWeight) || maxWeight <= 0 || maxWeight >= categoryWeight + itemWeight) {
              // do nothing
            } else {
              warn(`Item exceeds categories max weight`, true);
              return;
            }
          }
          // END WEIGHT CONTROL
          const items:Item[] = await this._onDropItemCreate(itemData);
          createdItem = items[0];
        }
      }

      if (targetLi === undefined || targetLi.className === undefined) {
        if (actorId === this.object.id) {
          // Do nothing
          //return;
        } else {
          if (!actor.items.get(<string>itemId)) {
            // START WEIGHT CONTROL
            // changing item list
            const itemType = this.inventoryPlus.getItemType(itemData); // data.data
            if (itemType !== targetType) {
              const categoryWeight = this.inventoryPlus.getCategoryItemWeight(targetType);
              //@ts-ignore
              const itemWeight = itemData.data.weight * itemData.data.quantity;
              const maxWeight = Number(
                this.inventoryPlus.customCategorys[targetType].maxWeight
                  ? this.inventoryPlus.customCategorys[targetType].maxWeight
                  : 0,
              );

              if (isNaN(maxWeight) || maxWeight <= 0 || maxWeight >= categoryWeight + itemWeight) {
                // do nothing
              } else {
                warn(`Item exceeds categories max weight`, true);
                return;
              }
            }
            // END WEIGHT CONTROL
            const items:Item[] = await this._onDropItemCreate(itemData);
            createdItem = items[0];
          }
        }
      }

      // const targetLi = <HTMLLIElement>$(event.target).parents('li')[0];
      // doing actual stuff!!!
      // const itemId = itemData._id;
      let dropedItem = <Item>this.object.items.get(itemId);
      if (!dropedItem) {
        if(createdItem){
          dropedItem = createdItem;
        }else{
          warn(`No dropedItem founded for the item`);
          return;
        }
      }

      // changing item list
      let itemType = this.inventoryPlus.getItemType(itemData); // data.data
      if (itemType !== targetType) {
        const categoryWeight = this.inventoryPlus.getCategoryItemWeight(targetType);
        //@ts-ignore
        const itemWeight = dropedItem.data.data.weight * dropedItem.data.data.quantity;
        const maxWeight = Number(
          this.inventoryPlus.customCategorys[targetType].maxWeight
            ? this.inventoryPlus.customCategorys[targetType].maxWeight
            : 0,
        );

        if (isNaN(maxWeight) || maxWeight <= 0 || maxWeight >= categoryWeight + itemWeight) {
          // await dropedItem.update({ 'flags.inventory-plus.category': targetType });
          await dropedItem.setFlag(CONSTANTS.MODULE_NAME, InventoryPlusFlags.CATEGORY, targetType);
          itemType = targetType;
        } else {
          warn(`Item exceeds categories max weight`, true);
          return;
        }
      }

      // reordering items

      // Get the drag source and its siblings
      const source = dropedItem;
      const siblings = <Item[]>this.object.items.filter((i: Item) => {
        const type = <string>this.inventoryPlus.getItemType(i.data);
        return type === itemType && i.data._id !== source.data._id;
      });
      // Get the drop target
      const dropTarget = event.target.closest('.item');
      const targetId: string | null = dropTarget ? <string>dropTarget.dataset.itemId : null;
      const target = <Item>siblings.find((s) => s.data._id === targetId);

      // Perform the sort
      const sortUpdates = SortingHelpers.performIntegerSort(dropedItem, { target: target, siblings });
      let updateData:any[] = sortUpdates.map((u) => {
        const update: any = u.update;
        update._id = u.target.data._id;
        return update;
      });

      updateData = updateData.filter((i) =>{
        return i._id != null && i._id != undefined && i._id != ''; 
      });

      // Perform the update
      this.object.updateEmbeddedDocuments('Item', updateData);
    },
    'MIXED', //'OVERRIDE',
  );

  // Hooks.on(`renderActorSheet5eCharacter`, (app, html, data) => {
  Hooks.on(`renderActorSheet`, (app, html, data) => {
    // app.inventoryPlus.addInventoryFunctions(html);
    module.renderActorSheet5eCharacter(app, html, data);
  });
};

const module = {
  async renderActorSheet5eCharacter(...args) {
    const [app, html, data] = args;
    if (!app.inventoryPlus) {
      const actorEntityTmp: any = <Actor>game.actors?.get(data.actor._id);
      app.inventoryPlus = new InventoryPlus();
      app.inventoryPlus.init(actorEntityTmp);
    }
    app.inventoryPlus.addInventoryFunctions(html);
  },
};
