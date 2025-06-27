const pool = require('../config/database');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.getAll = async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT user_id, user_name, user_email FROM users ORDER BY user_id');
    res.status(200).json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getById = async (req, res) => {
  const { user_id } = req.params;
  if (!user_id) {
    return res.status(400).json({ error: 'user_id is required' });
  }
  try {
    const { rows } = await pool.query('SELECT * FROM users WHERE user_id = $1', [user_id]);
    res.status(200).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.create = async (req, res) => {
  const { user_name, user_email, user_password } = req.body;
  if (!user_name || !user_email || !user_password) {
    return res.status(400).json({ error: 'user_name, user_email and user_password are required' });
  }
  try {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(user_password, saltRounds);
    const { rows } = await pool.query(
      'INSERT INTO users (user_name, user_email, user_password) VALUES ($1, $2, $3) RETURNING *',
      [user_name, user_email, hashedPassword]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.update = async (req, res) => {
  const { user_id } = req.params;
  const { user_name, user_email, user_password } = req.body;
  if (!user_name && !user_email && !user_password) {
    return res.status(400).json({ error: 'At least one field (user_name, user_email, user_password) is required' });
  }
  const fields = [];
  const values = [];
  let idx = 1;

  if (user_name) {
    fields.push(`user_name = $${idx++}`);
    values.push(user_name);
  }
  if (user_email) {
    fields.push(`user_email = $${idx++}`);
    values.push(user_email);
  }
  if (user_password) {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(user_password, saltRounds);
    fields.push(`user_password = $${idx++}`);
    values.push(hashedPassword);
  }
  values.push(user_id);

  try {
    const { rows } = await pool.query(
      `UPDATE users SET ${fields.join(', ')} WHERE user_id = $${idx} RETURNING *`,
      values
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.status(200).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.delete = async (req, res) => {
  const { user_id } = req.params;
  if (!user_id) {
    return res.status(400).json({ error: 'user_id is required' });
  }
  try {
    const { rowCount } = await pool.query('DELETE FROM users WHERE user_id = $1', [user_id]);
    if (rowCount === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};