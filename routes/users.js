const express = require('express');
const router = express.Router();
const jwtAuth = require('../middleware/jwtAuth');
const userController = require('../controllers/usersController');

router.use(jwtAuth);

router.get('/all', userController.getAll);
router.get('/:user_id', userController.getById);
router.post('/', userController.create);
router.put('/:user_id', userController.update);
router.delete('/:user_id', userController.delete);

module.exports = router;