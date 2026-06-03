const lotService = require('../services/LotService');

describe('LotService', () => {
  let auctionId;

  beforeAll(async () => {
    const auctionService = require('../services/AuctionService');
    const auction = await auctionService.create({
      date: '2026-12-15',
      time: '14:00',
      location: 'Тестовый зал',
      format: 'очный'
    });
    await auctionService.start(auction.id);
    auctionId = auction.id;
  });

  test('пункт 2 ТЗ: добавление лота с указанием начальной цены', async () => {
    const lot = await lotService.create({
      auctionId,
      sellerId: 2,
      description: 'Тестовый лот',
      startPrice: 1000
    });
    expect(lot).toHaveProperty('id');
    expect(lot.status).toBe('listed');
    expect(parseFloat(lot.start_price)).toBe(1000);
  });

  test('пункт 2 ТЗ: добавление лота с несуществующим аукционом вызывает ошибку', async () => {
    await expect(lotService.create({
      auctionId: 9999,
      sellerId: 2,
      description: 'Лот',
      startPrice: 1000
    })).rejects.toThrow('Аукцион не найден');
  });

  test('пункт 4 ТЗ: получение проданных предметов за интервал дат', async () => {
    const lots = await lotService.getSoldByDateRange('2026-01-01', '2026-12-31');
    expect(Array.isArray(lots)).toBe(true);
  });
});