const express = require('express');
const router = express.Router();
const jwtAuth = require('../middleware/jwtAuth');
const userController = require('../controllers/usersController');
const multer = require('multer');
const path = require('path');

router.use(jwtAuth);

router.get('/all', userController.getAll);
router.get('/:user_id', userController.getById);
router.post('/', userController.create);
router.put('/:user_id', userController.update);
router.delete('/:user_id', userController.delete);
router.post('/avatar/:user_id', userController.avatar);

module.exports = router;