const db = require('../config/db');

const DEFAULT_MARQUEE = JSON.stringify([
    { emoji: '✦', text: 'Complimentary shipping on prepaid orders' },
    { emoji: '◆', text: 'Hallmarked gold and certified stones' },
    { emoji: '✧', text: 'Easy returns within 7 days' },
    { emoji: '◈', text: 'Quick checkout available' }
]);

const siteconfig = {
    create: async (data) => {
        const sql = `INSERT INTO siteconfig
            (siteName, clientUrl, logo, whiteLogo, icon, instagramURL, facebookURL, twitterURL,
             linkedInURL, youtubeURL, mobile, email, currency, deliveryCharge, primaryColor, marqueeItems,
             metaPixelId, metaAccessToken,
             buyNowText, buyNowSubtext,
             created_at, updated_at)
            VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,NOW(),NOW())`;
        try {
            const [results] = await db.execute(sql, [
                data.siteName, data.clientUrl, data.logo, data.whiteLogo, data.icon,
                data.instagramURL, data.facebookURL, data.twitterURL, data.linkedInURL, data.youtubeURL,
                data.mobile, data.email,                 data.currency || '₹', data.deliveryCharge ?? 0,
                data.primaryColor || '#1c1410',
                data.marqueeItems ? JSON.stringify(data.marqueeItems) : DEFAULT_MARQUEE,
                data.metaPixelId || null,
                data.metaAccessToken || null,
                data.buyNowText || 'BUY NOW',
                data.buyNowSubtext || null
            ]);
            return { status: 'success', data: results };
        } catch (err) { throw err; }
    },

    getAll: async () => {
        try {
            const [results] = await db.execute(`SELECT * FROM siteconfig ORDER BY created_at DESC`);
            return {
                status: 'success',
                data: results.map(r => ({
                    ...r,
                    marqueeItems: r.marqueeItems
                        ? (typeof r.marqueeItems === 'string' ? JSON.parse(r.marqueeItems) : r.marqueeItems)
                        : JSON.parse(DEFAULT_MARQUEE)
                }))
            };
        } catch (err) { throw err; }
    },

    update: async (id, data) => {
        const marquee = data.marqueeItems
            ? (typeof data.marqueeItems === 'string' ? data.marqueeItems : JSON.stringify(data.marqueeItems))
            : null;
        const sqlUpdate = `UPDATE siteconfig SET
            siteName=?, clientUrl=?, logo=?, whiteLogo=?, icon=?, tagline=?,
            instagramURL=?, facebookURL=?, twitterURL=?, linkedInURL=?, youtubeURL=?,
            mobile=?, email=?, currency=?, deliveryCharge=?,
            primaryColor=?, secondaryColor=?, accentColor=?, backgroundColor=?,
            headingColor=?, textColor=?, headingFont=?, bodyFont=?,
            marqueeItems=?,
            metaPixelId=?, metaAccessToken=?,
            buyNowText=?, buyNowSubtext=?,
            updated_at=NOW() WHERE id=?`;
        try {
            const [results] = await db.execute(sqlUpdate, [
                data.siteName || null,
                data.clientUrl || null,
                data.logo || null,
                data.whiteLogo || null,
                data.icon || null,
                data.tagline || null,
                data.instagramURL || null,
                data.facebookURL || null,
                data.twitterURL || null,
                data.linkedInURL || null,
                data.youtubeURL || null,
                data.mobile || null,
                data.email || null,
                data.currency || '₹',
                data.deliveryCharge ?? 0,
                data.primaryColor || '#1c1410',
                data.secondaryColor || '#3d2b1f',
                data.accentColor || '#c4a265',
                data.backgroundColor || '#faf7f2',
                data.headingColor || '#1c1410',
                data.textColor || '#6b5e52',
                data.headingFont || 'Cormorant Garamond',
                data.bodyFont || 'Outfit',
                marquee,
                data.metaPixelId || null,
                data.metaAccessToken || null,
                data.buyNowText || 'Buy Now',
                data.buyNowSubtext || null,
                id
            ]);
            return { status: 'success', data: results };
        } catch (err) { throw err; }
    },

    delete: async (id) => {
        try {
            const [results] = await db.execute('DELETE FROM siteconfig WHERE id = ?', [id]);
            return results;
        } catch (err) { throw err; }
    }
};

module.exports = siteconfig;
