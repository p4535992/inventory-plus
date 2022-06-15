# Inventory+

![Latest Release Download Count](https://img.shields.io/github/downloads/p4535992/inventory-plus/latest/module.zip?color=2b82fc&label=DOWNLOADS&style=for-the-badge) 

[![Forge Installs](https://img.shields.io/badge/dynamic/json?label=Forge%20Installs&query=package.installs&suffix=%25&url=https%3A%2F%2Fforge-vtt.com%2Fapi%2Fbazaar%2Fpackage%2Finventory-plus&colorB=006400&style=for-the-badge)](https://forge-vtt.com/bazaar#package=inventory-plus) 

![Foundry Core Compatible Version](https://img.shields.io/badge/dynamic/json.svg?url=https%3A%2F%2Fraw.githubusercontent.com%2Fp4535992%2Finventory-plus%2Fmaster%2Fsrc%2Fmodule.json&label=Foundry%20Version&query=$.compatibleCoreVersion&colorB=orange&style=for-the-badge)

![Latest Version](https://img.shields.io/badge/dynamic/json.svg?url=https%3A%2F%2Fraw.githubusercontent.com%2Fp4535992%2Finventory-plus%2Fmaster%2Fsrc%2Fmodule.json&label=Latest%20Release&prefix=v&query=$.version&colorB=red&style=for-the-badge)

[![Foundry Hub Endorsements](https://img.shields.io/endpoint?logoColor=white&url=https%3A%2F%2Fwww.foundryvtt-hub.com%2Fwp-json%2Fhubapi%2Fv1%2Fpackage%2Finventory-plus%2Fshield%2Fendorsements&style=for-the-badge)](https://www.foundryvtt-hub.com/package/inventory-plus/)

![GitHub all releases](https://img.shields.io/github/downloads/p4535992/inventory-plus/total?style=for-the-badge)

### If you want to buy me a coffee [![alt-text](https://img.shields.io/badge/-Patreon-%23ff424d?style=for-the-badge)](https://www.patreon.com/p4535992) or if you want to support the original author with paypal  to felix.mueller.86@web.de

A Foundry VTT module to enhance the dnd5e inventory. Allows to customize your Inventory in various ways, transfer items instead duplicate between character sheet, ordering the items, and many other feature hidden under the hood.

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

## Features

Due to collisions, code maintenance problems, and **reduction in the number of modules** I have rewritten for the inherent use of the module some features of other modules, mentioned in the _credits_ of this document. I invite you to support these authors in their various kofis and patreons. Each feature is non-blocking with the other modules and can be activated / deactivated from a specific module setting, which we list below

**Feature: Enable item transfer:** Know that you can temporarily disable the transfer feature by pressing the alt key while you move the item.

**[Only with 'Feature: Enable item transfer' enabled] Enable currency transfer:** When moving an object named \"Currency\" is transferer it will open a dialog to transfer money instead of transferring the actual item.",

**[Only with 'Feature: Enable item transfer' enabled] Enable for actors of the same type**: If disabled you will have to rely on the pairs you can define by hand.

**[Only with 'Feature: Enable item transfer' enabled] Compatible Actor Types:** The body of a JSON map of compatible actor type key-value pairs allowing transfer. By default this module only works between actor sheets of the same type, but some game systems may have other combinations that work. Example 1: \"character\":\"synthetic\",\"synthetic\":\"vehicles\",\"vehicles\":\"character\". Example 2 (for DnD5e): \"character\":\"vehicle\",\"vehicle\":\"character\" that would enable moving item between characters and vehicles. You can also have multiple actor types as value, example 3: \"character\":[\"vehicle\", \"character\"],\"vehicle\":\"character\" would enable transfer from character to vehicle, from character to character and from vehicle to character but NOT from vehicle to vehicle (providing that the \"actors of the same type\" checkbox is unchecked).",

**Feature: Enable inventory sorter:** Automatically sorts all actors' items (inventory, features, and spells) alphabetically (within each category).

**Feature: Equipment Multiplier:** Apply a weight multiplier to equipped items

**[Only with 'Feature: Equipment Multiplier' enabled] Equipment Multiplier value:** What weight multiplier to apply to equipped items

## API

### game.modules.get('inventory-plus').api.calculateWeightFromActor(actorIdOrName:string) ⇒ <code>number</code>

A method to calculate the weight (the one from the module filters) on the actor

**Returns**: <code>number</code>

| Param | Type | Description | Default |
| --- | --- | --- | --- |
| actorIdOrName | <code>string</code> | The actro id or name (if founded) | <code>undefined</code> |

### game.modules.get('inventory-plus').api.calculateWeight(inventory: Category[], currency: number) ⇒ <code>number</code>

A method to calculate the weight (the one from the module filters) on inventory array and the current currency present on the actor

The `Category` object is represented like this:
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

# Build

## Install all packages

```bash
npm install
```
## npm build scripts

### build

will build the code and copy all necessary assets into the dist folder and make a symlink to install the result into your foundry data; create a
`foundryconfig.json` file with your Foundry Data path.

```json
{
  "dataPath": "~/.local/share/FoundryVTT/"
}
```

`build` will build and set up a symlink between `dist` and your `dataPath`.

```bash
npm run-script build
```

### NOTE:

You don't need to build the `foundryconfig.json` file you can just copy the content of the `dist` folder on the module folder under `modules` of Foundry

### build:watch

`build:watch` will build and watch for changes, rebuilding automatically.

```bash
npm run-script build:watch
```

### clean

`clean` will remove all contents in the dist folder (but keeps the link from build:install).

```bash
npm run-script clean
```
### lint and lintfix

`lint` launch the eslint process based on the configuration [here](./.eslintrc)

```bash
npm run-script lint
```

`lintfix` launch the eslint process with the fix argument

```bash
npm run-script lintfix
```

### prettier-format

`prettier-format` launch the prettier plugin based on the configuration [here](./.prettierrc)

```bash
npm run-script prettier-format
```

### package

`package` generates a zip file containing the contents of the dist folder generated previously with the `build` command. Useful for those who want to manually load the module or want to create their own release

```bash
npm run-script package
```

## [Changelog](./changelog.md)

## Issues

Any issues, bugs, or feature requests are always welcome to be reported directly to the [Issue Tracker](https://github.com/p4535992/environment-interactionenvironment-interaction-multisystem/issues ), or using the [Bug Reporter Module](https://foundryvtt.com/packages/bug-reporter/).

## License

- **[Transfer Stuff](https://github.com/playest/TransferStuff)** : [GPL-3.0 License](https://github.com/playest/TransferStuff/blob/main/LICENSE)
- **[Encumbrance calculator 5e](https://github.com/kandashi/encumbrance-calculator-5e)** : [MIT](https://github.com/kandashi/encumbrance-calculator-5e/blob/master/LICENSE)
- **[Illandril's Inventory Sorter (5e)](https://github.com/illandril/FoundryVTT-inventory-sorter)** : [MIT](https://github.com/illandril/FoundryVTT-inventory-sorter/blob/master/LICENSE)

This package is under an [GPL-3.0 License](LICENSE) and the [Foundry Virtual Tabletop Limited License Agreement for module development](https://foundryvtt.com/article/license/).

## Credits

- [playest](https://github.com/playest) for the module [Transfer Stuff](https://github.com/playest/TransferStuff)
- [kandashi](https://github.com/kandashi) for the module [Encumbrance calculator 5e](https://github.com/kandashi/encumbrance-calculator-5e)
- [illandril](https://github.com/illandril) for the module [Illandril's Inventory Sorter (5e)](https://github.com/illandril/FoundryVTT-inventory-sorter)

## Acknowledgements

Bootstrapped with League of Extraordinary FoundryVTT Developers  [foundry-vtt-types](https://github.com/League-of-Foundry-Developers/foundry-vtt-types).
