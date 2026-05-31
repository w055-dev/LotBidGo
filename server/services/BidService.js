const pool = require('../db/pool');
const BaseService = require('./BaseService');

class BidService extends BaseService {
  async place(lotId, userId, amount) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const lotResult = await client.query('SELECT * FROM lots WHERE id = $1', [lotId]);
      if (lotResult.rows.length === 0) {
        throw new Error('Лот не найден');
      }

      const lot = lotResult.rows[0];
      if (lot.status !== 'in_auction') {
        throw new Error('Лот не участвует в торгах');
      }

      const userResult = await client.query('SELECT id FROM users WHERE id = $1', [userId]);
      if (userResult.rows.length === 0) {
        throw new Error('Участник не найден');
      }

      const maxBid = await client.query(
        'SELECT MAX(amount) AS max FROM bids WHERE lot_id = $1',
        [lotId]
      );
      const currentMax = parseFloat(maxBid.rows[0].max || lot.start_price);
      if (amount <= currentMax) {
        throw new Error('Ставка должна быть выше текущей');
      }

      if (lot.bid_step && parseFloat(lot.bid_step) > 0) {
        const minRequired = currentMax + parseFloat(lot.bid_step);
        if (amount < minRequired) {
          throw new Error(`Ставка должна быть не менее ${minRequired} (шаг: ${lot.bid_step})`);
        }
      }

      const { rows } = await client.query(
        'INSERT INTO bids (lot_id, bidder_id, amount, bid_time) VALUES ($1, $2, $3, NOW()) RETURNING *',
        [lotId, userId, amount]
      );
      await client.query('COMMIT');
      return rows[0];
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  async getHistoryByLot(lotId) {
    const { rows } = await pool.query(
      'SELECT * FROM bids WHERE lot_id = $1 ORDER BY bid_time DESC',
      [lotId]
    );
    return rows;
  }

  async getWinner(lotId) {
    const { rows } = await pool.query(
      'SELECT * FROM bids WHERE lot_id = $1 ORDER BY amount DESC LIMIT 1',
      [lotId]
    );
    return rows[0] || null;
  }
}

module.exports = new BidService();