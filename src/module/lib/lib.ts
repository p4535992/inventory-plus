import API from '../api';
import CONSTANTS from '../constants';

// =============================
// Module Generic function
// =============================

export async function getToken(documentUuid) {
  const document = await fromUuid(documentUuid);
  //@ts-ignore
  return document?.token ?? document;
}

export function getOwnedTokens(priorityToControlledIfGM: boolean): Token[] {
  const gm = game.user?.isGM;
  if (gm) {
    if (priorityToControlledIfGM) {
      return <Token[]>canvas.tokens?.controlled;
    } else {
      return <Token[]>canvas.tokens?.placeables;
    }
  }
  let ownedTokens = <Token[]>canvas.tokens?.placeables.filter((token) => token.isOwner && (!token.data.hidden || gm));
  if (ownedTokens.length === 0 || !canvas.tokens?.controlled[0]) {
    ownedTokens = <Token[]>(
      canvas.tokens?.placeables.filter((token) => (token.observer || token.isOwner) && (!token.data.hidden || gm))
    );
  }
  return ownedTokens;
}

export function is_UUID(inId) {
  return typeof inId === 'string' && (inId.match(/\./g) || []).length && !inId.endsWith('.');
}

export function getUuid(target) {
  // If it's an actor, get its TokenDocument
  // If it's a token, get its Document
  // If it's a TokenDocument, just use it
  // Otherwise fail
  const document = getDocument(target);
  return document?.uuid ?? false;
}

export function getDocument(target) {
  if (target instanceof foundry.abstract.Document) return target;
  return target?.document;
}

export function is_real_number(inNumber) {
  return !isNaN(inNumber) && typeof inNumber === 'number' && isFinite(inNumber);
}

export function isGMConnected() {
  return !!Array.from(<Users>game.users).find((user) => user.isGM && user.active);
}

export function isGMConnectedAndSocketLibEnable() {
  return isGMConnected(); // && !game.settings.get(CONSTANTS.MODULE_NAME, 'doNotUseSocketLibFeature');
}

export function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function isActiveGM(user) {
  return user.active && user.isGM;
}

export function getActiveGMs() {
  return game.users?.filter(isActiveGM);
}

export function isResponsibleGM() {
  if (!game.user?.isGM) return false;
  return !getActiveGMs()?.some((other) => other.data._id < <string>game.user?.data._id);
}

// ================================
// Logger utility
// ================================

// export let debugEnabled = 0;
// 0 = none, warnings = 1, debug = 2, all = 3

export function debug(msg, args = '') {
  if (game.settings.get(CONSTANTS.MODULE_NAME, 'debug')) {
    console.log(`DEBUG | ${CONSTANTS.MODULE_NAME} | ${msg}`, args);
  }
  return msg;
}

export function log(message) {
  message = `${CONSTANTS.MODULE_NAME} | ${message}`;
  console.log(message.replace('<br>', '\n'));
  return message;
}

export function notify(message) {
  message = `${CONSTANTS.MODULE_NAME} | ${message}`;
  ui.notifications?.notify(message);
  console.log(message.replace('<br>', '\n'));
  return message;
}

export function info(info, notify = false) {
  info = `${CONSTANTS.MODULE_NAME} | ${info}`;
  if (notify) ui.notifications?.info(info);
  console.log(info.replace('<br>', '\n'));
  return info;
}

export function warn(warning, notify = false) {
  warning = `${CONSTANTS.MODULE_NAME} | ${warning}`;
  if (notify) ui.notifications?.warn(warning);
  console.warn(warning.replace('<br>', '\n'));
  return warning;
}

export function error(error, notify = true) {
  error = `${CONSTANTS.MODULE_NAME} | ${error}`;
  if (notify) ui.notifications?.error(error);
  return new Error(error.replace('<br>', '\n'));
}

export function timelog(message): void {
  warn(Date.now(), message);
}

export const i18n = (key: string): string => {
  return game.i18n.localize(key)?.trim();
};

export const i18nFormat = (key: string, data = {}): string => {
  return game.i18n.format(key, data)?.trim();
};

