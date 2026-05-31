const { Router } = require('express');
const auth = require('../middleware/auth');
const role = require('../middleware/role');
const saleService = require('../services/SaleService');

const router = Router();

router.post('/', auth, role('admin'), async (req, res, next) => {
  try {
    const sale = await saleService.record(
      req.body.lotId,
      req.body.buyerId,
      req.body.finalPrice
    );
    res.status(201).json(sale);
  } catch (err) {
    next(err);
  }
});

router.get('/summary/:auctionId', auth, role('admin'), async (req, res, next) => {
  try {
    const summary = await saleService.getSummaryByAuction(req.params.auctionId);
    res.json(summary);
  } catch (err) {
    next(err);
  }
});

router.get('/my', auth, role('buyer'), async (req, res, next) => {
  try {
    const sales = await saleService.getByBuyer(req.user.id);
    res.json(sales);
  } catch (err) {
    next(err);
  }
});

router.get('/my-revenue', auth, role('seller'), async (req, res, next) => {
  try {
    const revenue = await saleService.getRevenueBySeller(req.user.id);
    res.json(revenue);
  } catch (err) {
    next(err);
  }
});

module.exports = router;