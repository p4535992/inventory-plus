/**
 * @author Felix Müller
 */

import type { ItemData } from '@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/module.mjs';
import CONSTANTS from './constants';
import { Category, InventoryPlusFlags, InventoryPlusItemType, inventoryPlusItemTypeCollection } from './inventory-plus-models';
import { debug, duplicateExtended, error, getCSSName, i18n, i18nFormat, info, isStringEquals, is_real_number, warn } from './lib/lib';
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

  init(actor: Actor) {
    // , inventory: Category[]
    this.actor = actor;
    this.initCategorys();
  }

  initCategorys() {
    let flagCategorys = <Record<string, Category>>this.actor.getFlag(CONSTANTS.MODULE_NAME, InventoryPlusFlags.CATEGORYS);
    const flagDisableDefaultCategories = <boolean>this.actor.getFlag(CONSTANTS.MODULE_NAME, InventoryPlusFlags.DISABLE_DEFAULT_CATEGORIES);
    if (flagCategorys === undefined && !flagDisableDefaultCategories) {
      debug(`flagCategory=false && flagDisableDefaultCategories=false`);
      flagCategorys = {
        weapon: <Category>{
          label: 'DND5E.ItemTypeWeaponPl',
          dataset: { type: 'weapon' },
          sortFlag: 1000,
          ignoreWeight: false,
          maxWeight: 0,
          ownWeight: 0,
          collapsed: false,
          items: [],
          explicitTypes: inventoryPlusItemTypeCollection.filter((t) => {
            return t.isInventory;
          }),
        },
        equipment: <Category>{
          label: 'DND5E.ItemTypeEquipmentPl',
          dataset: { type: 'equipment' },
          sortFlag: 2000,
          ignoreWeight: false,
          maxWeight: 0,
          ownWeight: 0,
          collapsed: false,
          items: [],
          explicitTypes: inventoryPlusItemTypeCollection.filter((t) => {
            return t.isInventory;
          }),
        },
        consumable: <Category>{
          label: 'DND5E.ItemTypeConsumablePl',
          dataset: { type: 'consumable' },
          sortFlag: 3000,
          ignoreWeight: false,
          maxWeight: 0,
          ownWeight: 0,
          collapsed: false,
          items: [],
          explicitTypes: inventoryPlusItemTypeCollection.filter((t) => {
            return t.isInventory;
          }),
        },
        tool: <Category>{
          label: 'DND5E.ItemTypeToolPl',
          dataset: { type: 'tool' },
          sortFlag: 4000,
          ignoreWeight: false,
          maxWeight: 0,
          ownWeight: 0,
          collapsed: false,
          items: [],
          explicitTypes: inventoryPlusItemTypeCollection.filter((t) => {
            return t.isInventory;
          }),
        },
        backpack: <Category>{
          label: 'DND5E.ItemTypeContainerPl',
          dataset: { type: 'backpack' },
          sortFlag: 5000,
          ignoreWeight: false,
          maxWeight: 0,
          ownWeight: 0,
          collapsed: false,
          items: [],
          explicitTypes: inventoryPlusItemTypeCollection.filter((t) => {
            return t.isInventory;
          }),
        },
        loot: <Category>{
          label: 'DND5E.ItemTypeLootPl',
          dataset: { type: 'loot' },
          sortFlag: 6000,
          ignoreWeight: false,
          maxWeight: 0,
          ownWeight: 0,
          collapsed: false,
          items: [],
          explicitTypes: inventoryPlusItemTypeCollection.filter((t) => {
            return t.isInventory;
          }),
        },
      };
    } else if(flagCategorys && !flagDisableDefaultCategories) {
      debug(`flagCategory=true && flagDisableDefaultCategories=false`);
      const categoryWeapon = flagCategorys['weapon'];
      if(!categoryWeapon){
        flagCategorys['weapon'] =
          <Category>{
            label: 'DND5E.ItemTypeWeaponPl',
            dataset: { type: 'weapon' },
            sortFlag: 1000,
            ignoreWeight: false,
            maxWeight: 0,
            ownWeight: 0,
            collapsed: false,
            items: [],
            explicitTypes: inventoryPlusItemTypeCollection.filter((t) => {
              return t.isInventory;
            }),
          }
      }
      const categoryEquipment = flagCategorys['equipment'];
      if(!categoryEquipment){
        flagCategorys['equipment'] =
          <Category>{
            label: 'DND5E.ItemTypeEquipmentPl',
            dataset: { type: 'equipment' },
            sortFlag: 2000,
            ignoreWeight: false,
            maxWeight: 0,
            ownWeight: 0,
            collapsed: false,
            items: [],
            explicitTypes: inventoryPlusItemTypeCollection.filter((t) => {
              return t.isInventory;
            }),
          }
      }
      const categoryConsumable = flagCategorys['consumable'];
      if(!categoryConsumable){
        flagCategorys['consumable'] =
          <Category>{
            label: 'DND5E.ItemTypeConsumablePl',
            dataset: { type: 'consumable' },
            sortFlag: 3000,
            ignoreWeight: false,
            maxWeight: 0,
            ownWeight: 0,
            collapsed: false,
            items: [],
            explicitTypes: inventoryPlusItemTypeCollection.filter((t) => {
              return t.isInventory;
            }),
          }
      }
      const categoryTool = flagCategorys['tool'];
      if(!categoryTool){
        flagCategorys['tool'] =
          <Category>{
            label: 'DND5E.ItemTypeToolPl',
            dataset: { type: 'tool' },
            sortFlag: 4000,
            ignoreWeight: false,
            maxWeight: 0,
            ownWeight: 0,
            collapsed: false,
            items: [],
            explicitTypes: inventoryPlusItemTypeCollection.filter((t) => {
              return t.isInventory;
            }),
          }
      }
      const categoryBackpack = flagCategorys['backpack'];
      if(!categoryBackpack){
        flagCategorys['backpack'] =
          <Category>{
            label: 'DND5E.ItemTypeContainerPl',
            dataset: { type: 'backpack' },
            sortFlag: 5000,
            ignoreWeight: false,
            maxWeight: 0,
            ownWeight: 0,
            collapsed: false,
            items: [],
            explicitTypes: inventoryPlusItemTypeCollection.filter((t) => {
              return t.isInventory;
            }),
          }
      }
      const categoryLoot = flagCategorys['loot'];
      if(!categoryLoot){
        flagCategorys['loot'] =
          <Category>{
            label: 'DND5E.ItemTypeLootPl',
            dataset: { type: 'loot' },
            sortFlag: 6000,
            ignoreWeight: false,
            maxWeight: 0,
            ownWeight: 0,
            collapsed: false,
            items: [],
            explicitTypes: inventoryPlusItemTypeCollection.filter((t) => {
              return t.isInventory;
            }),
          }
      }
    } else if(flagCategorys && flagDisableDefaultCategories){
      debug(`flagCategory=true && flagDisableDefaultCategories=true`);
      for (const key in flagCategorys) {
          const category = <Category>flagCategorys[key];
          if(category && !category?.label){
            continue;
          }
          if(isStringEquals(i18n(category?.label), i18n('DND5E.ItemTypeWeaponPl'))){
            delete flagCategorys[key];
          }
          if(isStringEquals(i18n(category?.label), i18n('DND5E.ItemTypeEquipmentPl'))){
            delete flagCategorys[key];
          }
          if(isStringEquals(i18n(category?.label), i18n('DND5E.ItemTypeConsumablePl'))){
            delete flagCategorys[key];
          }
          if(isStringEquals(i18n(category?.label), i18n('DND5E.ItemTypeToolPl'))){
            delete flagCategorys[key];
          }
          if(isStringEquals(i18n(category?.label), i18n('DND5E.ItemTypeContainerPl'))){
            delete flagCategorys[key];
          }
          if(isStringEquals(i18n(category?.label), i18n('DND5E.ItemTypeLootPl'))){
            delete flagCategorys[key];
          }
      }
    } else {
      debug(`flagCategory=false && flagDisableDefaultCategories=true`);
      if(!flagCategorys){
        flagCategorys = {};
      }
    }

    // Little trick for filter the undefined values
    // https://stackoverflow.com/questions/51624641/how-to-filter-records-based-on-the-status-value-in-javascript-object
    const filterJSON = Object.keys(flagCategorys).filter(function (key) {
        const entry = flagCategorys[key];
        return entry != undefined && entry != null && entry.label;
    }).reduce( (res, key) => (res[key] = flagCategorys[key], res), {} );

    this.customCategorys = duplicateExtended(filterJSON);
    this.applySortKey();
  }

  addInventoryFunctions(html: JQuery<HTMLElement>) {
    /*
     *  add remove default categories
     */
    const flagDisableDefaultCategories = this.actor.getFlag(CONSTANTS.MODULE_NAME, InventoryPlusFlags.DISABLE_DEFAULT_CATEGORIES);
    const labelDialogDisableDefaultCategories = flagDisableDefaultCategories
      ? i18n(`${CONSTANTS.MODULE_NAME}.inv-plus-dialog.reenabledefaultcategories`)
      : i18n(`${CONSTANTS.MODULE_NAME}.inv-plus-dialog.removedefaultcategories`);

    const iconClass = flagDisableDefaultCategories
      ? `fa-plus-square`
      : `fa-minus-square`;

    const removeDefaultCategoriesBtn = $(
      `<a class="custom-category"><i class="fas ${iconClass}"></i>${labelDialogDisableDefaultCategories}</a>`,
    ).click(async (ev) => {
      const template = await renderTemplate(`modules/${CONSTANTS.MODULE_NAME}/templates/removeDefaultCategoriesDialog.hbs`, {
        flagDisableDefaultCategories: flagDisableDefaultCategories
      });
      const d = new Dialog({
        title: i18n(`${CONSTANTS.MODULE_NAME}.inv-plus-dialog.removedefaultcategories`),
        content: template,
        buttons: {
          accept: {
            icon: '<i class="fas fa-check"></i>',
            label: i18n(`${CONSTANTS.MODULE_NAME}.inv-plus-dialog.accept`),
            callback: async (html: JQuery<HTMLElement>) => {
              const f = flagDisableDefaultCategories && String(flagDisableDefaultCategories)  === 'true' ? true : false;
              await this.actor.setFlag(CONSTANTS.MODULE_NAME, InventoryPlusFlags.DISABLE_DEFAULT_CATEGORIES, !f);
            },
          },
          cancel: {
            icon: '<i class="fas fa-times"></i>',
            label: i18n(`${CONSTANTS.MODULE_NAME}.inv-plus-dialog.cancel`),
          },
        },
        default: 'cancel',
      });
      d.render(true);
    });
    html.find('.inventory .filter-list').prepend(removeDefaultCategoriesBtn);

    /*
     *  create custom category
     */
    const addCategoryBtn = $(
      `<a class="custom-category"><i class="fas fa-plus"></i>${i18n(
        `${CONSTANTS.MODULE_NAME}.inv-plus-dialog.addcustomcategory`,
      )}</a>`,
    ).click(async (ev) => {
      const explicitTypesFromList = inventoryPlusItemTypeCollection.filter((t) => {
        return t.isInventory;
      });
      const template = await renderTemplate(`modules/${CONSTANTS.MODULE_NAME}/templates/categoryDialog.hbs`, {
        explicitTypes: explicitTypesFromList
      });
      const d = new Dialog({
        title: i18n(`${CONSTANTS.MODULE_NAME}.inv-plus-dialog.creatingnewinventorycategory`),
        content: template,
        buttons: {
          accept: {
            icon: '<i class="fas fa-check"></i>',
            label: i18n(`${CONSTANTS.MODULE_NAME}.inv-plus-dialog.accept`),
            callback: async (html: JQuery<HTMLElement>) => {
              const input = html.find('input');
              const selectExplicitTypes = $(<HTMLElement>html.find('select[name="explicitTypes"')[0]);
              this.createCategory(input,selectExplicitTypes);
            },
          },
          cancel: {
            icon: '<i class="fas fa-times"></i>',
            label: i18n(`${CONSTANTS.MODULE_NAME}.inv-plus-dialog.cancel`),
          },
        },
        render: (html:JQuery<HTMLElement>) => {
          $(<HTMLElement>html.find(`select[name="explicitTypes"]`)[0])
          //@ts-ignore
          .SumoSelect({
            placeholder: 'Select item inventory type...',
            triggerChangeCombined: true,
          });
        },
        default: 'cancel',
      });
      d.render(true);
    });
    html.find('.inventory .filter-list').prepend(addCategoryBtn);

    /*
     *  add removal function
     */

    const createBtns = html.find('.inventory .item-create');
    for (const createBtn of createBtns) {
      const type = <string>createBtn.dataset.type;
      // Filter for only invenotry items
      if (['weapon', 'equipment', 'consumable', 'tool', 'backpack', 'loot'].indexOf(type) === -1) {
        const parent = <ParentNode>createBtn.parentNode;
        const removeCategoryBtn = $(
          `<a class="item-control remove-category"
            title="${i18n(`${CONSTANTS.MODULE_NAME}.inv-plus-dialog.deletecategory`)}"
            data-type="${type}">
            <i class="fas fa-minus"></i>${i18n(`${CONSTANTS.MODULE_NAME}.inv-plus-dialog.deletecategoryprefix`)}</a>`,
        );
        removeCategoryBtn.click((ev) => {
          this.removeCategory(ev);
        });
        //@ts-ignore
        parent.innerHTML = '';
        $(parent).append(removeCategoryBtn);
      }
    }

    /*
     *  add extra header functions
     */

    const targetCss = `.inventory .${getCSSName('sub-header')}`;
    const headers = html.find(targetCss);
    for (const headerTmp of headers) {
      const header = <JQuery<HTMLElement>>$(headerTmp);
      const type = <string>(<HTMLElement>header.find('.item-control')[0]).dataset.type;

      const extraStuff = $('<div class="inv-plus-stuff flexrow"></div>');
      header.find('h3').after(extraStuff);

      if (this.customCategorys[type] === undefined) {
        warn(i18nFormat(`${CONSTANTS.MODULE_NAME}.dialogs.warn.nocategoryfoundbytype`,{type:type}))
        return;
      }

      const currentCategory = <Category>this.customCategorys[type];
      if(!currentCategory.explicitTypes || currentCategory.explicitTypes.length === 0){
        currentCategory.explicitTypes = inventoryPlusItemTypeCollection.filter((t) => {
          return t.isInventory;
        });
      }
      // ===================
      // toggle item visibility
      // ===================
      const arrow = currentCategory?.collapsed === true ? 'right' : 'down';
      const toggleBtn = $(`<a class="toggle-collapse"><i class="fas fa-caret-${arrow}"></i></a>`).click((ev) => {
        currentCategory.collapsed = <boolean>!currentCategory?.collapsed;
        this.saveCategorys();
      });
      header.find('h3').before(toggleBtn);
      // ===================
      // reorder category
      // ===================
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
      // ================
      // edit category
      // ===============
      const editCategoryBtn = $(`<a class="inv-plus-stuff customize-category" data-type="${type}"><i class="fas fa-edit"></i></a>`).click(
        async (ev) => {
          const catTypeTmp = <string>ev.target.dataset.type || <string>ev.currentTarget.dataset.type;
          const currentCategoryTmp = duplicateExtended(<Category>this.customCategorys[catTypeTmp]);
          currentCategoryTmp.label = i18n(currentCategoryTmp.label);
          const template = await renderTemplate(
            `modules/${CONSTANTS.MODULE_NAME}/templates/categoryDialog.hbs`,
            currentCategoryTmp,
          );
          const d = new Dialog({
            title: i18n(`${CONSTANTS.MODULE_NAME}.inv-plus-dialog.editinventorycategory`),
            content: template,
            buttons: {
              accept: {
                icon: '<i class="fas fa-check"></i>',
                label: i18n(`${CONSTANTS.MODULE_NAME}.inv-plus-dialog.accept`),
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
                  const currentTypeSelectedS = <string[]>$(<HTMLElement>html.find('select[name="explicitTypes"')[0])?.val();
                  if(!currentTypeSelectedS || currentTypeSelectedS.length === 0){
                    currentCategory.explicitTypes = [];
                  }else if(currentTypeSelectedS.length === 1 && !currentTypeSelectedS[0]){
                    const newArr = currentCategory.explicitTypes.map((obj:InventoryPlusItemType) => {
                      return { ...obj, isSelected: false };
                    });
                    currentCategory.explicitTypes = newArr;
                  }else{
                    const newArr = currentCategory.explicitTypes.map((obj:InventoryPlusItemType) => {
                      if (currentTypeSelectedS.includes(obj.id)) {
                        return { ...obj, isSelected: true };
                      } else {
                        return { ...obj, isSelected: false };
                      }
                    });
                    currentCategory.explicitTypes = newArr;
                  }
                  this.customCategorys[catTypeTmp] = currentCategory;
                  this.saveCategorys();
                },
              },
              cancel: {
                icon: '<i class="fas fa-times"></i>',
                label: i18n(`${CONSTANTS.MODULE_NAME}.inv-plus-dialog.cancel`),
              },
            },
            render: (html:JQuery<HTMLElement>) => {
              $(<HTMLElement>html.find(`select[name="explicitTypes"]`)[0])
              //@ts-ignore
              .SumoSelect({
                placeholder: 'Select item inventory type...',
                triggerChangeCombined: true,
              });
            },
            default: 'cancel',
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
      if (currentCategory.ignoreWeight) {
        icon = `<i class="fas fa-feather"></i>`;
      } else if (currentCategory.ownWeight > 0) {
        icon = `<i class="fas fa-weight-hanging"></i>`;
      } else {
        icon = `<i class="fas fa-balance-scale-right"></i>`;
      }

      // TODO show type of category
      // none // 
      // weapon // <i class="fas fa-bomb"></i>
      // equipment // <i class="fas fa-vest"></i>
      // consumable // <i class="fas fa-hamburger"></i>
      // tool // <i class="fas fa-scroll"></i>
      // backpack // <i class="fas fa-toolbox"></i>
      // loot // <i class="fas fa-box"></i>
      // armorset // <i class="fas fa-tools"></i>

      if (currentCategory.maxWeight > 0) {
        const weight = <number>this.getCategoryItemWeight(type);
        const weightUnit = game.settings.get('dnd5e', 'metricWeightUnits')
          ? game.i18n.localize('DND5E.AbbreviationKgs')
          : game.i18n.localize('DND5E.AbbreviationLbs');
        const weightValue = `(${weight}/${currentCategory.maxWeight} ${weightUnit})`;

        const weightString = $(`<label class="category-weight"> ${icon} ${weightValue}</label>`);
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

  createCategory(inputs,selectExplicitTypes:JQuery<HTMLElement>) {
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

    const typesSelected = <string[]>selectExplicitTypes.val();
    const explicitTypesFromListTmp = <InventoryPlusItemType[]>[];
    const explicitTypesFromList = inventoryPlusItemTypeCollection.filter((t) => {
      const t2 = duplicateExtended(t);
      if(t2.isInventory && typesSelected.includes(t2.id)){
        t2.isSelected = true;
        explicitTypesFromListTmp.push(t2);
      }
    });

    newCategory.explicitTypes = explicitTypesFromListTmp;

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
    const catType = <string>ev.target.dataset.type || <string>ev.currentTarget.dataset.type;
    const changedItems: ItemData[] = [];
    for (const item of this.actor.items) {
      const type = this.getItemType(item.data);
      if (type === catType) {
        //await item.unsetFlag(CONSTANTS.MODULE_NAME, InventoryPlusFlag.CATEGORY);
        changedItems.push(<any>{
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
    await this.actor.setFlag(CONSTANTS.MODULE_NAME, InventoryPlusFlags.CATEGORYS, { [deleteKey]: null });
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
    // 0.5.4 only thing i touched, this broke everything ????
    //if (this.customCategorys[type] && this.customCategorys[type]?.dataset.type != item.type) {
    //  return item.type;
    //}
    return type;
  }

  getCategoryItemWeight(type: string) {
    let totalCategoryWeight = 0;
    for (const i of this.actor.items) {
      if (type === this.getItemType(i.data)) {
        //@ts-ignore
        const q = <number>i.data.data.quantity;
        //@ts-ignore
        const w = <number>i.data.data.weight;
        let eqpMultiplyer = 1;
        if (game.settings.get(CONSTANTS.MODULE_NAME, 'enableEquipmentMultiplier')) {
          eqpMultiplyer = <number>game.settings.get(CONSTANTS.MODULE_NAME, 'equipmentMultiplier') || 1;
        }
        //@ts-ignore
        const e = <number>i.data.data.equipped ? eqpMultiplyer : 1;
        if (is_real_number(w) && is_real_number(q)) {
          //@ts-ignore
          totalCategoryWeight += w * q * e;
        } else {
          debug(
            `The item '${i.name}', on category '${type}', on actor ${this.actor?.name} has not valid weight or quantity `,
          );
        }
      }
    }
    return totalCategoryWeight.toNearest(0.1);
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
    await this.actor.setFlag(CONSTANTS.MODULE_NAME, InventoryPlusFlags.CATEGORYS, this.customCategorys);
  }

}
