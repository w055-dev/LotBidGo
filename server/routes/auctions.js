const { Router } = require('express');
const auth = require('../middleware/auth');
const role = require('../middleware/role');
const auctionService = require('../services/AuctionService');

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const { from, to } = req.query;
    let auctions;
    if (from && to) {
      auctions = await auctionService.getByDateRange(from, to);
    } else {
      auctions = await auctionService.getAll();
    }
    res.json(auctions);
  } catch (err) {
    next(err);
  }
});

router.get('/revenue', async (req, res, next) => {
  try {
    const auctions = await auctionService.getWithRevenue();
    res.json(auctions);
  } catch (err) {
    next(err);
  }
});

router.get('/location/:location', async (req, res, next) => {
  try {
    const auctions = await auctionService.getByLocation(req.params.location);
    res.json(auctions);
  } catch (err) {
    next(err);
  }
});

router.post('/', auth, role('admin'), async (req, res, next) => {
  try {
    const auction = await auctionService.create(req.body);
    res.status(201).json(auction);
  } catch (err) {
    next(err);
  }
});

router.post('/:id/start', auth, role('admin'), async (req, res, next) => {
  try {
    const auction = await auctionService.start(req.params.id);
    res.json(auction);
  } catch (err) {
    next(err);
  }
});

router.post('/:id/finish', auth, role('admin'), async (req, res, next) => {
  try {
    const auction = await auctionService.finish(req.params.id);
    res.json(auction);
  } catch (err) {
    next(err);
  }
});

module.exports = router;