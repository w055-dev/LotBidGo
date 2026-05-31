const pool = require('../db/pool');
const BaseService = require('./BaseService');

class BuyerService extends BaseService {
  async getByDateRange(from, to) {
    const { rows } = await pool.query(
      `SELECT DISTINCT u.id, u.name, u.email
       FROM users u
       JOIN sales s ON s.buyer_id = u.id
       WHERE s.sale_time BETWEEN $1 AND $2
       ORDER BY u.name`,
      [from, to]
    );
    return rows;
  } 

  async getWithPurchaseCount(from, to) {
    const { rows } = await pool.query(
      `SELECT
         u.id, u.name, u.email,
         COUNT(s.id)::int AS purchase_count,
         COALESCE(SUM(s.final_price), 0) AS total_spent
       FROM users u
       JOIN sales s ON s.buyer_id = u.id
       WHERE s.sale_time BETWEEN $1 AND $2
       GROUP BY u.id
       ORDER BY purchase_count DESC`,
      [from, to]
    );
    return rows;
  }
}

module.exports = new BuyerService();