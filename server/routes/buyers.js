const { Router } = require('express');
const buyerService = require('../services/BuyerService');

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const { from, to } = req.query;
    const buyers = await buyerService.getByDateRange(from, to);
    res.json(buyers);
  } catch (err) {
    next(err);
  }
});

router.get('/purchases', async (req, res, next) => {
  try {
    const { from, to } = req.query;
    const buyers = await buyerService.getWithPurchaseCount(from, to);
    res.json(buyers);
  } catch (err) {
    next(err);
  }
});

module.exports = router;