// export const setDebugLevel = (debugText: string): void => {
//   debugEnabled = { none: 0, warn: 1, debug: 2, all: 3 }[debugText] || 0;
//   // 0 = none, warnings = 1, debug = 2, all = 3
//   if (debugEnabled >= 3) CONFIG.debug.hooks = true;
// };

export function dialogWarning(message, icon = 'fas fa-exclamation-triangle') {
  return `<p class="${CONSTANTS.MODULE_NAME}-dialog">
        <i style="font-size:3rem;" class="${icon}"></i><br><br>
        <strong style="font-size:1.2rem;">${CONSTANTS.MODULE_NAME}</strong>
        <br><br>${message}
    </p>`;
}

// =========================================================================================

export function cleanUpString(stringToCleanUp: string) {
  // regex expression to match all non-alphanumeric characters in string
  const regex = /[^A-Za-z0-9]/g;
  if (stringToCleanUp) {
    return i18n(stringToCleanUp).replace(regex, '').toLowerCase();
  } else {
    return stringToCleanUp;
  }
}

export function isStringEquals(stringToCheck1: string, stringToCheck2: string, startsWith = false): boolean {
  if (stringToCheck1 && stringToCheck2) {
    const s1 = cleanUpString(stringToCheck1) ?? '';
    const s2 = cleanUpString(stringToCheck2) ?? '';
    if (startsWith) {
      return s1.startsWith(s2) || s2.startsWith(s1);
    } else {
      return s1 === s2;
    }
  } else {
    return stringToCheck1 === stringToCheck2;
  }
}

/**
 * The duplicate function of foundry keep converting my string value to "0"
 * i don't know why this methos is a brute force solution for avoid that problem
 */
export function duplicateExtended(obj: any): any {
  try {
    //@ts-ignore
    if (structuredClone) {
      //@ts-ignore
      return structuredClone(obj);
    } else {
      // Shallow copy
      // const newObject = jQuery.extend({}, oldObject);
      // Deep copy
      // const newObject = jQuery.extend(true, {}, oldObject);
      return jQuery.extend(true, {}, obj);
    }
  } catch (e) {
    return duplicate(obj);
  }
}

// =========================================================================================

/**
 *
 * @param obj Little helper for loop enum element on typescript
 * @href https://www.petermorlion.com/iterating-a-typescript-enum/
 * @returns
 */
export function enumKeys<O extends object, K extends keyof O = keyof O>(obj: O): K[] {
  return Object.keys(obj).filter((k) => Number.isNaN(+k)) as K[];
}

/**
 * @href https://stackoverflow.com/questions/7146217/merge-2-arrays-of-objects
 * @param target
 * @param source
 * @param prop
 */
export function mergeByProperty(target: any[], source: any[], prop: any) {
  for (const sourceElement of source) {
    const targetElement = target.find((targetElement) => {
      return sourceElement[prop] === targetElement[prop];
    });
    targetElement ? Object.assign(targetElement, sourceElement) : target.push(sourceElement);
  }
  return target;
}

/**
 * Returns the first selected token
 */
export function getFirstPlayerTokenSelected(): Token | null {
  // Get first token ownted by the player
  const selectedTokens = <Token[]>canvas.tokens?.controlled;
  if (selectedTokens.length > 1) {
    //iteractionFailNotification(i18n("foundryvtt-arms-reach.warningNoSelectMoreThanOneToken"));
    return null;
  }
  if (!selectedTokens || selectedTokens.length == 0) {
    //if(game.user.character.data.token){
    //  //@ts-ignore
    //  return game.user.character.data.token;
    //}else{
    return null;
    //}
  }
  return <Token>selectedTokens[0];
}

/**
 * Returns a list of selected (or owned, if no token is selected)
 * note: ex getSelectedOrOwnedToken
 */
export function getFirstPlayerToken(): Token | null {
  // Get controlled token
  let token: Token;
  const controlled: Token[] = <Token[]>canvas.tokens?.controlled;
  // Do nothing if multiple tokens are selected
  if (controlled.length && controlled.length > 1) {
    //iteractionFailNotification(i18n("foundryvtt-arms-reach.warningNoSelectMoreThanOneToken"));
    return null;
  }
  // If exactly one token is selected, take that
  token = <Token>controlled[0];
  if (!token) {
    if (!controlled.length || controlled.length == 0) {
      // If no token is selected use the token of the users character
      token = <Token>canvas.tokens?.placeables.find((token) => token.data._id === game.user?.character?.data?._id);
    }
    // If no token is selected use the first owned token of the users character you found
    if (!token) {
      token = <Token>canvas.tokens?.ownedTokens[0];
    }
  }
  return token;
}

