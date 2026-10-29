const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/homeSlotController');
const { auth } = require('../middlewares/auth.js');

router.get('/getActive', ctrl.getActive);
router.get('/getAll', auth, ctrl.getAll);
router.put('/save/:slotKey', auth, ctrl.save);

module.exports = router;
