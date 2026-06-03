const saleService = require('../services/SaleService');

describe('SaleService', () => {
  let lotId1, lotId2;

  beforeAll(async () => {
    const auctionService = require('../services/AuctionService');
    const lotService = require('../services/LotService');

    const auction = await auctionService.create({
      date: '2026-12-20',
      time: '14:00',
      location: 'Тестовый зал',
      format: 'очный'
    });
    await auctionService.start(auction.id);

    const lot1 = await lotService.create({
      auctionId: auction.id,
      sellerId: 2,
      description: 'Лот 1',
      startPrice: 1000
    });

    const lot2 = await lotService.create({
      auctionId: auction.id,
      sellerId: 2,
      description: 'Лот 2',
      startPrice: 1000
    });

    lotId1 = lot1.id;
    lotId2 = lot2.id;
  });

  test('пункт 5 ТЗ: фиксация продажи с корректными данными', async () => {
    const sale = await saleService.record(lotId1, 2, 1500);
    expect(sale).toHaveProperty('id');
    expect(parseFloat(sale.final_price)).toBe(1500);
  });

  test('пункт 5 ТЗ: фиксация продажи с ценой ниже стартовой вызывает ошибку', async () => {
    await expect(saleService.record(lotId2, 2, 1))
      .rejects.toThrow('не может быть ниже стартовой');
  });

  test('пункт 5 ТЗ: фиксация продажи несуществующего лота вызывает ошибку', async () => {
    await expect(saleService.record(9999, 2, 1000))
      .rejects.toThrow('Лот не найден');
  });
});