function getElevationToken(token: Token): number {
  const base = token.document.data;
  return getElevationPlaceableObject(base);
}

function getElevationWall(wall: Wall): number {
  const base = wall.document.data;
  return getElevationPlaceableObject(base);
}

function getElevationPlaceableObject(placeableObject: any): number {
  let base = placeableObject;
  if (base.document) {
    base = base.document.data;
  }
  const base_elevation =
    //@ts-ignore
    typeof _levels !== 'undefined' &&
    //@ts-ignore
    _levels?.advancedLOS &&
    (placeableObject instanceof Token || placeableObject instanceof TokenDocument)
      ? //@ts-ignore
        _levels.getTokenLOSheight(placeableObject)
      : base.elevation ??
        base.flags['levels']?.elevation ??
        base.flags['levels']?.rangeBottom ??
        base.flags['wallHeight']?.wallHeightBottom ??
        0;
  return base_elevation;
}

// =============================
// Module specific function
// =============================

export function getCSSName(element) {
  const version = <string[]>game.system.data.version.split('.');
  if (element === 'sub-header') {
    if (Number(version[0]) == 0 && Number(version[1]) <= 9 && Number(version[2]) <= 8) {
      return 'inventory-header';
    } else {
      return 'items-header';
    }
  }
}

export async function retrieveItemFromData(
  actor: Actor,
  itemId: string,
  itemName: string,
  currentCompendium: string,
  sourceActorId: string,
): Promise<Item> {
  let itemFounded: Item | null = null;
  if (currentCompendium) {
    const pack = game.packs.get(currentCompendium);
    if (pack) {
      await pack.getIndex();
      for (const entityComp of pack.index) {
        const itemComp = <StoredDocument<Item>>await pack.getDocument(entityComp._id);
        if (itemComp.id === itemId || itemComp.name === itemName) {
          itemFounded = itemComp;
          break;
        }
      }
    }
  }
  if (!itemFounded && sourceActorId) {
    const sourceActor = <Actor>game.actors?.get(sourceActorId);
    if (sourceActor) {
      itemFounded = <Item>sourceActor.items.get(itemId);
    }
  }
  if (!itemFounded) {
    itemFounded = game.items?.get(itemId) || <Item>actor.items.get(itemId) || undefined;
  }
  return itemFounded;
}

export function isAlt() {
  // check if Alt and only Alt is being pressed during the drop event.
  const alts = new Set(['Alt', 'AltLeft']);
  return game.keyboard?.downKeys.size == 1 && game.keyboard.downKeys.intersects(alts);
}

export function checkCompatible(actorTypeName1: string, actorTypeName2: string, item: Item) {
  console.info(
    'TransferStuff | Check Compatibility: Dragging Item:"' +
      String(item.data.type) +
      '" from sourceActor.data.type:"' +
      String(actorTypeName1) +
      '" to dragTarget.data.type:"' +
      String(actorTypeName2) +
      '".',
  );

  const transferBetweenSameTypeActors = game.settings.get(CONSTANTS.MODULE_NAME, 'actorTransferSame');
  if (transferBetweenSameTypeActors && actorTypeName1 == actorTypeName2) {
    return true;
  }
  try {
    const transferPairs = JSON.parse('{' + game.settings.get(CONSTANTS.MODULE_NAME, 'actorTransferPairs') + '}');
    const withActorTypeName1 = transferPairs[actorTypeName1];
    const withActorTypeName2 = transferPairs[actorTypeName2];
    if (Array.isArray(withActorTypeName1) && withActorTypeName1.indexOf(actorTypeName2) !== -1) return true;
    if (Array.isArray(withActorTypeName2) && withActorTypeName2.indexOf(actorTypeName1) !== -1) return true;
    if (withActorTypeName1 == actorTypeName2) return true;
    if (withActorTypeName2 == actorTypeName1) return true;
  } catch (err: any) {
    console.error('TransferStuff | ', err.message);
    ui.notifications.error('TransferStuff | ' + err.message);
  }
  return false;
}

