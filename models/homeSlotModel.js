const db = require('../config/db');

const DEFAULTS = [
    { slotKey: 'perk_1', label: null, link: null, sortOrder: 1 },
    { slotKey: 'perk_2', label: null, link: null, sortOrder: 2 },
    { slotKey: 'perk_3', label: null, link: null, sortOrder: 3 },
    { slotKey: 'perk_4', label: null, link: null, sortOrder: 4 },
    { slotKey: 'audience_him', label: 'Shop for him', link: '/shop', sortOrder: 5 },
    { slotKey: 'audience_her', label: 'Shop for her', link: '/shop', sortOrder: 6 },
    { slotKey: 'banner_campaign', label: null, link: null, sortOrder: 7 },
    { slotKey: 'banner_mid', label: null, link: null, sortOrder: 8 },
    { slotKey: 'gift_title', label: 'Gifting made easy', link: null, sortOrder: 9 },
    { slotKey: 'gift_1', label: null, link: null, sortOrder: 10 },
    { slotKey: 'gift_2', label: null, link: null, sortOrder: 11 },
    { slotKey: 'gift_3', label: null, link: null, sortOrder: 12 },
    { slotKey: 'banner_bottom', label: null, link: null, sortOrder: 13 },
    { slotKey: 'story_banner', label: null, link: '/shop', sortOrder: 14 },
    { slotKey: 'story_1', label: null, link: '/shop', sortOrder: 15 },
    { slotKey: 'story_2', label: null, link: '/shop', sortOrder: 16 },
    { slotKey: 'story_3', label: null, link: '/shop', sortOrder: 17 },
    { slotKey: 'story_4', label: null, link: '/shop', sortOrder: 18 },
    { slotKey: 'bond_title', label: 'Shop by Bond', link: null, sortOrder: 19 },
    { slotKey: 'bond_1', label: 'Mother', link: '/shop', sortOrder: 20 },
    { slotKey: 'bond_2', label: 'Husband', link: '/shop', sortOrder: 21 },
    { slotKey: 'bond_3', label: 'Wife', link: '/shop', sortOrder: 22 },
    { slotKey: 'bond_4', label: 'Sister', link: '/shop', sortOrder: 23 },
    { slotKey: 'bond_5', label: 'Brother', link: '/shop', sortOrder: 24 },
    { slotKey: 'bond_6', label: 'Friends', link: '/shop', sortOrder: 25 },
    { slotKey: 'bond_7', label: 'Father', link: '/shop', sortOrder: 26 },
    { slotKey: 'bond_8', label: 'Daughter', link: '/shop', sortOrder: 27 },
    { slotKey: 'bond_9', label: 'Son', link: '/shop', sortOrder: 28 },
    { slotKey: 'bond_banner', label: null, link: '/shop', sortOrder: 29 },
];

const ALLOWED = new Set(DEFAULTS.map((row) => row.slotKey));

const HomeSlot = {
    ensureDefaults: async () => {
        for (const row of DEFAULTS) {
            await db.execute(
                `INSERT IGNORE INTO home_slots (slotKey, label, link, sortOrder, isActive, created_at, updated_at)
                 VALUES (?, ?, ?, ?, 1, NOW(), NOW())`,
                [row.slotKey, row.label, row.link, row.sortOrder]
            );
        }
    },

    getAll: async () => {
        await HomeSlot.ensureDefaults();
        const [rows] = await db.execute(
            `SELECT * FROM home_slots ORDER BY sortOrder ASC, id ASC`
        );
        return rows;
    },

    getActive: async () => {
        await HomeSlot.ensureDefaults();
        const [rows] = await db.execute(
            `SELECT slotKey, label, image, link, sortOrder FROM home_slots
             WHERE isActive = 1 ORDER BY sortOrder ASC, id ASC`
        );
        return rows;
    },

    save: async (slotKey, data) => {
        if (!ALLOWED.has(slotKey)) {
            throw Object.assign(new Error('Unknown slot'), { status: 400 });
        }
        await HomeSlot.ensureDefaults();
        await db.execute(
            `UPDATE home_slots
             SET label = ?, image = ?, link = ?, isActive = ?, updated_at = NOW()
             WHERE slotKey = ?`,
            [
                data.label ? String(data.label).trim() : null,
                data.image ? String(data.image).trim() : null,
                data.link ? String(data.link).trim() : null,
                data.isActive ? 1 : 0,
                slotKey,
            ]
        );
    },
};

module.exports = HomeSlot;
