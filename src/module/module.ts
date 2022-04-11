import { getApi, setApi } from '../main';
import API from './api';
import CONSTANTS from './constants';
import { InventoryPlus } from './inventory-plus';
import { InventoryPlusFlags } from './inventory-plus-models';
import { getCSSName } from './lib/lib';

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
      const actor = this.actor;
      const newInventory = InventoryPlus.processInventory(this, actor, sheetData.inventory);
      sheetData.inventory = newInventory;

      sheetData.data.attributes.encumbrance.value = API.calculateWeight(
        sheetData.inventory,
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
      // dropping new item
      if (data.actorId !== this.object.id || data.data === undefined) {
        //@ts-ignore
        const item = <Item>await Item.implementation.fromDropData(data);
        const itemData = item.toJSON();
        return this._onDropItemCreate(itemData);
      }

      // dropping item outside inventory list, but ignore if already owned item
      const targetLi = $(event.target).parents('li')[0];
      if (targetLi === undefined || targetLi.className === undefined) {
        if (data.actorId === this.object.id) {
          return;
        } else {
          //@ts-ignore
          const item = <Item>await Item.implementation.fromDropData(data);
          const itemData = item.toJSON();
          return this._onDropItemCreate(itemData);
          //return ActorSheet5eCharacter.prototype._onDropItem.bind(this)(event, data);
        }
      }

      // doing actual stuff!!!
      const id = data.data._id;
      const dropedItem = <Item>this.object.items.get(id);

      let targetType = '';
      const targetCss = getCSSName('sub-header');
      if (targetLi.className.trim().indexOf(<string>targetCss) !== -1) {
        targetType = <string>(($(targetLi).find('.item-control'))[0])?.dataset.type;
      } else if (targetLi.className.trim().indexOf('item') !== -1) {
        const itemId = targetLi.dataset.itemId;
        const item = this.object.items.get(itemId);
        targetType = this.inventoryPlus.getItemType(item.data);
      }

      // changing item list
      let itemType = this.inventoryPlus.getItemType(data.data);
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
          ui.notifications?.warn('Item exceeds categories max weight');
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
      const updateData = sortUpdates.map((u) => {
        const update: any = u.update;
        update._id = u.target.data._id;
        return update;
      });

      // Perform the update
      this.object.updateEmbeddedDocuments('Item', updateData);
    },
    'OVERRIDE',
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
    app.inventoryPlus.addInventoryFunctions(html);
  },
};
