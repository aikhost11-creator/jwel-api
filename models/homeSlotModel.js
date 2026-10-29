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
