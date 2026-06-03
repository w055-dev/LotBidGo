const sellerService = require('../services/SellerService');
const buyerService = require('../services/BuyerService');

describe('SellerService', () => {
  test('пункт 6 ТЗ: список продавцов с выручкой за период', async () => {
    const sellers = await sellerService.getWithRevenue('2026-01-01', '2026-12-31');
    expect(Array.isArray(sellers)).toBe(true);
  });

  test('пункт 10 ТЗ: список продавцов-участников за период', async () => {
    const sellers = await sellerService.getParticipants('2026-01-01', '2026-12-31');
    expect(Array.isArray(sellers)).toBe(true);
  });
});

describe('BuyerService', () => {
  test('пункт 7 ТЗ: список покупателей за период', async () => {
    const buyers = await buyerService.getByDateRange('2026-01-01', '2026-12-31');
    expect(Array.isArray(buyers)).toBe(true);
  });

  test('пункт 12 ТЗ: список покупателей с количеством покупок', async () => {
    const buyers = await buyerService.getWithPurchaseCount('2026-01-01', '2026-12-31');
    expect(Array.isArray(buyers)).toBe(true);
    if (buyers.length > 0) {
      expect(buyers[0]).toHaveProperty('purchase_count');
    }
  });
});