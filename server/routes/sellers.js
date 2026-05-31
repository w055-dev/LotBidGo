const { Router } = require('express');
const sellerService = require('../services/SellerService');

const router = Router();

router.get('/revenue', async (req, res, next) => {
  try {
    const { from, to } = req.query;
    const sellers = await sellerService.getWithRevenue(from, to);
    res.json(sellers);
  } catch (err) {
    next(err);
  }
});

router.get('/participants', async (req, res, next) => {
  try {
    const { from, to } = req.query;
    const sellers = await sellerService.getParticipants(from, to);
    res.json(sellers);
  } catch (err) {
    next(err);
  }
});

module.exports = router;