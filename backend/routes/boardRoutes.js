const express = require('express');
const router = express.Router();
const boardController = require('../controllers/boardController');

router.get('/boards', boardController.getBoards);
router.post('/boards', boardController.createBoard);

module.exports = router;
