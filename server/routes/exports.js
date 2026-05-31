const { Router } = require('express');
const auth = require('../middleware/auth');
const role = require('../middleware/role');
const exportService = require('../services/ExportService');
const auctionService = require('../services/AuctionService');
const sellerService = require('../services/SellerService');
const buyerService = require('../services/BuyerService');
const lotService = require('../services/LotService');
const userService = require('../services/UserService');

const router = Router();

router.get('/auctions', auth, role('admin'), async (req, res, next) => {
  try {
    const data = await auctionService.getWithRevenue();
    const { buffer, filename } = await exportService.toExcel(data, [
      { header: 'ID', key: 'id', width: 10 },
      { header: 'Дата', key: 'date', width: 15 },
      { header: 'Место', key: 'location', width: 30 },
      { header: 'Формат', key: 'format', width: 12 },
      { header: 'Специфика', key: 'specification', width: 30 },
      { header: 'Всего лотов', key: 'total_lots', width: 14 },
      { header: 'Продано', key: 'sold_lots', width: 10 },
      { header: 'Выручка', key: 'total_revenue', width: 16 }
    ], 'auctions.xlsx');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
    res.send(buffer);
  } catch (err) {
    next(err);
  }
});

router.get('/lots/:auctionId', auth, role('admin'), async (req, res, next) => {
  try {
    const data = await lotService.getByAuction(req.params.auctionId);
    const { buffer, filename } = await exportService.toExcel(data, [
      { header: 'ID', key: 'id', width: 10 },
      { header: 'Номер лота', key: 'lot_number', width: 12 },
      { header: 'Описание', key: 'description', width: 40 },
      { header: 'Старт. цена', key: 'start_price', width: 14 },
      { header: 'Шаг ставки', key: 'bid_step', width: 12 },
      { header: 'Текущая ставка', key: 'max_bid', width: 14 },
      { header: 'Итог. цена', key: 'final_price', width: 14 },
      { header: 'Покупатель ID', key: 'buyer_id', width: 14 },
      { header: 'Статус', key: 'status', width: 14 }
    ], `lots-${req.params.auctionId}.xlsx`);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
    res.send(buffer);
  } catch (err) {
    next(err);
  }
});

router.get('/users', auth, role('admin'), async (req, res, next) => {
  try {
    const data = await userService.getAll();
    const { buffer, filename } = await exportService.toExcel(data, [
      { header: 'ID', key: 'id', width: 10 },
      { header: 'Имя', key: 'name', width: 25 },
      { header: 'Email', key: 'email', width: 30 },
      { header: 'Роль', key: 'role', width: 12 },
      { header: 'Продавец', key: 'is_seller', width: 12 },
      { header: 'Покупатель', key: 'is_buyer', width: 12 }
    ], 'users.xlsx');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
    res.send(buffer);
  } catch (err) {
    next(err);
  }
});

router.get('/sellers', auth, role('admin'), async (req, res, next) => {
  try {
    const { from, to } = req.query;
    const data = await sellerService.getWithRevenue(from, to);
    const { buffer, filename } = await exportService.toExcel(data, [
      { header: 'ID', key: 'id', width: 10 },
      { header: 'Продавец', key: 'name', width: 25 },
      { header: 'Email', key: 'email', width: 30 },
      { header: 'Продано лотов', key: 'sold_count', width: 15 },
      { header: 'Выручка', key: 'total_revenue', width: 16 }
    ], 'sellers.xlsx');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
    res.send(buffer);
  } catch (err) {
    next(err);
  }
});

router.get('/buyers', auth, role('admin'), async (req, res, next) => {
  try {
    const { from, to } = req.query;
    const data = await buyerService.getWithPurchaseCount(from, to);
    const { buffer, filename } = await exportService.toExcel(data, [
      { header: 'ID', key: 'id', width: 10 },
      { header: 'Покупатель', key: 'name', width: 25 },
      { header: 'Email', key: 'email', width: 30 },
      { header: 'Число покупок', key: 'purchase_count', width: 15 },
      { header: 'Потрачено', key: 'total_spent', width: 16 }
    ], 'buyers.xlsx');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
    res.send(buffer);
  } catch (err) {
    next(err);
  }
});

module.exports = router;