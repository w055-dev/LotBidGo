const pool = require('../db/pool');
const BaseService = require('./BaseService');

class LotService extends BaseService {
  async getByAuction(auctionId) {
    const { rows } = await pool.query(
      `SELECT l.*, s.final_price, s.buyer_id,
              COALESCE((SELECT MAX(amount) FROM bids WHERE lot_id = l.id), l.start_price )AS max_bid
      FROM lots l
      LEFT JOIN sales s ON s.lot_id = l.id
      WHERE l.auction_id = $1
      ORDER BY l.lot_number`,
      [auctionId]
    );
    return rows.map((row) => ({
      ...row,
      final_price: row.final_price || null,
      max_bid: row.max_bid || null
    }));
  }

  async getSoldByDateRange(from, to) {
    const { rows } = await pool.query(
      `SELECT l.*, a.date AS auction_date, s.final_price, s.sale_time, u.name AS buyer_name
       FROM lots l
       JOIN sales s ON s.lot_id = l.id
       JOIN auctions a ON a.id = l.auction_id
       JOIN users u ON u.id = s.buyer_id
       WHERE s.sale_time BETWEEN $1 AND $2
       ORDER BY s.sale_time DESC`,
      [from, to]
    );
    return rows;
  }

  async create({ auctionId, sellerId, description, startPrice, bidStep }) {
    this.validateRequired(
      { auctionId, sellerId, startPrice },
      ['auctionId', 'sellerId', 'startPrice']
    );
    this.validatePositive(startPrice, 'startPrice');
    const auctionResult = await pool.query('SELECT * FROM auctions WHERE id = $1', [auctionId]);
    if (auctionResult.rows.length === 0) {
      throw new Error('Аукцион не найден');
    }
    if (auctionResult.rows[0].status === 'finished') {
      throw new Error('Нельзя добавить лот в завершённый аукцион');
    }
    const userResult = await pool.query(
      'SELECT id, is_seller FROM users WHERE id = $1',
      [sellerId]
    );
    if (userResult.rows.length === 0) {
      throw new Error('Продавец не найден');
    }
    if (!userResult.rows[0].is_seller) {
      throw new Error('Указанный пользователь не является продавцом');
    }
    const { rows } = await pool.query(
      `INSERT INTO lots (auction_id, seller_id, description, start_price, bid_step, status)
       VALUES ($1, $2, $3, $4, $5, 'listed') RETURNING *`,
      [auctionId, sellerId, description, startPrice, bidStep ? parseFloat(bidStep) : null]
    );
    return rows[0];
  }

  async updateStatus(id, status) {
    const { rows } = await pool.query(
      'UPDATE lots SET status = $1 WHERE id = $2 RETURNING *',
      [status, id]
    );
    if (rows.length === 0) this.notFound('Лот');
    return rows[0];
  }

  async getById(id) {
    const { rows } = await pool.query('SELECT * FROM lots WHERE id = $1', [id]);
    if (rows.length === 0) this.notFound('Лот');
    return rows[0];
  }

  async getBySeller(sellerId) {
    const { rows } = await pool.query(
      `SELECT l.*, s.final_price
      FROM lots l
      LEFT JOIN sales s ON s.lot_id = l.id
      WHERE l.seller_id = $1
      ORDER BY l.created_at DESC`,
      [sellerId]
    );
    return rows.map((row) => ({
      ...row,
      final_price: row.final_price || null
    }));
  }


  async withdraw(id, sellerId) {
    const { rows } = await pool.query(
      'SELECT * FROM lots WHERE id = $1 AND seller_id = $2',
      [id, sellerId]
    );
    if (rows.length === 0) {
      this.notFound('Лот');
    }
    if (rows[0].status !== 'listed') {
      throw new Error('Отозвать можно только лот, который ещё не участвовал в торгах');
    }
    return this.updateStatus(id, 'withdrawn');
  }
}

module.exports = new LotService();