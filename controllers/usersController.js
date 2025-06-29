const pool = require('../config/database');
const bcrypt = require('bcrypt');
const multer = require('multer');
const path = require('path');

 // Configuração do multer para salvar na pasta /upload
 const storage = multer.diskStorage({
   destination: (req, file, cb) => {
     cb(null, path.join(__dirname, '..', 'upload'));
   },
   filename: (req, file, cb) => {
     const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname);
     cb(null, uniqueName);
   }
 });
 const upload = multer({ storage });

exports.getAll = async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT user_id, user_name, user_email, user_active FROM users ORDER BY user_id');
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
  const { user_name, user_email, user_password, user_active } = req.body;
  console.log(user_active)
  if (!user_name || !user_email || !user_password) {
    return res.status(400).json({ error: 'user_name, user_email, user_active and user_password are required' });
  }
  try {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(user_password, saltRounds);
    const { rows } = await pool.query(
      'INSERT INTO users (user_name, user_email, user_password, user_active) VALUES ($1, $2, $3, $4) RETURNING user_id, user_name, user_email, user_active',
      [user_name, user_email, hashedPassword, user_active ]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.update = async (req, res) => {
  const { user_id } = req.params;
  const { user_name, user_email, user_password, user_active } = req.body;
  if (!user_name && !user_email) {
    return res.status(400).json({ error: 'At least one field (user_name, user_email, user_active) is required' });
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
  if (typeof user_active === 'boolean') {
    fields.push(`user_active = $${idx++}`);
    values.push(user_active);
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
      `UPDATE users SET ${fields.join(', ')} WHERE user_id = $${idx} RETURNING user_id, user_name, user_email, user_active`,
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



