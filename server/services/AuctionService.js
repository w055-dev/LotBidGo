const pool = require('../db/pool');
const BaseService = require('./BaseService');

class AuctionService extends BaseService {
  async getAll() {
    const { rows } = await pool.query('SELECT * FROM auctions ORDER BY date DESC');
    return rows;
  }

  async getByDateRange(from, to) {
    const { rows } = await pool.query(
      'SELECT * FROM auctions WHERE date BETWEEN $1 AND $2 ORDER BY date DESC',
      [from, to]
    );
    return rows;
  }

  async getByLocation(location) {
    const { rows } = await pool.query(
      'SELECT * FROM auctions WHERE location ILIKE $1 ORDER BY date DESC',
      [`%${location}%`]
    );
    return rows;
  }

  async getWithRevenue() {
    const { rows } = await pool.query(`
      SELECT
        a.id,
        a.date,
        a.location,
        a.format,
        a.specification,
        COUNT(l.id)::int AS total_lots,
        COUNT(s.id)::int AS sold_lots,
        COALESCE(SUM(s.final_price), 0) AS total_revenue
      FROM auctions a
      LEFT JOIN lots l ON l.auction_id = a.id
      LEFT JOIN sales s ON s.lot_id = l.id
      GROUP BY a.id
      ORDER BY total_revenue DESC
    `);
    return rows;
  }

  async create({ date, time, location, format, specification }) {
    this.validateRequired({ date, time, location, format }, ['date', 'time', 'location', 'format']);
    const { rows } = await pool.query(
      `INSERT INTO auctions (date, time, location, format, specification)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [date, time, location, format, specification]
    );
    return rows[0];
  }

  async getById(id) {
    const { rows } = await pool.query('SELECT * FROM auctions WHERE id = $1', [id]);
    return rows[0] || null;
  }

  async start(id) {
    const auction = await this.getById(id);
    if (!auction) this.notFound('Аукцион');
    if (auction.status !== 'scheduled') {
      throw new Error('Запустить можно только запланированный аукцион');
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query(
        "UPDATE auctions SET status = 'live' WHERE id = $1",
        [id]
      );
      await client.query(
        "UPDATE lots SET status = 'in_auction' WHERE auction_id = $1 AND status = 'listed'",
        [id]
      );
      await client.query('COMMIT');
      return this.getById(id);
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  async finish(id) {
    const auction = await this.getById(id);
    if (!auction) this.notFound('Аукцион');
    if (auction.status !== 'live') {
      throw new Error('Завершить можно только активный аукцион');
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Обновить статус аукциона
      await client.query(
        "UPDATE auctions SET status = 'finished' WHERE id = $1",
        [id]
      );

      // Найти лоты с максимальными ставками и зафиксировать продажи
      const { rows: winners } = await client.query(
        `SELECT DISTINCT ON (l.id)
          l.id AS lot_id,
          b.bidder_id,
          b.amount AS final_price
        FROM lots l
        JOIN bids b ON b.lot_id = l.id
        WHERE l.auction_id = $1 AND l.status = 'in_auction'
        ORDER BY l.id, b.amount DESC`,
        [id]
      );

      for (const w of winners) {
        await client.query(
          'INSERT INTO sales (lot_id, buyer_id, final_price, sale_time) VALUES ($1, $2, $3, NOW()) ON CONFLICT (lot_id) DO NOTHING',
          [w.lot_id, w.bidder_id, w.final_price]
        );
      }

      // Лоты без ставок — unsold
      await client.query(
        "UPDATE lots SET status = 'unsold' WHERE auction_id = $1 AND status = 'in_auction'",
        [id]
      );

      await client.query('COMMIT');
      return this.getById(id);
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }
}

module.exports = new AuctionService();