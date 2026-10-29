const HomeSlot = require('../models/homeSlotModel');

exports.getAll = async (req, res) => {
    try {
        const data = await HomeSlot.getAll();
        res.json({ status: 'success', data });
    } catch (err) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.getActive = async (req, res) => {
    try {
        const data = await HomeSlot.getActive();
        res.json({ status: 'success', data });
    } catch (err) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.save = async (req, res) => {
    try {
        await HomeSlot.save(req.params.slotKey, req.body || {});
        res.json({ status: 'success' });
    } catch (err) {
        res.status(err.status || 500).json({ error: err.status ? err.message : 'Internal server error' });
    }
};
