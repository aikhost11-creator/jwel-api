/**
 * Adds jewellery theme columns to the connected database and db.sql.
 * Safe to re-run: duplicate columns are skipped.
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

const ALTERS = [
    "ALTER TABLE siteconfig ADD COLUMN secondaryColor VARCHAR(20) NOT NULL DEFAULT '#3d2b1f'",
    "ALTER TABLE siteconfig ADD COLUMN accentColor VARCHAR(20) NOT NULL DEFAULT '#c4a265'",
    "ALTER TABLE siteconfig ADD COLUMN backgroundColor VARCHAR(20) NOT NULL DEFAULT '#faf7f2'",
    "ALTER TABLE siteconfig ADD COLUMN headingColor VARCHAR(20) NOT NULL DEFAULT '#1c1410'",
    "ALTER TABLE siteconfig ADD COLUMN textColor VARCHAR(20) NOT NULL DEFAULT '#6b5e52'",
    "ALTER TABLE siteconfig ADD COLUMN headingFont VARCHAR(80) NOT NULL DEFAULT 'Cormorant Garamond'",
    "ALTER TABLE siteconfig ADD COLUMN bodyFont VARCHAR(80) NOT NULL DEFAULT 'Outfit'",
    "ALTER TABLE siteconfig ADD COLUMN tagline VARCHAR(255) DEFAULT NULL"
];

const MARQUEE = JSON.stringify([
    { emoji: '✦', text: 'Complimentary shipping on prepaid orders' },
    { emoji: '◆', text: 'Hallmarked gold and certified stones' },
    { emoji: '✧', text: 'Easy returns within 7 days' },
    { emoji: '◈', text: 'Quick checkout available' }
]);

const CATEGORIES = ['Rings', 'Necklaces', 'Earrings', 'Bracelets', 'Bangles', 'Pendants'];

function patchSqlFile() {
    const file = path.join(__dirname, '..', '..', 'db.sql');
    let sql = fs.readFileSync(file, 'utf8');
    if (!sql.includes('`secondaryColor`')) {
        const re = /`buyNowSubtext` varchar\(200\) DEFAULT NULL,\r?\n  `created_at` datetime NOT NULL,/;
        if (!re.test(sql)) throw new Error('db.sql siteconfig block was not found');
        sql = sql.replace(
            re,
            "`buyNowSubtext` varchar(200) DEFAULT NULL,\n" +
            "  `secondaryColor` varchar(20) NOT NULL DEFAULT '#3d2b1f',\n" +
            "  `accentColor` varchar(20) NOT NULL DEFAULT '#c4a265',\n" +
            "  `backgroundColor` varchar(20) NOT NULL DEFAULT '#faf7f2',\n" +
            "  `headingColor` varchar(20) NOT NULL DEFAULT '#1c1410',\n" +
            "  `textColor` varchar(20) NOT NULL DEFAULT '#6b5e52',\n" +
            "  `headingFont` varchar(80) NOT NULL DEFAULT 'Cormorant Garamond',\n" +
            "  `bodyFont` varchar(80) NOT NULL DEFAULT 'Outfit',\n" +
            "  `tagline` varchar(255) DEFAULT NULL,\n" +
            "  `created_at` datetime NOT NULL,"
        );
    }
    if (!sql.includes('Jewelry theme defaults')) {
        sql += `

-- Jewelry theme defaults
UPDATE \`siteconfig\` SET
  \`primaryColor\` = '#1c1410',
  \`secondaryColor\` = '#3d2b1f',
  \`accentColor\` = '#c4a265',
  \`backgroundColor\` = '#faf7f2',
  \`headingColor\` = '#1c1410',
  \`textColor\` = '#6b5e52',
  \`headingFont\` = 'Cormorant Garamond',
  \`bodyFont\` = 'Outfit',
  \`tagline\` = 'Fine jewellery, made to be lived in.',
  \`buyNowText\` = 'Buy Now',
  \`buyNowSubtext\` = 'Quick checkout',
  \`marqueeItems\` = '${MARQUEE.replace(/'/g, "''")}',
  \`siteName\` = CASE
      WHEN \`siteName\` IS NULL OR \`siteName\` = '' OR \`siteName\` LIKE '%FULFILL%' THEN 'Alpha Jewel'
      ELSE \`siteName\`
  END
WHERE \`id\` = 1;
`;
    }
    fs.writeFileSync(file, sql);
    console.log('db.sql updated');
}

async function main() {
    patchSqlFile();
    const conn = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: Number(process.env.DB_PORT || 3306)
    });

    for (const statement of ALTERS) {
        try {
            await conn.query(statement);
            console.log('column added');
        } catch (err) {
            if (err.code !== 'ER_DUP_FIELDNAME') throw err;
            console.log('column exists');
        }
    }

    const [result] = await conn.query(
        `UPDATE siteconfig SET
            siteName = CASE
                WHEN siteName IS NULL OR siteName = '' OR siteName LIKE '%FULFILL%' THEN 'Alpha Jewel'
                ELSE siteName
            END,
            primaryColor = '#1c1410',
            secondaryColor = '#3d2b1f',
            accentColor = '#c4a265',
            backgroundColor = '#faf7f2',
            headingColor = '#1c1410',
            textColor = '#6b5e52',
            headingFont = 'Cormorant Garamond',
            bodyFont = 'Outfit',
            tagline = 'Fine jewellery, made to be lived in.',
            buyNowText = 'Buy Now',
            buyNowSubtext = 'Quick checkout',
            marqueeItems = ?
         WHERE id = 1`,
        [MARQUEE]
    );
    console.log('theme rows updated:', result.affectedRows);

    const [[{ total }]] = await conn.query('SELECT COUNT(*) AS total FROM categories');
    if (Number(total) === 0) {
        for (let i = 0; i < CATEGORIES.length; i++) {
            await conn.query(
                `INSERT INTO categories (name, image, parentId, sortOrder, isActive, created_at, updated_at)
                 VALUES (?, NULL, NULL, ?, 1, NOW(), NOW())`,
                [CATEGORIES[i], i + 1]
            );
        }
        console.log('categories seeded:', CATEGORIES.length);
    } else {
        console.log('categories kept:', Number(total));
    }

    await conn.end();
    console.log('live database ready');
}

main().catch((err) => {
    console.error('theme apply failed:', err.message);
    process.exit(1);
});