export function deleteItem(sheet: ActorSheet, itemId: string) {
  if (sheet.actor?.deleteEmbeddedDocuments != undefined) {
    sheet.actor?.deleteEmbeddedDocuments('Item', [itemId]);
  } else {
    //@ts-ignore
    sheet.actor?.deleteOwnedItem(itemId);
  }
}

export function deleteItemIfZero(sheet: ActorSheet, itemId: string) {
  const item = sheet.actor?.data.items.get(itemId);
  if (item == undefined) {
    return;
  }
  //@ts-ignore
  if (item.data.data.quantity <= 0) {
    deleteItem(sheet, itemId);
  }
}

export function transferItem(
  sourceSheet: ActorSheet,
  targetSheet: ActorSheet,
  originalItemId: string,
  createdItem: Item,
  originalQuantity: number,
  transferedQuantity: number,
  stackItems: boolean,
) {
  const originalItem = sourceSheet.actor?.items.get(originalItemId);
  if (originalItem == undefined) {
    console.error('Could not find the source item', originalItemId);
    return;
  }

  if (transferedQuantity > 0 && transferedQuantity <= originalQuantity) {
    const newOriginalQuantity = originalQuantity - transferedQuantity;
    let stacked = false; // will be true if a stack of item has been found and items have been stacked in it
    if (stackItems) {
      const potentialStacks = <Item[]>(
        targetSheet.actor?.data.items.filter(
          (i) => i.name == originalItem.name && diffObject(createdItem, i) && i.data._id !== createdItem.data._id,
        )
      );
      if (potentialStacks.length >= 1) {
        //@ts-ignore
        const newQuantity = <number>potentialStacks[0].data.data.quantity + transferedQuantity;
        potentialStacks[0]?.update({ 'data.quantity': newQuantity });
        deleteItemIfZero(targetSheet, <string>createdItem.data._id);
        stacked = true;
      }
    }

    originalItem.update({ 'data.quantity': newOriginalQuantity }).then((i: Item) => {
      const sh = <FormApplication<FormApplicationOptions, FormApplication.Data<{}, FormApplicationOptions>>>i.actor?.sheet;
      //@ts-ignore
      deleteItemIfZero(<ActorSheet>sh, <string>i.data._id);
    });
    if (stacked === false) {
      //@ts-ignore
      createdItem.data.data.quantity = transferedQuantity;
      targetSheet.actor?.createEmbeddedDocuments('Item', [<any>createdItem.data]);
    }
  } else {
    ui.notifications.error('TransferStuff | could not transfer ' + transferedQuantity + ' items');
  }
}

export function transferCurrency(html: JQuery<HTMLElement>, sourceSheet, targetSheet) {
  const currencies = ['pp', 'gp', 'ep', 'sp', 'cp'];

  const errors: string[] = [];
  for (const c of currencies) {
    const amount = parseInt(<string>html.find('.' + c).val(), 10);
    if (amount < 0 || amount > sourceSheet.actor.data.data.currency[c]) {
      errors.push(c);
    }
  }

  if (errors.length !== 0) {
    error(i18n(CONSTANTS.MODULE_NAME + '.notEnoughCurrency') + ' ' + errors.join(', '), true);
  } else {
    for (const c of currencies) {
      const amount = parseInt(<string>html.find('.' + c + ' input').val(), 10);
      const key = 'data.currency.' + c;
      sourceSheet.actor.update({ [key]: sourceSheet.actor.data.data.currency[c] - amount });
      targetSheet.actor.update({ [key]: targetSheet.actor.data.data.currency[c] + amount }); // key is between [] to force its evaluation
    }
  }
}

