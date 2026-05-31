const { Router } = require('express');
const auth = require('../middleware/auth');
const role = require('../middleware/role');
const bidService = require('../services/BidService');

const router = Router();

router.post('/', auth, role('buyer'), async (req, res, next) => {
  try {
    const bid = await bidService.place(
      req.body.lotId,
      req.user.id,
      req.body.amount
    );
    res.status(201).json(bid);
  } catch (err) {
    next(err);
  }
});

router.get('/lot/:lotId', async (req, res, next) => {
  try {
    const bids = await bidService.getHistoryByLot(req.params.lotId);
    res.json(bids);
  } catch (err) {
    next(err);
  }
});

module.exports = router;