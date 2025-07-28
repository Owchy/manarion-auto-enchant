# manarion-auto-enchant
Smart auto-enchant script for Manarion guild members using Tampermonkey

# Manarion Auto-Enchant

A smart [Tampermonkey](https://www.tampermonkey.net/) userscript that automates gear enchanting for all guild members in the browser-based idle game [Manarion](https://manarion.com).

## Features

- Detects class and role of each guild member based on weapon type
- ⚔Applies valid enchants based on gear slot and class rules
- Elemental logic support for Battlers (Fire, Water, Nature)
- Dry-run mode with console logging (safe testing)
- Waits between actions to avoid triggering anti-bot detection
- Adds an in-game button to control execution

## How It Works

| Gear Slot | Enchant | Who Gets It |
|-----------|---------|--------------|
| Weapon | Inferno / Tidal Wrath / Wildheart | Battlers only (1 based on element) |
| Head   | Insight | Everyone |
| Neck   | Bountiful Harvest | Gatherers only |
| Back   | Fire/Water/Nature Resistance | Battlers only (match element) |
| Chest  | Prosperity | Everyone (mostly Battlers) |
| Hands  | Fortune | Everyone |
| Feet   | Growth | Everyone |
| Ring   | Vitality | Battlers only |

Class detection is based on the member’s weapon name:
- **“Axe”** = Woodcutter
- **“Pickaxe”** = Miner
- **“Rod”** = Fisher
- **“Staff of Fire/Water/Nature”** = Battler

## Installation

1. Install the [Tampermonkey extension](https://tampermonkey.net/)
2. Click [here to install the script](https://github.com/YOUR_USERNAME/manarion-auto-enchant/raw/main/manarion-auto-enchant.user.js)
3. Visit your Manarion guild page
4. Click the **“Dry Run: Auto-Enchant”** button

> To perform real enchants, edit the script and change:
```js
const dryRun = false;
