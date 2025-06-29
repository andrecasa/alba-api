const express = require('express');
const router = express.Router();
const jwtAuth = require('../middleware/jwtAuth');
const avatarController = require('../controllers/avatarController');

router.use(jwtAuth);

router.post('/:user_id', avatarController.avatar);

module.exports = router;