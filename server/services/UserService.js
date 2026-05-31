const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db/pool');
const { jwtSecret } = require('../config');
const BaseService = require('./BaseService');

class UserService extends BaseService {
  async register({ name, email, password }) {
    this.validateRequired({ name, email, password }, ['name', 'email', 'password']);

    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      throw new Error('Пользователь с таким email уже существует');
    }

    const hash = await bcrypt.hash(password, 10);
    const { rows } = await pool.query(
      `INSERT INTO users (name, email, password_hash, role, is_buyer, is_seller)
       VALUES ($1, $2, $3, 'user', true, false)
       RETURNING id, name, email, role, is_seller, is_buyer`,
      [name, email, hash]
    );
    return rows[0];
  }

  async login({ email, password }) {
    this.validateRequired({ email, password }, ['email', 'password']);

    const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (rows.length === 0) throw new Error('Неверный email или пароль');

    const user = rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) throw new Error('Неверный email или пароль');

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        is_seller: user.is_seller,
        is_buyer: user.is_buyer
      },
      jwtSecret,
      { expiresIn: '24h' }
    );

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        is_seller: user.is_seller,
        is_buyer: user.is_buyer
      }
    };
  }

  async getAll() {
    const { rows } = await pool.query(
      'SELECT id, name, email, role, is_seller, is_buyer, created_at FROM users ORDER BY name'
    );
    return rows;
  }

  async getById(id) {
    const { rows } = await pool.query(
      'SELECT id, name, email, role, is_seller, is_buyer FROM users WHERE id = $1',
      [id]
    );
    if (rows.length === 0) this.notFound('Пользователь');
    return rows[0];
  }

  async update(id, { name, email, is_seller, is_buyer }) {
    const { rows } = await pool.query(
      `UPDATE users SET name = $1, email = $2, is_seller = $3, is_buyer = $4
       WHERE id = $5
       RETURNING id, name, email, role, is_seller, is_buyer`,
      [name, email, is_seller, is_buyer, id]
    );
    if (rows.length === 0) this.notFound('Пользователь');
    return rows[0];
  }

  async toggleSeller(id) {
    const user = await this.getById(id);
    return this.update(id, {
      name: user.name,
      email: user.email,
      is_seller: !user.is_seller,
      is_buyer: user.is_buyer
    });
  }
}

module.exports = new UserService();