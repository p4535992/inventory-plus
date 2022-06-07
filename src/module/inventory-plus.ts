/**
 * @author Felix Müller
 */

import type { ItemData } from '@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/module.mjs';
import CONSTANTS from './constants';
import { Category, InventoryPlusFlags } from './inventory-plus-models';
import { debug, duplicateExtended, error, getCSSName, warn } from './lib/lib';
// import ActorSheet5eCharacter from "../../systems/dnd5e/module/actor/sheets/character.js";

export class InventoryPlus {
  actor: Actor;
  customCategorys: Record<string, Category>;

  static processInventory(app, actor: Actor, inventory: Category[]) {
    if (app.inventoryPlus === undefined) {
      app.inventoryPlus = new InventoryPlus();
      app.inventoryPlus.init(actor);
    }
    return (<InventoryPlus>app.inventoryPlus).prepareInventory(inventory);
  }

  init(actor: Actor) { // , inventory: Category[]
    this.actor = actor;
    this.initCategorys();
  }

  initCategorys() {
    const actorFlag = this.actor.getFlag(CONSTANTS.MODULE_NAME, InventoryPlusFlags.CATEGORYS);
    if (actorFlag === undefined) {
      this.customCategorys = {
        weapon: {
          label: 'DND5E.ItemTypeWeaponPl',
          dataset: { type: 'weapon' },
          sortFlag: 1000,
          ignoreWeight: false,
          maxWeight: 0,
          ownWeight: 0,
          collapsed: false,
          items: [],
        },
        equipment: {
          label: 'DND5E.ItemTypeEquipmentPl',
          dataset: { type: 'equipment' },
          sortFlag: 2000,
          ignoreWeight: false,
          maxWeight: 0,
          ownWeight: 0,
          collapsed: false,
          items: [],
        },
        consumable: {
          label: 'DND5E.ItemTypeConsumablePl',
          dataset: { type: 'consumable' },
          sortFlag: 3000,
          ignoreWeight: false,
          maxWeight: 0,
          ownWeight: 0,
          collapsed: false,
          items: [],
        },
        tool: {
          label: 'DND5E.ItemTypeToolPl',
          dataset: { type: 'tool' },
          sortFlag: 4000,
          ignoreWeight: false,
          maxWeight: 0,
          ownWeight: 0,
          collapsed: false,
          items: [],
        },
        backpack: {
          label: 'DND5E.ItemTypeContainerPl',
          dataset: { type: 'backpack' },
          sortFlag: 5000,
          ignoreWeight: false,
          maxWeight: 0,
          ownWeight: 0,
          collapsed: false,
          items: [],
        },
        loot: {
          label: 'DND5E.ItemTypeLootPl',
          dataset: { type: 'loot' },
          sortFlag: 6000,
          ignoreWeight: false,
          maxWeight: 0,
          ownWeight: 0,
          collapsed: false,
          items: [],
        },
      };
    } else {
      this.customCategorys = <Record<string, Category>>duplicate(actorFlag);
      this.applySortKey();
    }
  }

