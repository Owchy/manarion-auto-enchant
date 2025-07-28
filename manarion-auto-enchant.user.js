// ==UserScript==
// @name         Manarion Auto-Enchant (Smart Version)
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Auto-enchant gear based on class detection and rules
// @match        https://manarion.com/guild*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    // CONFIG
    const dryRun = true; // Set to false to enable live enchanting
    const delayBetweenActions = 3000;

    const validEnchants = {
        battler: {
            Weapon: ["Inferno", "Tidal Wrath", "Wildheart"],
            Head: ["Insight"],
            Back: ["Fire Resistance", "Water Resistance", "Nature Resistance"],
            Chest: ["Prosperity"],
            Hands: ["Fortune"],
            Feet: ["Growth"],
            Ring: ["Vitality"]
        },
        gatherer: {
            Weapon: [],
            Head: ["Insight"],
            Neck: ["Bountiful Harvest"],
            Chest: ["Prosperity"],
            Hands: ["Fortune"],
            Feet: ["Growth"]
        }
    };

    function determineClass(weaponName) {
        const name = weaponName.toLowerCase();
        if (name.includes("staff of fire")) return { type: "battler", element: "Fire" };
        if (name.includes("staff of water")) return { type: "battler", element: "Water" };
        if (name.includes("staff of nature")) return { type: "battler", element: "Nature" };
        if (name.includes("axe")) return { type: "gatherer", role: "woodcutter" };
        if (name.includes("pickaxe")) return { type: "gatherer", role: "miner" };
        if (name.includes("rod")) return { type: "gatherer", role: "fisher" };
        return { type: "unknown" };
    }

    function delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async function runEnchantProcess() {
        const log = [];
        const rows = document.querySelectorAll('tr[data-slot="table-row"]');

        for (const row of rows) {
            const nameSpan = row.querySelector('span.cursor-pointer span');
            const name = nameSpan?.textContent.trim();
            nameSpan?.click();
            await waitFor(() => document.querySelector('div[role="menuitem"]'));

            const menuItem = [...document.querySelectorAll('div[role="menuitem"]')].find(el => el.textContent.trim() === 'View Profile');
            menuItem?.click();
            await waitFor(() => document.querySelector('[data-slot="card"]'));

            const gearDivs = document.querySelectorAll('[data-slot="card-content"] > div > div');
            let weaponName = "";
            const actions = [];

            for (const div of gearDivs) {
                const slot = div.querySelector('div.w-15')?.textContent.trim();
                const gearName = div.querySelector('span[data-item-id]')?.textContent;
                const enchantButton = div.querySelector('button');

                if (slot === "Weapon") weaponName = gearName;
                if (!slot || !gearName || !enchantButton) continue;

                const { type, element } = determineClass(weaponName);
                let allowed = validEnchants[type]?.[slot] || [];

                if (slot === "Weapon" && type === "battler") {
                    allowed = [
                        element === "Fire" ? "Inferno" :
                        element === "Water" ? "Tidal Wrath" :
                        element === "Nature" ? "Wildheart" : null
                    ].filter(Boolean);
                } else if (slot === "Back" && type === "battler") {
                    allowed = [`${element} Resistance`];
                }

                if (allowed.length > 0) {
                    if (!dryRun) enchantButton.click();
                    actions.push(`${slot}: ${gearName} → [${allowed.join(", ")}]");
                    if (!dryRun) {
                        await waitFor(() => document.querySelector('button:contains("Max")'));
                        [...document.querySelectorAll('button')].filter(b => b.textContent === "Max").forEach(b => b.click());
                        await delay(300);
                        [...document.querySelectorAll('button')].filter(b => b.textContent === "Confirm" && !b.disabled).forEach(b => b.click());
                        await delay(500);
                        const close = [...document.querySelectorAll('button')].find(b => b.textContent === "Close");
                        close?.click();
                    }
                }
            }

            const closeModal = [...document.querySelectorAll('button')].find(b => b.textContent === "Close");
            closeModal?.click();
            log.push(`✅ ${name}:\n` + actions.join("\n"));
            await delay(delayBetweenActions);
        }

        console.log("=== Enchanting Log ===");
        log.forEach(entry => console.log(entry));
        alert("Dry run complete. Check console for details.");
    }

    function waitFor(fn) {
        return new Promise(resolve => {
            const check = () => fn() ? resolve() : setTimeout(check, 100);
            check();
        });
    }

    // UI button
    const startBtn = document.createElement('button');
    startBtn.textContent = dryRun ? 'Dry Run: Auto-Enchant' : 'Start Auto-Enchant';
    Object.assign(startBtn.style, {
        position: 'fixed', top: '10px', right: '10px', zIndex: 9999,
        padding: '10px', background: dryRun ? '#f39c12' : '#27ae60',
        color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer'
    });
    startBtn.addEventListener('click', runEnchantProcess);
    document.body.appendChild(startBtn);
})();
