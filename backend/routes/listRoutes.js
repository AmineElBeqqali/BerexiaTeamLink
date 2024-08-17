const express = require('express');
const router = express.Router();
const listController = require('../controllers/listController');

router.get('/boards/:boardId/lists', listController.getListsByBoardId);
router.post('/boards/:boardId/lists', listController.createList);

module.exports = router;
