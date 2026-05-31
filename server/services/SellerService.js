const pool = require('../db/pool');
const BaseService = require('./BaseService');

class SellerService extends BaseService {
  async getWithRevenue(from, to) {
    const { rows } = await pool.query(
      `SELECT
         u.id, u.name, u.email,
         COUNT(s.id)::int AS sold_count,
         COALESCE(SUM(s.final_price), 0) AS total_revenue
       FROM users u
       JOIN lots l ON l.seller_id = u.id
       JOIN sales s ON s.lot_id = l.id
       WHERE s.sale_time BETWEEN $1 AND $2
       GROUP BY u.id
       ORDER BY total_revenue DESC`,
      [from, to]
    );
    return rows;
  }

  async getParticipants(from, to) {
    const { rows } = await pool.query(
      `SELECT DISTINCT u.id, u.name, u.email
       FROM users u
       JOIN lots l ON l.seller_id = u.id
       JOIN auctions a ON a.id = l.auction_id
       WHERE a.date BETWEEN $1 AND $2
       ORDER BY u.name`,
      [from, to]
    );
    return rows;
  }
}

module.exports = new SellerService();