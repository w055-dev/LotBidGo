const pool = require('../db/pool');
const BaseService = require('./BaseService');

class SaleService extends BaseService {
  async record(lotId, buyerId, finalPrice) {
    this.validateRequired({ lotId, buyerId, finalPrice }, ['lotId', 'buyerId', 'finalPrice']);
    this.validatePositive(finalPrice, 'finalPrice');
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const lotResult = await client.query('SELECT * FROM lots WHERE id = $1', [lotId]);
      if (lotResult.rows.length === 0) {
        throw new Error('Лот не найден');
      }
      const lot = lotResult.rows[0];
      if (lot.status === 'withdrawn') {
        throw new Error('Нельзя продать отозванный лот');
      }
      if (lot.status === 'sold') {
        throw new Error('Лот уже продан');
      }
      if (finalPrice < parseFloat(lot.start_price)) {
        throw new Error(`Итоговая цена не может быть ниже стартовой (${lot.start_price} руб.)`);
      }
      const auctionResult = await client.query(
        `SELECT a.status FROM auctions a
        JOIN lots l ON l.auction_id = a.id
        WHERE l.id = $1`,
        [lotId]
      );
      if (auctionResult.rows[0].status === 'scheduled') {
        throw new Error('Нельзя зафиксировать продажу до запуска аукциона');
      }
      const { rows } = await client.query(
        'INSERT INTO sales (lot_id, buyer_id, final_price, sale_time) VALUES ($1, $2, $3, NOW()) RETURNING *',
        [lotId, buyerId, finalPrice]
      );
      await client.query("UPDATE lots SET status = 'sold' WHERE id = $1", [lotId]);
      await client.query('COMMIT');
      return rows[0];
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  async getByBuyer(buyerId) {
  const { rows } = await pool.query(
    'SELECT * FROM sales WHERE buyer_id = $1 ORDER BY sale_time DESC',
    [buyerId]
  );
  return rows;
}

  async getRevenueBySeller(sellerId) {
    const { rows } = await pool.query(
      `SELECT
        COUNT(s.id)::int AS sold_count,
        COALESCE(SUM(s.final_price), 0) AS total_revenue
      FROM sales s
      JOIN lots l ON l.id = s.lot_id
      WHERE l.seller_id = $1`,
      [sellerId]
    );
    return rows[0] || { sold_count: 0, total_revenue: 0 };
  }

  async getSummaryByAuction(auctionId) {
    const { rows } = await pool.query(
      `SELECT
         a.date AS auction_date,
         a.location AS auction_location,
         a.format,
         COUNT(l.id)::int AS total_lots,
         COUNT(s.id)::int AS sold_lots,
         COALESCE(SUM(s.final_price), 0) AS total_revenue,
         COALESCE(MIN(s.final_price), 0) AS min_price,
         COALESCE(MAX(s.final_price), 0) AS max_price
       FROM auctions a
       LEFT JOIN lots l ON l.auction_id = a.id
       LEFT JOIN sales s ON s.lot_id = l.id
       WHERE a.id = $1
       GROUP BY a.id`,
      [auctionId]
    );
    return rows[0] || null;
  }
}

module.exports = new SaleService();