const express = require('express');
const router = express.Router();
const boardsController = require('../controllers/boardController');

router.get('/boards', boardsController.getAllBoards);
router.post('/boards', boardsController.createBoard);
router.get('/boards/:boardId/lists', boardsController.getListsByBoardId);
router.post('/boards/:boardId/lists', boardsController.createListForBoard);
router.put('/boards/:id', boardsController.renameBoard);
router.delete('/boards/:boardId', boardsController.deleteBoard);
router.put('/boards/:boardId/lists/reorder', boardsController.reorderLists);

module.exports = router;
