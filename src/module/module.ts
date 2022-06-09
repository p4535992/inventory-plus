import type { ItemData } from '@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/data.mjs';
import { getApi, setApi } from '../main';
import API from './api';
import CONSTANTS from './constants';
import { InventoryPlus } from './inventory-plus';
import { InventoryPlusFlags } from './inventory-plus-models';
import {
  getCSSName,
  i18n,
  warn,
  i18nFormat,
  retrieveItemFromData,
  checkCompatible,
  showCurrencyTransferDialog,
  isAlt,
  showItemTransferDialog,
} from './lib/lib';

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
      const itemTypeCurrent = data?.type; // || event.type;

      if (itemTypeCurrent != 'Item') {
        warn(i18n(`${CONSTANTS.MODULE_NAME}.dialogs.warn.itemtypecurrent`));
        return;
      }

      const itemId = data?.data?._id || data?.id; // || event.id || event.data?._id;
      if (!itemId) {
        warn(i18n(`${CONSTANTS.MODULE_NAME}.dialogs.warn.itemid`));
        return;
      }

      const itemCurrent = await retrieveItemFromData(actor, itemId, '', data.pack, data.actorId);
      if (!itemCurrent) {
        warn(i18n(`${CONSTANTS.MODULE_NAME}.dialogs.warn.itemcurrent`));
        return;
      }

      const itemData: ItemData = itemCurrent?.data;
      if (!itemData) {
        warn(i18n(`${CONSTANTS.MODULE_NAME}.dialogs.warn.itemdata`));
        return;
      }

      // Yea i hate my life
      const actorId = data.actorId;
      let createdItem: Item | undefined = undefined;

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
      }

      if (!targetType) {
        // No type founded use standard system

        if (!this.actor.isOwner) return false;
        const item = <Item>await Item.fromDropData(data);
        const itemData = item.toObject();

        // Handle item sorting within the same Actor
        if (await this._isFromSameActor(data)) return this._onSortItem(event, itemData);

        // Create the owned item
        return this._onDropItemCreate(itemData);
      }

      if (targetType == 'feat' || targetType == 'spell' || targetType == 'class') {
        if (!this.actor.isOwner) return false;
        const item = <Item>await Item.fromDropData(data);
        const itemData = item.toObject();

        // Handle item sorting within the same Actor
        if (await this._isFromSameActor(data)) return this._onSortItem(event, itemData);

        // Create the owned item
        return this._onDropItemCreate(itemData);
      }

      if (!targetLi) {
        warn(i18n(`${CONSTANTS.MODULE_NAME}.dialogs.warn.notargethtml`), true);

        if (!this.actor.isOwner) return false;
        const item = <Item>await Item.fromDropData(data);
        const itemData = item.toObject();

        // Handle item sorting within the same Actor
        if (await this._isFromSameActor(data)) return this._onSortItem(event, itemData);

        // Create the owned item
        return this._onDropItemCreate(itemData);
      }

      if (!targetType || !this.inventoryPlus.customCategorys[targetType]) {
        warn(i18nFormat(`${CONSTANTS.MODULE_NAME}.dialogs.warn.nocategoryfounded`, { targetType: targetType }), true);

        if (!this.actor.isOwner) return false;
        const item = <Item>await Item.fromDropData(data);
        const itemData = item.toObject();

        // Handle item sorting within the same Actor
        if (await this._isFromSameActor(data)) return this._onSortItem(event, itemData);

        // Create the owned item
        return this._onDropItemCreate(itemData);
      }

      const categoryName = <string>i18n(this.inventoryPlus.customCategorys[targetType].label);
      // const headerElement = $(<HTMLElement>targetLi.parentElement?.parentElement).find(`h3:contains("${categoryName}")`);

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
              warn(
                i18nFormat(`${CONSTANTS.MODULE_NAME}.dialogs.warn.exceedsmaxweight`, { categoryName: categoryName }),
                true,
              );
              return;
            }
          }
          // END WEIGHT CONTROL
          if (!this.actor.isOwner) return false;
          // const item = <Item>await Item.fromDropData(data);
          // const itemData = item.toObject();

          // Handle item sorting within the same Actor
          if (await this._isFromSameActor(data)) {
            // return this._onSortItem(event, itemData);
          } else {
            // Create the owned item
            const items: Item[] = await this._onDropItemCreate(itemData);
            createdItem = items[0];
          }
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
                warn(
                  i18nFormat(`${CONSTANTS.MODULE_NAME}.dialogs.warn.exceedsmaxweight`, { categoryName: categoryName }),
                  true,
                );
                return;
              }
            }
            // END WEIGHT CONTROL
            if (!this.actor.isOwner) return false;
            // const item = <Item>await Item.fromDropData(data);
            // const itemData = item.toObject();

            // Handle item sorting within the same Actor
            if (await this._isFromSameActor(data)) {
              // return this._onSortItem(event, itemData);
            } else {
              // Create the owned item
              const items: Item[] = await this._onDropItemCreate(itemData);
              createdItem = items[0];
            }
          }
        }
      }

      // const targetLi = <HTMLLIElement>$(event.target).parents('li')[0];
      // doing actual stuff!!!
      // const itemId = itemData._id;
      let dropedItem = <Item>this.object.items.get(itemId);
      if (!dropedItem) {
        if (createdItem) {
          dropedItem = createdItem;
        } else {
          warn(i18n(`${CONSTANTS.MODULE_NAME}.dialogs.warn.nodroppeditem`));
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
          warn(
            i18nFormat(`${CONSTANTS.MODULE_NAME}.dialogs.warn.exceedsmaxweight`, { categoryName: categoryName }),
            true,
          );
          return;
        }
      }

      // reordering items

      // Get the drag source and its siblings
      // const source = dropedItem;
      const siblings = <Item[]>this.object.items.filter((i: Item) => {
        const type = <string>this.inventoryPlus.getItemType(i.data);
        return type === itemType && i.data._id !== dropedItem.data._id;
      });
      // Get the drop target
      const dropTarget = event.target.closest('.item');
      const targetId: string | null = dropTarget ? <string>dropTarget.dataset.itemId : null;
      const target = <Item>siblings.find((s) => s.data._id === targetId);

      // Perform the sort
      const sortUpdates = SortingHelpers.performIntegerSort(dropedItem, { target: target, siblings });
      let updateData: any[] = sortUpdates.map((u) => {
        const update: any = u.update;
        update._id = u.target.data._id;
        return update;
      });

      updateData = updateData.filter((i) => {
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
  Hooks.on('dropActorSheetData', (targetActor, targetSheet, futureItem) => {
    module.dropActorSheetData(targetActor, targetSheet, futureItem);
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
  dropActorSheetData(targetActor, targetSheet, futureItem) {
    if (isAlt()) {
      return; // ignore when Alt is pressed to drop.
    }

    if (targetActor.permission != 3) {
      ui.notifications.error("TransferStuff | You don't have the permissions to transfer items here");
      return;
    }

    if (futureItem.type == 'Item' && futureItem.actorId) {
      if (!targetActor.data._id) {
        warn('target has no data._id?', targetActor);
        return;
      }
      if (targetActor.data._id == futureItem.actorId) {
        return; // ignore dropping on self
      }
      let sourceSheet: any;
      if (futureItem.tokenId != null) {
        //game.scenes.get("hyfUtn3VVPnVUpJe").tokens.get("OYwRVJ7crDyid19t").sheet.actor.items
        sourceSheet = game.scenes?.get(futureItem.sceneId)!.tokens.get(futureItem.tokenId)!.sheet;
      } else {
        sourceSheet = game.actors?.get(futureItem.actorId)!.sheet;
      }
      const sourceActor = game.actors?.get(futureItem.actorId);
      if (sourceActor) {
        /* if both source and target have the same type then allow deleting original item. this is a safety check because some game systems may allow dropping on targets that don't actually allow the GM or player to see the inventory, making the item inaccessible. */
        if (checkCompatible(sourceActor.data.type, targetActor.data.type, futureItem)) {
          const originalQuantity = futureItem.data.data.quantity;
          const targetActorId = targetActor.data._id;
          const sourceActorId = futureItem.actorId;
          if (
            game.settings.get(CONSTANTS.MODULE_NAME, 'enableCurrencyTransfer') &&
            futureItem.data.name === 'Currency'
          ) {
            showCurrencyTransferDialog(sourceSheet, targetSheet);
            return false;
          } else if (game.settings.get(CONSTANTS.MODULE_NAME, 'enableItemTransfer') && originalQuantity >= 1) {
            showItemTransferDialog(originalQuantity, sourceSheet, targetSheet, futureItem.data._id, futureItem);
            return false;
          }
        }
      }
    }
  },
};
