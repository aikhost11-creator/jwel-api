/**
 * Seeds jewellery categories, products, home banners and promo tiles
 * into the connected database, and appends the same seed to db.sql.
 * Safe to re-run: existing jewellery slugs are skipped.
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

const photo = (id, w = 1400) =>
    `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;

const CATEGORY_IMAGES = {
    Rings: photo('photo-1605100804763-247f67b3557e', 900),
    Necklaces: photo('photo-1599643478518-a784e5dc4c8f', 900),
    Earrings: photo('photo-1535632066927-ab7c9ab60908', 900),
    Bracelets: photo('photo-1611591437281-460bfbe1220a', 900),
    Bangles: photo('photo-1611652022419-a9419f74343d', 900),
    Pendants: photo('photo-1599643477877-530eb83abc8e', 900)
};

const size = (price, sale) => ({
    name: 'Size',
    options: ['6', '7', '8', '9'].map((label) => ({ label, price, salePrice: sale }))
});

const PRODUCTS = [
    {
        category: 'Rings', name: 'Aurelia Solitaire Ring', slug: 'aj-aurelia-solitaire-ring', sku: 'AJ-RNG-001',
        price: 42999, salePrice: 36999, badge: 'Bestseller', resultTag: 'Hallmarked gold', isFeatured: 1, sortOrder: 1,
        avgRating: 4.9, reviewCount: 36,
        shortDescription: 'A round brilliant centre held in a fine halo, made to be worn every day.',
        images: [photo('photo-1605100804763-247f67b3557e'), photo('photo-1603561591411-07134e71a2a9')],
        benefits: ['18k hallmarked gold', 'Certified centre stone', 'Comfort-fit band'],
        tags: ['ring', 'solitaire', 'gold']
    },
    {
        category: 'Rings', name: 'Noor Twin Band', slug: 'aj-noor-twin-band', sku: 'AJ-RNG-002',
        price: 18999, salePrice: 15499, badge: 'New', resultTag: 'Stacking pair', isFeatured: 0, sortOrder: 2,
        avgRating: 4.7, reviewCount: 18,
        shortDescription: 'Two slim bands, one plain and one pavé, meant to be worn together.',
        images: [photo('photo-1603561596112-0a132b757442'), photo('photo-1543294001-f7cd5d7fb516')],
        benefits: ['Stackable pair', 'Lightweight', 'Rhodium finish'],
        tags: ['ring', 'band', 'stack']
    },
    {
        category: 'Rings', name: 'Maison Signet Ring', slug: 'aj-maison-signet-ring', sku: 'AJ-RNG-003',
        price: 12499, salePrice: 9999, badge: null, resultTag: 'Polished gold', isFeatured: 0, sortOrder: 3,
        avgRating: 4.6, reviewCount: 11,
        shortDescription: 'A smooth oval face with a quiet bevel, for everyday gold.',
        images: [photo('photo-1617038260897-41a1f14a8ca0'), photo('photo-1605100804763-247f67b3557e')],
        benefits: ['Solid feel', 'Engraving ready', 'Unisex fit'],
        tags: ['ring', 'signet']
    },
    {
        category: 'Necklaces', name: 'Céleste Pearl Strand', slug: 'aj-celeste-pearl-strand', sku: 'AJ-NCK-001',
        price: 28999, salePrice: 24999, badge: 'Bestseller', resultTag: 'Freshwater pearls', isFeatured: 1, sortOrder: 4,
        avgRating: 4.8, reviewCount: 29,
        shortDescription: 'Hand-knotted pearls with a small gold clasp, falling just at the collarbone.',
        images: [photo('photo-1599643478518-a784e5dc4c8f'), photo('photo-1515562141207-7a88fb7ce338')],
        benefits: ['Hand knotted', 'Gold clasp', 'Gift ready'],
        tags: ['necklace', 'pearl']
    },
    {
        category: 'Necklaces', name: 'Sera Gold Chain', slug: 'aj-sera-gold-chain', sku: 'AJ-NCK-002',
        price: 15999, salePrice: 12999, badge: null, resultTag: 'Everyday chain', isFeatured: 1, sortOrder: 5,
        avgRating: 4.7, reviewCount: 22,
        shortDescription: 'A fine trace chain that sits close to the neck and layers cleanly.',
        images: [photo('photo-1611652022419-a9419f74343d'), photo('photo-1599643477877-530eb83abc8e')],
        benefits: ['Layering length', 'Secure clasp', 'Hallmarked'],
        tags: ['necklace', 'chain']
    },
    {
        category: 'Necklaces', name: 'Lumen Tennis Necklace', slug: 'aj-lumen-tennis-necklace', sku: 'AJ-NCK-003',
        price: 54999, salePrice: 47999, badge: 'Limited', resultTag: 'Line of stones', isFeatured: 0, sortOrder: 6,
        avgRating: 4.9, reviewCount: 14,
        shortDescription: 'A continuous line of matched stones in a low four-prong setting.',
        images: [photo('photo-1573408301185-9146fe634ad0'), photo('photo-1515562141207-7a88fb7ce338')],
        benefits: ['Matched stones', 'Secure box clasp', 'Evening or day'],
        tags: ['necklace', 'tennis']
    },
    {
        category: 'Earrings', name: 'Étoile Diamond Studs', slug: 'aj-etoile-diamond-studs', sku: 'AJ-EAR-001',
        price: 21999, salePrice: 18499, badge: 'Bestseller', resultTag: 'Stud pair', isFeatured: 1, sortOrder: 7,
        avgRating: 4.9, reviewCount: 41,
        shortDescription: 'A classic stud pair with a low profile, finished with screw backs.',
        images: [photo('photo-1535632066927-ab7c9ab60908'), photo('photo-1588444837495-c6cfeb53f32d')],
        benefits: ['Screw backs', 'Everyday weight', 'Gift box included'],
        tags: ['earrings', 'studs']
    },
    {
        category: 'Earrings', name: 'Mira Gold Hoops', slug: 'aj-mira-gold-hoops', sku: 'AJ-EAR-002',
        price: 8999, salePrice: 7499, badge: 'New', resultTag: 'Light hoops', isFeatured: 0, sortOrder: 8,
        avgRating: 4.6, reviewCount: 17,
        shortDescription: 'Small polished hoops with a hinged clasp that closes flush.',
        images: [photo('photo-1588444837495-c6cfeb53f32d'), photo('photo-1535632066927-ab7c9ab60908')],
        benefits: ['Hinged clasp', 'Lightweight', 'Polished finish'],
        tags: ['earrings', 'hoops']
    },
    {
        category: 'Earrings', name: 'Amara Drop Earrings', slug: 'aj-amara-drop-earrings', sku: 'AJ-EAR-003',
        price: 13999, salePrice: 11499, badge: null, resultTag: 'Evening drop', isFeatured: 0, sortOrder: 9,
        avgRating: 4.8, reviewCount: 13,
        shortDescription: 'A small stud releasing a single pear-shaped drop.',
        images: [photo('photo-1617038260897-41a1f14a8ca0'), photo('photo-1588444837495-c6cfeb53f32d')],
        benefits: ['Movement without weight', 'Secure butterfly', 'Paired by hand'],
        tags: ['earrings', 'drop']
    },
    {
        category: 'Bracelets', name: 'Vale Tennis Bracelet', slug: 'aj-vale-tennis-bracelet', sku: 'AJ-BRC-001',
        price: 32999, salePrice: 27999, badge: 'Bestseller', resultTag: 'Line bracelet', isFeatured: 1, sortOrder: 10,
        avgRating: 4.8, reviewCount: 19,
        shortDescription: 'A flexible line of stones with a hidden box clasp.',
        images: [photo('photo-1611591437281-460bfbe1220a'), photo('photo-1573408301185-9146fe634ad0')],
        benefits: ['Flexible fit', 'Box clasp', 'Safety latch'],
        tags: ['bracelet', 'tennis']
    },
    {
        category: 'Bracelets', name: 'Orla Open Cuff', slug: 'aj-orla-open-cuff', sku: 'AJ-BRC-002',
        price: 9999, salePrice: 8499, badge: null, resultTag: 'Open cuff', isFeatured: 0, sortOrder: 11,
        avgRating: 4.5, reviewCount: 9,
        shortDescription: 'A sculpted open cuff with a soft hammered face.',
        images: [photo('photo-1611591437281-460bfbe1220a'), photo('photo-1515562141207-7a88fb7ce338')],
        benefits: ['Adjustable opening', 'Hammered texture', 'One size'],
        tags: ['bracelet', 'cuff']
    },
    {
        category: 'Bangles', name: 'Temple Bangle Pair', slug: 'aj-temple-bangle-pair', sku: 'AJ-BNG-001',
        price: 16999, salePrice: 13999, badge: 'New', resultTag: 'Sold as a pair', isFeatured: 1, sortOrder: 12,
        avgRating: 4.7, reviewCount: 16,
        shortDescription: 'Two slim gold bangles with a fine milgrain edge.',
        images: [photo('photo-1611652022419-a9419f74343d'), photo('photo-1599643478518-a784e5dc4c8f')],
        benefits: ['Sold as a pair', 'Milgrain edge', 'Classic 2.4 size'],
        tags: ['bangle', 'gold']
    },
    {
        category: 'Bangles', name: 'Polished Gold Kada', slug: 'aj-polished-gold-kada', sku: 'AJ-BNG-002',
        price: 11999, salePrice: 9999, badge: null, resultTag: 'Daily kada', isFeatured: 0, sortOrder: 13,
        avgRating: 4.6, reviewCount: 12,
        shortDescription: 'A round polished kada with a smooth inner edge.',
        images: [photo('photo-1573408301185-9146fe634ad0'), photo('photo-1611652022419-a9419f74343d')],
        benefits: ['Smooth inner edge', 'Screw opening', 'Daily weight'],
        tags: ['bangle', 'kada']
    },
    {
        category: 'Pendants', name: 'Solitaire Pendant', slug: 'aj-solitaire-pendant', sku: 'AJ-PND-001',
        price: 14999, salePrice: 12499, badge: 'Bestseller', resultTag: 'With chain', isFeatured: 1, sortOrder: 14,
        avgRating: 4.8, reviewCount: 21,
        shortDescription: 'A single stone on a fine chain, the clasp sitting at the nape.',
        images: [photo('photo-1599643477877-530eb83abc8e'), photo('photo-1515562141207-7a88fb7ce338')],
        benefits: ['Chain included', 'Adjustable length', 'Gift pouch'],
        tags: ['pendant', 'solitaire']
    },
    {
        category: 'Pendants', name: 'Initial Pendant', slug: 'aj-initial-pendant', sku: 'AJ-PND-002',
        price: 7999, salePrice: 6499, badge: 'New', resultTag: 'Letter A', isFeatured: 0, sortOrder: 15,
        avgRating: 4.7, reviewCount: 8,
        shortDescription: 'A small serif initial on a trace chain. Letter A shown; others on request.',
        images: [photo('photo-1599643477877-530eb83abc8e'), photo('photo-1611652022419-a9419f74343d')],
        benefits: ['Serif letter', 'Trace chain', 'Made to order letters'],
        tags: ['pendant', 'initial']
    }
];

function productRow(item, categoryId) {
    const variants = [size(item.price, item.salePrice)];
    return {
        ...item,
        categoryId,
        description: `<p>${item.shortDescription}</p><p>Finished in hallmarked gold and checked by hand before it leaves the atelier. Quick checkout, insured packing, and an easy seven-day return.</p>`,
        variants,
        whyLoveIt: item.benefits
    };
}

function sqlString(value) {
    if (value === null || value === undefined) return 'NULL';
    return `'${String(value).replace(/\\/g, '\\\\').replace(/'/g, "''")}'`;
}

function buildSql(products) {
    const lines = ['', '-- Jewelry catalog seed'];
    lines.push(`UPDATE categories SET image = CASE name`);
    for (const [name, url] of Object.entries(CATEGORY_IMAGES)) {
        lines.push(`  WHEN ${sqlString(name)} THEN ${sqlString(url)}`);
    }
    lines.push(`  ELSE image END, updated_at = NOW() WHERE name IN (${Object.keys(CATEGORY_IMAGES).map(sqlString).join(', ')});`);
    lines.push(`UPDATE products SET isActive = 0, updated_at = NOW() WHERE name LIKE '%Cargo%' OR name LIKE '%Pant%' OR name LIKE '%Trackpant%';`);
    lines.push(`UPDATE home_banners SET isActive = 0, updated_at = NOW() WHERE url NOT LIKE '%images.unsplash.com%';`);

    for (const item of products) {
        const row = productRow(item, null);
        lines.push(`INSERT INTO products (name, slug, sku, description, shortDescription, resultTag, badge, price, salePrice, categoryId, images, variants, tags, benefits, whyLoveIt, avgRating, reviewCount, isActive, isFeatured, sortOrder, created_at, updated_at)
SELECT ${sqlString(row.name)}, ${sqlString(row.slug)}, ${sqlString(row.sku)}, ${sqlString(row.description)}, ${sqlString(row.shortDescription)}, ${sqlString(row.resultTag)}, ${sqlString(row.badge)}, ${row.price}, ${row.salePrice},
  (SELECT id FROM categories WHERE name = ${sqlString(item.category)} AND isActive = 1 ORDER BY id DESC LIMIT 1),
  ${sqlString(JSON.stringify(row.images))}, ${sqlString(JSON.stringify(row.variants))}, ${sqlString(JSON.stringify(row.tags))}, ${sqlString(JSON.stringify(row.benefits))}, ${sqlString(JSON.stringify(row.whyLoveIt))},
  ${row.avgRating}, ${row.reviewCount}, 1, ${row.isFeatured}, ${row.sortOrder}, NOW(), NOW()
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM products WHERE slug = ${sqlString(row.slug)});`);
    }

    const banners = [
        ['image', photo('photo-1515562141207-7a88fb7ce338', 1920), 0, sqlString('/shop'), 1],
        ['image', photo('photo-1605100804763-247f67b3557e', 1920), 0, `CONCAT('/category/', (SELECT id FROM categories WHERE name = 'Rings' AND isActive = 1 ORDER BY id DESC LIMIT 1))`, 2],
        ['image', photo('photo-1617038260897-41a1f14a8ca0', 900), 1, sqlString('/shop'), 1]
    ];
    for (const [type, url, mobile, redirectSql, sort] of banners) {
        lines.push(`INSERT INTO home_banners (type, url, forMobile, redirectionUrl, sortOrder, isActive, created_at, updated_at)
SELECT ${sqlString(type)}, ${sqlString(url)}, ${mobile}, ${redirectSql}, ${sort}, 1, NOW(), NOW()
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM home_banners WHERE url = ${sqlString(url)});`);
    }

    lines.push('');
    return lines.join('\n');
}

async function main() {
    const conn = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: Number(process.env.DB_PORT || 3306)
    });

    const ids = {};
    for (const [name, image] of Object.entries(CATEGORY_IMAGES)) {
        const [rows] = await conn.query(
            'SELECT id FROM categories WHERE name = ? AND isActive = 1 ORDER BY id DESC LIMIT 1',
            [name]
        );
        if (!rows.length) throw new Error(`Missing category: ${name}`);
        ids[name] = rows[0].id;
        await conn.query('UPDATE categories SET image = ?, updated_at = NOW() WHERE id = ?', [image, rows[0].id]);
    }

    const [hidden] = await conn.query(
        `UPDATE products SET isActive = 0, updated_at = NOW()
         WHERE name LIKE '%Cargo%' OR name LIKE '%Pant%' OR name LIKE '%Trackpant%'`
    );
    console.log('old products hidden:', hidden.affectedRows);

    let added = 0;
    for (const item of PRODUCTS) {
        const [existing] = await conn.query('SELECT id FROM products WHERE slug = ? LIMIT 1', [item.slug]);
        const row = productRow(item, ids[item.category]);
        if (existing.length) {
            await conn.query(
                `UPDATE products SET name=?, description=?, shortDescription=?, resultTag=?, badge=?, price=?, salePrice=?,
                 categoryId=?, images=?, variants=?, tags=?, benefits=?, whyLoveIt=?, avgRating=?, reviewCount=?,
                 isActive=1, isFeatured=?, sortOrder=?, updated_at=NOW() WHERE id=?`,
                [row.name, row.description, row.shortDescription, row.resultTag, row.badge, row.price, row.salePrice,
                    row.categoryId, JSON.stringify(row.images), JSON.stringify(row.variants), JSON.stringify(row.tags),
                    JSON.stringify(row.benefits), JSON.stringify(row.whyLoveIt), row.avgRating, row.reviewCount,
                    row.isFeatured, row.sortOrder, existing[0].id]
            );
        } else {
            await conn.query(
                `INSERT INTO products (name, slug, sku, description, shortDescription, resultTag, badge, price, salePrice,
                 categoryId, images, variants, tags, benefits, whyLoveIt, avgRating, reviewCount, isActive, isFeatured, sortOrder, created_at, updated_at)
                 VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,1,?,?,NOW(),NOW())`,
                [row.name, row.slug, row.sku, row.description, row.shortDescription, row.resultTag, row.badge, row.price, row.salePrice,
                    row.categoryId, JSON.stringify(row.images), JSON.stringify(row.variants), JSON.stringify(row.tags),
                    JSON.stringify(row.benefits), JSON.stringify(row.whyLoveIt), row.avgRating, row.reviewCount, row.isFeatured, row.sortOrder]
            );
            added += 1;
        }
    }
    console.log('products added:', added, 'updated rest');

    await conn.query(`UPDATE home_banners SET isActive = 0, updated_at = NOW() WHERE url NOT LIKE '%images.unsplash.com%'`);
    const banners = [
        ['image', photo('photo-1515562141207-7a88fb7ce338', 1920), 0, '/shop', 1],
        ['image', photo('photo-1605100804763-247f67b3557e', 1920), 0, `/category/${ids.Rings}`, 2],
        ['image', photo('photo-1617038260897-41a1f14a8ca0', 900), 1, '/shop', 1]
    ];
    for (const [type, url, mobile, redirect, sort] of banners) {
        const [found] = await conn.query('SELECT id FROM home_banners WHERE url = ? LIMIT 1', [url]);
        if (found.length) {
            await conn.query(
                'UPDATE home_banners SET type=?, forMobile=?, redirectionUrl=?, sortOrder=?, isActive=1, updated_at=NOW() WHERE id=?',
                [type, mobile, redirect, sort, found[0].id]
            );
        } else {
            await conn.query(
                `INSERT INTO home_banners (type, url, forMobile, redirectionUrl, sortOrder, isActive, created_at, updated_at)
                 VALUES (?,?,?,?,?,1,NOW(),NOW())`,
                [type, url, mobile, redirect, sort]
            );
        }
    }
    console.log('banners ready: 2 desktop, 1 mobile');

    await conn.query('DELETE FROM promo_banners');
    console.log('promo banners removed');

    const sqlFile = path.join(__dirname, '..', '..', 'db.sql');
    let sql = fs.readFileSync(sqlFile, 'utf8');
    const block = buildSql(PRODUCTS);
    const marker = '-- Jewelry catalog seed';
    const at = sql.indexOf(marker);
    if (at >= 0) sql = sql.slice(0, at).replace(/\s*$/, '\n') + block;
    else sql = sql.replace(/\s*$/, '\n') + block;
    fs.writeFileSync(sqlFile, sql);
    console.log('db.sql catalog seed written');

    const [[{ products }]] = await conn.query("SELECT COUNT(*) AS products FROM products WHERE isActive = 1 AND slug LIKE 'aj-%'");
    const [[{ bannersOn }]] = await conn.query('SELECT COUNT(*) AS bannersOn FROM home_banners WHERE isActive = 1');
    console.log(JSON.stringify({ activeJewelryProducts: Number(products), activeBanners: Number(bannersOn), categories: ids }));
    await conn.end();
}

main().catch((err) => {
    console.error('seed failed:', err.message);
    process.exit(1);
});
