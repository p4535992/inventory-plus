# Inventory+

![Latest Release Download Count](https://img.shields.io/github/downloads/p4535992/inventory-plus/latest/module.zip?color=2b82fc&label=DOWNLOADS&style=for-the-badge) 

[![Forge Installs](https://img.shields.io/badge/dynamic/json?label=Forge%20Installs&query=package.installs&suffix=%25&url=https%3A%2F%2Fforge-vtt.com%2Fapi%2Fbazaar%2Fpackage%2Finventory-plus&colorB=006400&style=for-the-badge)](https://forge-vtt.com/bazaar#package=inventory-plus) 

![Foundry Core Compatible Version](https://img.shields.io/badge/dynamic/json.svg?url=https%3A%2F%2Fraw.githubusercontent.com%2Fp4535992%2Finventory-plus%2Fmaster%2Fsrc%2Fmodule.json&label=Foundry%20Version&query=$.compatibleCoreVersion&colorB=orange&style=for-the-badge)

![Latest Version](https://img.shields.io/badge/dynamic/json.svg?url=https%3A%2F%2Fraw.githubusercontent.com%2Fp4535992%2Finventory-plus%2Fmaster%2Fsrc%2Fmodule.json&label=Latest%20Release&prefix=v&query=$.version&colorB=red&style=for-the-badge)

[![Foundry Hub Endorsements](https://img.shields.io/endpoint?logoColor=white&url=https%3A%2F%2Fwww.foundryvtt-hub.com%2Fwp-json%2Fhubapi%2Fv1%2Fpackage%2Finventory-plus%2Fshield%2Fendorsements&style=for-the-badge)](https://www.foundryvtt-hub.com/package/inventory-plus/)

![GitHub all releases](https://img.shields.io/github/downloads/p4535992/inventory-plus/total?style=for-the-badge)

### If you want to buy me a coffee [![alt-text](https://img.shields.io/badge/-Patreon-%23ff424d?style=for-the-badge)](https://www.patreon.com/p4535992) or if you want to support the original author with paypal  to felix.mueller.86@web.de

A Foundry VTT module to enhance the dnd5e inventory. Allows to customize your Inventory in various ways.

![example](./wiki/preview.jpg)

## NOTE: If you are a javascript developer and not a typescript developer, you can just use the javascript files under the dist folder

## NOTE: This module is **under maintenance**, I have no plans to update or add features. However, I will try to fix any bugs as possible. Any contribution is welcome.

# Installation

It's always better and easier to install modules through in in app browser. Just search for "Mount Up!"

To install this module manually:
1. Inside the Foundry "Configuration and Setup" screen, click "Add-on Modules"
2. Click "Install Module"
3. In the "Manifest URL" field, paste the following url:
`https://raw.githubusercontent.com/p4535992/inventory-plus/master/src/module.json`
4. Click 'Install' and wait for installation to complete
5. Don't forget to enable the module in game using the "Manage Module" button

### libWrapper

This module uses the [libWrapper](https://github.com/ruipin/fvtt-lib-wrapper) library for wrapping core methods. It is a hard dependency and it is recommended for the best experience and compatibility with other modules.

## Details

This module allows you to create custom inventory categories and sort items into them and the default categories. You can also order the categories around and even disable weight tracking on a per category basis.

## API

### game.modules.get('inventory-plus').api.calculateWeightFromActor(actorIdOrName:string) ⇒ <code>number</code>

A method to calculate the weight (the one from the module filters) on the actor

**Returns**: <code>number</code>

| Param | Type | Description | Default |
| --- | --- | --- | --- |
| actorIdOrName | <code>string</code> | The actro id or name (if founded) | <code>undefined</code> |

### game.modules.get('inventory-plus').api.calculateWeight(inventory: Category[], currency: number) ⇒ <code>number</code>

A method to calculate the weight (the one from the module filters) on inventory array and the current currency present on the actor

The `Category` object is rappresented like this:
```
{
  label: string;
  dataset: { type: string };
  sortFlag: number;
  ignoreWeight: boolean;
  maxWeight: number;
  ownWeight: number;
  collapsed: boolean;
  items: ItemData[];
}
```

**Returns**: <code>number</code>

| Param | Type | Description | Default |
| --- | --- | --- | --- |
| actorIdOrName | <code>string</code> | The actro id or name (if founded) | <code>undefined</code> 

## License

<a rel="license" href="http://creativecommons.org/licenses/by/4.0/"><img alt="Creative Commons Licence" style="border-width:0" src="https://i.creativecommons.org/l/by/4.0/88x31.png" /></a><br /><span xmlns:dct="http://purl.org/dc/terms/" property="dct:title">Inventory+ - a module for Foundry VTT -</span> by <a xmlns:cc="http://creativecommons.org/ns#" href="https://github.com/syl3r86?tab=repositories" property="cc:attributionName" rel="cc:attributionURL">Felix Müller</a> is licensed under a <a rel="license" href="http://creativecommons.org/licenses/by/4.0/">Creative Commons Attribution 4.0 International License</a>.

This work is licensed under Foundry Virtual Tabletop [EULA - Limited License Agreement for module development v 0.3.8](https://foundryvtt.com/article/license/).
