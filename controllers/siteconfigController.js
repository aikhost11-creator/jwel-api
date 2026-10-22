const Siteconfigs = require('../models/siteconfigModel');

// ── In-memory cache — siteconfig rarely changes ───────────────────────────────
let _cache = null;
let _cacheTime = 0;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

function invalidateCache() { _cache = null; _cacheTime = 0; }

const JEWEL_MARQUEE = [
    { emoji: '✦', text: 'Complimentary shipping on prepaid orders' },
    { emoji: '◆', text: 'Hallmarked gold and certified stones' },
    { emoji: '✧', text: 'Easy returns within 7 days' },
    { emoji: '◈', text: 'Quick checkout available' }
];

function publicView(d = {}) {
    let marquee = d.marqueeItems;
    if (typeof marquee === 'string') {
        try { marquee = JSON.parse(marquee); } catch { marquee = null; }
    }
    return {
        siteName: d.siteName || 'Alpha Jewel',
        clientUrl: d.clientUrl || null,
        logo: d.logo || null,
        whiteLogo: d.whiteLogo || null,
        icon: d.icon || null,
        tagline: d.tagline || 'Fine jewellery, made to be lived in.',
        instagramURL: d.instagramURL || null,
        facebookURL: d.facebookURL || null,
        twitterURL: d.twitterURL || null,
        linkedInURL: d.linkedInURL || null,
        youtubeURL: d.youtubeURL || null,
        mobile: d.mobile || null,
        email: d.email || null,
        currency: d.currency || '₹',
        deliveryCharge: d.deliveryCharge ?? 0,
        primaryColor: d.primaryColor || '#1c1410',
        secondaryColor: d.secondaryColor || '#3d2b1f',
        accentColor: d.accentColor || '#c4a265',
        backgroundColor: d.backgroundColor || '#faf7f2',
        headingColor: d.headingColor || '#1c1410',
        textColor: d.textColor || '#6b5e52',
        headingFont: d.headingFont || 'Cormorant Garamond',
        bodyFont: d.bodyFont || 'Outfit',
        marqueeItems: Array.isArray(marquee) && marquee.length ? marquee : JEWEL_MARQUEE,
        metaPixelId: d.metaPixelId || null,
        metaAccessToken: d.metaAccessToken || null,
        buyNowText: d.buyNowText || 'Buy Now',
        buyNowSubtext: d.buyNowSubtext || null,
    };
}

exports.getForUi = async (req, res) => {
    try {
        const now = Date.now();
        if (_cache && (now - _cacheTime) < CACHE_TTL_MS) {
            return res.status(200).json({ status: 'success', data: publicView(_cache.data?.[0] || {}) });
        }

        const results = await Siteconfigs.getAll();
        _cache = results;
        _cacheTime = now;

        res.set('Cache-Control', 'public, max-age=30, stale-while-revalidate=60');
        res.status(200).json({ status: 'success', data: publicView(results.data?.[0] || {}) });
    } catch (err) {
        console.error('Error in getForUi:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};


exports.createSiteconfig = async (req, res) => {
    try {
        const result = await Siteconfigs.create(req.body);
        invalidateCache();
        res.status(201).json({ message: 'Siteconfig created', id: result.insertId });
    } catch (err) {
        console.error('Error creating Siteconfig:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.getAllSiteconfigs = async (req, res) => {
    try {
        // Serve from cache if fresh
        const now = Date.now();
        if (_cache && (now - _cacheTime) < CACHE_TTL_MS) {
            return res.status(200).json(_cache);
        }

        const results = await Siteconfigs.getAll();

        // Cache the result
        _cache = results;
        _cacheTime = now;

        // HTTP cache headers — browser/CDN can cache for 60s
        res.set('Cache-Control', 'public, max-age=60, stale-while-revalidate=300');
        res.status(200).json(results);
    } catch (err) {
        console.error('Error fetching Siteconfigs:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.updateSiteconfig = async (req, res) => {
    const id = req.params.id;
    try {
        await Siteconfigs.update(id, req.body, req.userDetails);
        invalidateCache(); // bust cache on update
        res.status(200).json({ message: 'Siteconfig updated' });
    } catch (err) {
        console.error('Error updating Siteconfig:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.deleteSiteconfig = async (req, res) => {
    const id = req.params.id;
    try {
        await Siteconfigs.delete(id);
        invalidateCache();
        res.status(200).json({ message: 'Siteconfig deleted' });
    } catch (err) {
        console.error('Error deleting Siteconfig:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};
