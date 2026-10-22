/**
 * Seeds five jewellery reels and removes promo banners
 * from the connected database and from db.sql.
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

const clip = (id) => `https://assets.mixkit.co/videos/${id}/${id}-720.mp4`;
const thumb = (id) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=640&q=80`;

const REELS = [
    { title: 'Aurelia on the hand', videoUrl: clip(20877), thumbnail: thumb('photo-1605100804763-247f67b3557e'), sortOrder: 1 },
    { title: 'Pearl strand', videoUrl: clip(5223), thumbnail: thumb('photo-1599643478518-a784e5dc4c8f'), sortOrder: 2 },
    { title: 'Studs in daylight', videoUrl: clip(5218), thumbnail: thumb('photo-1535632066927-ab7c9ab60908'), sortOrder: 3 },
    { title: 'Tennis bracelet', videoUrl: clip(2861), thumbnail: thumb('photo-1611591437281-460bfbe1220a'), sortOrder: 4 },
    { title: 'Gold in motion', videoUrl: clip(34427), thumbnail: thumb('photo-1515562141207-7a88fb7ce338'), sortOrder: 5 }
];

function sqlBlock() {
    const lines = [
        '',
        '-- Jewellery reels. Promo banners removed.',
        'DELETE FROM promo_banners;'
    ];
    for (const reel of REELS) {
        lines.push(`INSERT INTO reels (videoUrl, thumbnail, title, sortOrder, isActive, created_at, updated_at)
SELECT '${reel.videoUrl}', '${reel.thumbnail}', '${reel.title.replace(/'/g, "''")}', ${reel.sortOrder}, 1, NOW(), NOW()
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM reels WHERE videoUrl = '${reel.videoUrl}');`);
    }
    return lines.join('\n') + '\n';
}

async function main() {
    const conn = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: Number(process.env.DB_PORT || 3306)
    });

    const [gone] = await conn.query('DELETE FROM promo_banners');
    console.log('promo banners removed', gone.affectedRows);

    for (const reel of REELS) {
        const [found] = await conn.query('SELECT id FROM reels WHERE videoUrl = ? LIMIT 1', [reel.videoUrl]);
        if (found.length) {
            await conn.query(
                'UPDATE reels SET thumbnail=?, title=?, sortOrder=?, isActive=1, updated_at=NOW() WHERE id=?',
                [reel.thumbnail, reel.title, reel.sortOrder, found[0].id]
            );
        } else {
            await conn.query(
                `INSERT INTO reels (videoUrl, thumbnail, title, sortOrder, isActive, created_at, updated_at)
                 VALUES (?,?,?,?,1,NOW(),NOW())`,
                [reel.videoUrl, reel.thumbnail, reel.title, reel.sortOrder]
            );
        }
    }
    const [rows] = await conn.query('SELECT id, title, isActive FROM reels ORDER BY sortOrder ASC');
    console.log(rows);
    await conn.end();

    const sqlPath = path.join(__dirname, '..', '..', 'db.sql');
    let sql = fs.readFileSync(sqlPath, 'utf8');
    sql = sql.replace(/\nINSERT INTO promo_banners[\s\S]*?rowIndex = 1 AND colIndex = 0\);\n?/, '\n');
    const marker = '-- Jewellery reels. Promo banners removed.';
    const block = sqlBlock();
    const at = sql.indexOf(marker);
    if (at >= 0) sql = sql.slice(0, at).replace(/\s*$/, '\n') + block;
    else sql = sql.replace(/\s*$/, '\n') + block;
    fs.writeFileSync(sqlPath, sql);
    console.log('db.sql updated');
}

main().catch((err) => {
    console.error(err.message);
    process.exit(1);
});
