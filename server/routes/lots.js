const { Router } = require('express');
const auth = require('../middleware/auth');
const role = require('../middleware/role');
const lotService = require('../services/LotService');

const router = Router();

router.get('/auction/:auctionId', async (req, res, next) => {
  try {
    const lots = await lotService.getByAuction(req.params.auctionId);
    res.json(lots);
  } catch (err) {
    next(err);
  }
});

router.get('/sold', async (req, res, next) => {
  try {
    const { from, to } = req.query;
    const lots = await lotService.getSoldByDateRange(from, to);
    res.json(lots);
  } catch (err) {
    next(err);
  }
});

router.post('/', auth, role('admin'), async (req, res, next) => {
  try {
    const lot = await lotService.create(req.body);
    res.status(201).json(lot);
  } catch (err) {
    next(err);
  }
});

router.get('/my', auth, role('seller'), async (req, res, next) => {
  try {
    const lots = await lotService.getBySeller(req.user.id);
    res.json(lots);
  } catch (err) {
    next(err);
  }
});

router.put('/:id/withdraw', auth, role('seller'), async (req, res, next) => {
  try {
    const lot = await lotService.withdraw(req.params.id, req.user.id);
    res.json(lot);
  } catch (err) {
    next(err);
  }
});

module.exports = router;