export function showItemTransferDialog(
  originalQuantity: number,
  sourceSheet: ActorSheet,
  targetSheet: ActorSheet,
  originalItemId:string,
  createdItem:Item,
) {
  const contentDialog = `
  <form class="transferstuff item">
    <div class="form-group">
      <input type="number" 
        class="transferedQuantity" 
        value="${originalQuantity}" 
        min="0" 
        max="${originalQuantity}" />
      <button onclick="this.parentElement.querySelector('.transferedQuantity').value = '1'"
        >${i18n(CONSTANTS.MODULE_NAME + '.one')}
      </button>
      <button 
        onclick="this.parentElement.querySelector('.transferedQuantity').value = '${Math.round(originalQuantity / 2)}'"
        >${i18n(CONSTANTS.MODULE_NAME + '.half')}
      </button>
      <button 
        onclick="this.parentElement.querySelector('.transferedQuantity').value = '${originalQuantity}'"
        >${i18n(CONSTANTS.MODULE_NAME + '.max')}
      </button>
      <label style="flex: none;">
        <input style="vertical-align: middle;" 
          type="checkbox" 
          class="stack" 
          checked="checked" 
          />${i18n(CONSTANTS.MODULE_NAME + '.stackItems')}
      </label>
    </div>
  </form>`;
  const transferDialog = new Dialog({
    title: 'How many items do you want to move?',
    content: contentDialog,
    buttons: {
      transfer: {
        //icon: "<i class='fas fa-check'></i>",
        label: i18n(CONSTANTS.MODULE_NAME + '.transfer'),
        callback: (html: JQuery<HTMLElement>) => {
          const transferedQuantity = parseInt(<string>html.find('input.transferedQuantity').val(), 10);
          const stackItems = html.find('input.stack').is(':checked');
          transferItem(
            sourceSheet,
            targetSheet,
            originalItemId,
            createdItem,
            originalQuantity,
            transferedQuantity,
            stackItems,
          );
        },
      },
    },
    default: 'transfer',
  });
  transferDialog.render(true);
}

export function disabledIfZero(n: number): 'disabled' | '' {
  if (n === 0) {
    return 'disabled';
  }
  return '';
}

export function showCurrencyTransferDialog(sourceSheet: ActorSheet, targetSheet: ActorSheet) {
  //@ts-ignore
  const pp = sourceSheet.actor?.data.data.currency.pp;
  //@ts-ignore
  const gp = sourceSheet.actor?.data.data.currency.gp;
  //@ts-ignore
  const ep = sourceSheet.actor?.data.data.currency.ep;
  //@ts-ignore
  const sp = sourceSheet.actor?.data.data.currency.sp;
  //@ts-ignore
  const cp = sourceSheet.actor?.data.data.currency.cp;

  const contentDialog = `
  <form class="transferstuff currency">
    <div class="form-group">
      <span class="currency pp">
        <i class="fas fa-coins"></i>
        <span>Platinum: </span>
        <input type="number" 
        value="0" 
        min="0" ${disabledIfZero(pp)} 
        max="${pp}" />
      </span>
      <span class="currency gp">
        <i class="fas fa-coins"></i>
        <span>Gold: </span>
        <input type="number" 
        value="0" 
        min="0" ${disabledIfZero(gp)} 
        max="${gp}" />
      </span>
      <span class="currency ep">
        <i class="fas fa-coins"></i>
        <span>Electrum: </span>
        <input type="number" 
        value="0" 
        min="0" ${disabledIfZero(ep)} 
        max="${ep}" />
      </span>
      <span class="currency sp">
        <i class="fas fa-coins"></i>
        <span>Silver: </span>
        <input type="number" 
        value="0" 
        min="0" ${disabledIfZero(sp)} 
        max="${sp}" />
      </span>
      <span class="currency cp">
        <i class="fas fa-coins"></i>
        <span>Copper: </span>
        <input type="number" 
        value="0"
        min="0" ${disabledIfZero(cp)} 
        max="${cp}" />
      </span>
    </div>
  </form>`;
  const transferDialog = new Dialog({
    title: i18n(CONSTANTS.MODULE_NAME + '.howMuchCurrency'),

    content: contentDialog,
    buttons: {
      transfer: {
        //icon: "<i class='fas fa-check'></i>",
        label: `Transfer`,
        callback: (html: JQuery<HTMLElement>) => {
          transferCurrency(html, sourceSheet, targetSheet);
        },
      },
    },
    default: i18n(CONSTANTS.MODULE_NAME + '.transfer'),
  });
  transferDialog.render(true);
}
