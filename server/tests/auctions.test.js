const auctionService = require('../services/AuctionService');

describe('AuctionService', () => {
  test('пункт 1 ТЗ: получение списка аукционов за интервал дат', async () => {
    const auctions = await auctionService.getByDateRange('2026-01-01', '2026-12-31');
    expect(Array.isArray(auctions)).toBe(true);
  });

  test('пункт 3 ТЗ: получение списка аукционов с доходом, отсортированных по убыванию', async () => {
    const auctions = await auctionService.getWithRevenue();
    expect(Array.isArray(auctions)).toBe(true);
    if (auctions.length > 1) {
      const first = parseFloat(auctions[0].total_revenue);
      const second = parseFloat(auctions[1].total_revenue);
      expect(first).toBeGreaterThanOrEqual(second);
    }
  });

  test('пункт 8 ТЗ: создание аукциона с обязательными полями', async () => {
    const data = {
      date: '2026-12-01',
      time: '14:00',
      location: 'Москва',
      format: 'очный',
      specification: 'Живопись XIX века'
    };
    const auction = await auctionService.create(data);
    expect(auction).toHaveProperty('id');
    expect(auction.location).toBe('Москва');
  });

  test('пункт 8 ТЗ: создание аукциона без обязательного поля вызывает ошибку', async () => {
    await expect(auctionService.create({ date: '2026-12-01' }))
      .rejects.toThrow('обязательно');
  });

  test('пункт 9 ТЗ: поиск аукционов по месту проведения', async () => {
    const auctions = await auctionService.getByLocation('Москва');
    expect(Array.isArray(auctions)).toBe(true);
  });
});