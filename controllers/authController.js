const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const pool = require('../config/database');

exports.login = async (req, res) => {
  const { user_email, user_password } = req.body;
  if (!user_email || !user_password) {
    return res.status(400).json({ error: 'user_email and user_password are required' });
  }
  try {
    const { rows } = await pool.query(
      'SELECT * FROM users WHERE user_email = $1',
      [user_email]
    );
    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const user = rows[0];
    const match = await bcrypt.compare(user_password, user.user_password);
    if (!match) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = jwt.sign(
      { user_id: user.user_id, user_email: user.user_email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRATION_TIME }
    );
    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};