  addInventoryFunctions(html) {
    /*
     *  create custom category
     */
    const addCategoryBtn = $('<a class="custom-category"><i class="fas fa-plus"></i> Add Custom Category</a>').click(
      async (ev) => {
        const template = await renderTemplate(`modules/${CONSTANTS.MODULE_NAME}/templates/categoryDialog.hbs`, {});
        const d = new Dialog({
          title: 'Creating new Inventory Category',
          content: template,
          buttons: {
            accept: {
              icon: '<i class="fas fa-check"></i>',
              label: 'Accept',
              callback: async (html: JQuery<HTMLElement>) => {
                const input = html.find('input');
                this.createCategory(input);
              },
            },
            cancle: {
              icon: '<i class="fas fa-times"></i>',
              label: 'Cancel',
            },
          },
          default: 'accept',
        });
        d.render(true);
      },
    );
    html.find('.inventory .filter-list').prepend(addCategoryBtn);

    /*
     *  add removal function
     */

    const createBtns = html.find('.inventory .item-create');
    for (const createBtn of createBtns) {
      const type = createBtn.dataset.type;
      if (['weapon', 'equipment', 'consumable', 'tool', 'backpack', 'loot'].indexOf(type) === -1) {
        const parent = createBtn.parentNode;
        const removeCategoryBtn = $(
          `<a class="item-control remove-category" title="Delete Category" data-type="${type}"><i class="fas fa-minus"></i> Del.</a>`,
        );
        removeCategoryBtn.click((ev) => this.removeCategory(ev));
        parent.innerHTML = '';
        $(parent).append(removeCategoryBtn);
      }
    }

    /*
     *  add extra header functions
     */

    const targetCss = `.inventory .${getCSSName('sub-header')}`;
    const headers = html.find(targetCss);
    for (let header of headers) {
      header = $(header);
      const type = header.find('.item-control')[0].dataset.type;

      const extraStuff = $('<div class="inv-plus-stuff flexrow"></div>');
      header.find('h3').after(extraStuff);

      if (this.customCategorys[type] === undefined) {
        return;
      }

      const currentCategory = <Category>this.customCategorys[type];

      // toggle item visibility
      const arrow = currentCategory?.collapsed === true ? 'right' : 'down';
      const toggleBtn = $(`<a class="toggle-collapse"><i class="fas fa-caret-${arrow}"></i></a>`).click((ev) => {
        currentCategory.collapsed = <boolean>!currentCategory?.collapsed;
        this.saveCategorys();
      });
      header.find('h3').before(toggleBtn);

      // reorder category
      if (this.getLowestSortFlag() !== currentCategory.sortFlag) {
        const upBtn = $(
          `<a class="inv-plus-stuff shuffle-up" title="Move category up"><i class="fas fa-chevron-up"></i></a>`,
        ).click(() => this.changeCategoryOrder(type, true));
        extraStuff.append(upBtn);
      }
      if (this.getHighestSortFlag() !== currentCategory.sortFlag) {
        const downBtn = $(
          `<a class="inv-plus-stuff shuffle-down" title="Move category down"><i class="fas fa-chevron-down"></i></a>`,
        ).click(() => this.changeCategoryOrder(type, false));
        extraStuff.append(downBtn);
      }

      // edit category
      const editCategoryBtn = $(`<a class="inv-plus-stuff customize-category"><i class="fas fa-edit"></i></a>`).click(
        async (ev) => {
          const template = await renderTemplate(
            `modules/${CONSTANTS.MODULE_NAME}/templates/categoryDialog.hbs`,
            currentCategory,
          );
          const d = new Dialog({
            title: 'Edit Inventory Category',
            content: template,
            buttons: {
              accept: {
                icon: '<i class="fas fa-check"></i>',
                label: 'Accept',
                callback: async (html: JQuery<HTMLElement>) => {
                  const inputs = html.find('input');
                  for (const input of inputs) {
                    const value = input.type === 'checkbox' ? input.checked : input.value;
                    if (input.dataset.dtype === 'Number') {
                      const valueN = Number(value) > 0 ? Number(value) : 0;
                      currentCategory[input.name] = valueN;
                    } else {
                      currentCategory[input.name] = value;
                    }
                  }
                  this.saveCategorys();
                },
              },
              cancle: {
                icon: '<i class="fas fa-times"></i>',
                label: 'Cancel',
              },
            },
            default: 'accept',
          });
          d.render(true);
        },
      );
      extraStuff.append(editCategoryBtn);

      // hide collapsed category items
      if (currentCategory.collapsed === true) {
        header.next().hide();
      }

      let icon = ``;
      if(currentCategory.ignoreWeight){
        icon = `<i class="fas fa-feather"></i>`;
      }else if(currentCategory.ownWeight > 0){
        icon = `<i class="fas fa-weight-hanging"></i>`;
      }else{
        icon = `<i class="fas fa-balance-scale-right"></i>`;
      }

      if (currentCategory.maxWeight > 0) {
        const weight = <number>this.getCategoryItemWeight(type);
        const weightUnit = game.settings.get('dnd5e', 'metricWeightUnits')
          ? game.i18n.localize('DND5E.AbbreviationKgs')
          : game.i18n.localize('DND5E.AbbreviationLbs')
        const weightValue = `(${weight}/${currentCategory.maxWeight} ${weightUnit})`;

        const weightString = $(
          `<label class="category-weight"> ${icon} ${weightValue}</label>`
        );
        header.find('h3').append(weightString);
      }
    }
  }

  prepareInventory(inventory: Category[]) {
    const sections = <Record<string, Category>>duplicateExtended(this.customCategorys);

    for (const id in sections) {
      (<Category>sections[id]).items = [];
    }

    for (const section of inventory) {
      for (const item of <ItemData[]>section.items) {
        let type = this.getItemType(item);
        if (sections[type] === undefined) {
          type = item.type;
        }
        (<Category>sections[type]).items?.push(item);
      }
    }

    // sort items within sections
    for (const id in sections) {
      const section = <Category>sections[id];
      section.items?.sort((a, b) => {
        return a.sort - b.sort;
      });
    }
    return sections;
  }

  createCategory(inputs) {
    const newCategory = new Category();

    for (const input of inputs) {
      const value: string = input.type === 'checkbox' ? input.checked : input.value;
      if (input.dataset.dtype === 'Number') {
        const valueN = Number(value) > 0 ? Number(value) : 0;
        newCategory[input.name] = valueN;
      } else {
        newCategory[input.name] = value;
      }
    }

    if (newCategory.label === undefined || newCategory.label === '') {
      error(`Could not create Category as no name was specified`, true);
      return;
    }

    const key = this.generateCategoryId();

    newCategory.dataset = { type: key };
    newCategory.collapsed = false;
    newCategory.sortFlag = this.getHighestSortFlag() + 1000;
    this.customCategorys[key] = newCategory;
    this.saveCategorys();
  }

