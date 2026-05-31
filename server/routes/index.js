const { Router } = require('express');
const auctions = require('./auctions');
const lots = require('./lots');
const bids = require('./bids');
const sales = require('./sales');
const users = require('./users');
const sellers = require('./sellers');
const buyers = require('./buyers');
const exportsroutes = require('./exports');

const router = Router();

router.use('/auctions', auctions);
router.use('/lots', lots);
router.use('/bids', bids);
router.use('/sales', sales);
router.use('/sellers', sellers);
router.use('/buyers', buyers);
router.use('/exports', exportsroutes);
router.use('/', users);

module.exports = router;