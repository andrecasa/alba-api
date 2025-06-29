const pool = require('../config/database');
const multer = require('multer');
const path = require('path');

exports.avatar = async (req, res) => {
  const { user_id } = req.params;
  const url_folder = 'upload/avatar';
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, path.join(__dirname, '..', url_folder));
    },
    filename: (req, file, cb) => {
      const uniqueName = `${user_id}${path.extname(file.originalname)}`;
      cb(null, uniqueName);
    }
  });
  const upload = multer({ storage });

  upload.single('avatar')(req, res, async (err) => {
    if (err || !req.file || !user_id) {
      return res.status(400).json({ error: 'No file uploaded or user_id missing' });
    }
    try {
      const url_image = `${url_folder}/${req.file.filename}`;
      await pool.query(
        'UPDATE users SET user_image = $1 WHERE user_id = $2',
        [url_image, user_id]
      );
      res.status(200).json(req.file.filename);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
};