  async removeCategory(ev) {
    const catType = ev.target.dataset.type;
    const changedItems: ItemData[] = [];
    for (const item of this.actor.items) {
      const type = this.getItemType(item.data);
      if (type === catType) {
        //await item.unsetFlag(CONSTANTS.MODULE_NAME, InventoryPlusFlag.CATEGORY);
        changedItems.push(<any>{
          // _id: item.id,
          // '-=flags.inventory-plus':null
          _id: <string>item.id,
          flags: {
            'inventory-plus': null,
          },
        });
      }
    }
    //@ts-ignore
    await this.actor.updateEmbeddedDocuments('Item', changedItems);

    delete this.customCategorys[catType];
    const deleteKey = `-=${catType}`;
    this.actor.setFlag(CONSTANTS.MODULE_NAME, InventoryPlusFlags.CATEGORYS, { [deleteKey]: null });
  }

  changeCategoryOrder(movedType, up) {
    let targetType = movedType;
    let currentSortFlag = 0;
    if (!up) currentSortFlag = 999999999;
    for (const id in this.customCategorys) {
      const currentCategory = <Category>this.customCategorys[id];
      if (up) {
        if (
          id !== movedType &&
          currentCategory.sortFlag < (<Category>this.customCategorys[movedType]).sortFlag &&
          currentCategory.sortFlag > currentSortFlag
        ) {
          targetType = id;
          currentSortFlag = currentCategory.sortFlag;
        }
      } else {
        if (
          id !== movedType &&
          currentCategory.sortFlag > (<Category>this.customCategorys[movedType]).sortFlag &&
          currentCategory.sortFlag < currentSortFlag
        ) {
          targetType = id;
          currentSortFlag = currentCategory.sortFlag;
        }
      }
    }

    if (movedType !== targetType) {
      const oldMovedSortFlag = this.customCategorys[movedType]?.sortFlag;
      const newMovedSortFlag = currentSortFlag;

      (<Category>this.customCategorys[movedType]).sortFlag = newMovedSortFlag;
      (<Category>this.customCategorys[targetType]).sortFlag = <number>oldMovedSortFlag;
      this.applySortKey();
      this.saveCategorys();
    }
  }

  applySortKey() {
    const sortedCategorys = {};

    const keys = Object.keys(this.customCategorys);
    keys.sort((a, b) => {
      return <number>this.customCategorys[a]?.sortFlag - <number>this.customCategorys[b]?.sortFlag;
    });
    for (const key of keys) {
      sortedCategorys[key] = this.customCategorys[key];
    }
    this.customCategorys = sortedCategorys;
  }

  getHighestSortFlag() {
    let highest = 0;

    for (const id in this.customCategorys) {
      const cat = <Category>this.customCategorys[id];
      if (!cat) {
        warn(`Can't find the category with id '${id}'`, true);
        return highest;
      }
      if (cat.sortFlag > highest) {
        highest = cat.sortFlag;
      }
    }

    return highest;
  }

  getLowestSortFlag() {
    let lowest = 999999999;

    for (const id in this.customCategorys) {
      const cat = <Category>this.customCategorys[id];

      if (cat.sortFlag < lowest) {
        lowest = cat.sortFlag;
      }
    }

    return lowest;
  }

  generateCategoryId() {
    let id = '';
    let iterations = 100;
    do {
      id = Math.random().toString(36).substring(7);
      iterations--;
    } while (this.customCategorys[id] !== undefined && iterations > 0 && id.length >= 5);

    return id;
  }

  getItemType(item: ItemData) {
    let type = getProperty(item, `flags.${CONSTANTS.MODULE_NAME}.${InventoryPlusFlags.CATEGORY}`);
    if (type === undefined || this.customCategorys[type] === undefined) {
      type = item.type;
    }
    return type;
  }

  getCategoryItemWeight(type: string) {
    let weight = 0;
    for (const i of this.actor.items) {
      if (type === this.getItemType(i.data)) {
        //@ts-ignore
        weight += i.data.data.weight * i.data.data.quantity;
      }
    }
    return weight;
  }

  // static getCSSName(element) {
  //   const version = <string[]>game.system.data.version.split('.');
  //   if (element === 'sub-header') {
  //     if (Number(version[0]) == 0 && Number(version[1]) <= 9 && Number(version[2]) <= 8) {
  //       return 'inventory-header';
  //     } else {
  //       return 'items-header';
  //     }
  //   }
  // }

  async saveCategorys() {
    //this.actor.update({ 'flags.inventory-plus.categorys': this.customCategorys }).then(() => { console.log(this.actor.data.flags) });
    await this.actor.setFlag(CONSTANTS.MODULE_NAME, InventoryPlusFlags.CATEGORYS, this.customCategorys);
  }
}
