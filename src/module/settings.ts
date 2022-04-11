import CONSTANTS from './constants';
import { dialogWarning, i18n, warn } from './lib/lib';

export const registerSettings = function (): void {
  // game.settings.registerMenu(CONSTANTS.MODULE_NAME, 'resetAllSettings', {
  //   name: `${CONSTANTS.MODULE_NAME}.setting.reset.name`,
  //   hint: `${CONSTANTS.MODULE_NAME}.setting.reset.hint`,
  //   icon: 'fas fa-coins',
  //   type: ResetSettingsDialog,
  //   restricted: true,
  // });

  // ===================================================================

  // ===================================================================

  game.settings.register(CONSTANTS.MODULE_NAME, 'debug', {
    name: `${CONSTANTS.MODULE_NAME}.setting.debug.name`,
    hint: `${CONSTANTS.MODULE_NAME}.setting.debug.hint`,
    scope: 'client',
    config: true,
    default: false,
    type: Boolean,
  });

  // game.settings.register(CONSTANTS.MODULE_NAME, 'debugHooks', {
  //   name: `${CONSTANTS.MODULE_NAME}.setting.debugHooks.name`,
  //   hint: `${CONSTANTS.MODULE_NAME}.setting.debugHooks.hint`,
  //   scope: 'world',
  //   config: false,
  //   default: false,
  //   type: Boolean,
  // });

  // const settings = defaultSettings();
  // for (const [name, data] of Object.entries(settings)) {
  //   game.settings.register(CONSTANTS.MODULE_NAME, name, <any>data);
  // }
  // // for (const [name, data] of Object.entries(otherSettings)) {
  // //     game.settings.register(CONSTANTS.MODULE_NAME, name, data);
  // // }
};

class ResetSettingsDialog extends FormApplication<FormApplicationOptions, object, any> {
  constructor(...args) {
    //@ts-ignore
    super(...args);
    //@ts-ignore
    return new Dialog({
      title: game.i18n.localize(`${CONSTANTS.MODULE_NAME}.dialogs.resetsettings.title`),
      content:
        '<p style="margin-bottom:1rem;">' +
        game.i18n.localize(`${CONSTANTS.MODULE_NAME}.dialogs.resetsettings.content`) +
        '</p>',
      buttons: {
        confirm: {
          icon: '<i class="fas fa-check"></i>',
          label: game.i18n.localize(`${CONSTANTS.MODULE_NAME}.dialogs.resetsettings.confirm`),
          callback: async () => {
            await applyDefaultSettings();
            window.location.reload();
          },
        },
        cancel: {
          icon: '<i class="fas fa-times"></i>',
          label: game.i18n.localize(`${CONSTANTS.MODULE_NAME}.dialogs.resetsettings.cancel`),
        },
      },
      default: 'cancel',
    });
  }

  async _updateObject(event: Event, formData?: object): Promise<any> {
    // do nothing
  }
}

async function applyDefaultSettings() {
  // const settings = defaultSettings(true);
  // for (const [name, data] of Object.entries(settings)) {
  //   //@ts-ignore
  //   await game.settings.set(CONSTANTS.MODULE_NAME, name, data.default);
  // }
  const settings2 = otherSettings(true);
  for (const [name, data] of Object.entries(settings2)) {
    //@ts-ignore
    await game.settings.set(CONSTANTS.MODULE_NAME, name, data.default);
  }
}

// function defaultSettings(apply = false) {
//   return {

//   };
// }

function otherSettings(apply = false) {
  return {
    debug: {
      name: `${CONSTANTS.MODULE_NAME}.setting.debug.name`,
      hint: `${CONSTANTS.MODULE_NAME}.setting.debug.hint`,
      scope: 'client',
      config: true,
      default: false,
      type: Boolean,
    },

    debugHooks: {
      name: `${CONSTANTS.MODULE_NAME}.setting.debugHooks.name`,
      hint: `${CONSTANTS.MODULE_NAME}.setting.debugHooks.hint`,
      scope: 'world',
      config: false,
      default: false,
      type: Boolean,
    },
  };
}
