/**
 * This is your TypeScript entry file for Foundry VTT.
 * Register custom settings, sheets, and constants using the Foundry API.
 * Change this heading to be more descriptive to your module, or remove it.
 * Author: [your name]
 * Content License: [copyright and-or license] If using an existing system
 * 					you may want to put a (link to a) license or copyright
 * 					notice here (e.g. the OGL).
 * Software License: [your license] Put your desired license here, which
 * 					 determines how others may use and modify your module
 */
// Import JavaScript modules

// Import TypeScript modules
import type API from './module/api';
import CONSTANTS from './module/constants';
import { error } from './module/lib/lib';
import { initHooks, readyHooks, setupHooks } from './module/module';
import { registerSettings } from './module/settings';

/* ------------------------------------ */
/* Initialize module					*/
/* ------------------------------------ */
Hooks.once('init', async () => {
  console.log(`${CONSTANTS.MODULE_NAME} | Initializing ${CONSTANTS.MODULE_NAME}`);

  // Register custom module settings
  registerSettings();

  initHooks();
  // Assign custom classes and constants here

  // Register custom module settings
  //registerSettings();
  //fetchParams();

  // Preload Handlebars templates
  // await preloadTemplates();
  // Register custom sheets (if any)
});

/* ------------------------------------ */
/* Setup module							*/
/* ------------------------------------ */
Hooks.once('setup', function () {
  // Do anything after initialization but before ready
  //setupModules();

  setupHooks();

  //registerSettings();
});

/* ------------------------------------ */
/* When ready							*/
/* ------------------------------------ */
Hooks.once('ready', () => {
  // Do anything once the module is ready

  readyHooks();
});

// Add any additional hooks if necessary

export interface InventoryPlusModuleData {
  api: typeof API;
  socket: any;
}

/**
 * Initialization helper, to set API.
 * @param api to set to game module.
 */
export function setApi(api: typeof API): void {
  const data = game.modules.get(CONSTANTS.MODULE_NAME) as unknown as InventoryPlusModuleData;
  data.api = api;
}

/**
 * Returns the set API.
 * @returns Api from games module.
 */
export function getApi(): typeof API {
  const data = game.modules.get(CONSTANTS.MODULE_NAME) as unknown as InventoryPlusModuleData;
  return data.api;
}

/**
 * Initialization helper, to set Socket.
 * @param socket to set to game module.
 */
export function setSocket(socket: any): void {
  const data = game.modules.get(CONSTANTS.MODULE_NAME) as unknown as InventoryPlusModuleData;
  data.socket = socket;
}

/*
 * Returns the set socket.
 * @returns Socket from games module.
 */
export function getSocket() {
  const data = game.modules.get(CONSTANTS.MODULE_NAME) as unknown as InventoryPlusModuleData;
  return data.socket;
}
