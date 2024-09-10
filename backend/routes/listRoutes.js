const express = require('express');
const router = express.Router();
const listController = require('../controllers/listController');

router.get('/boards/:boardId/lists', listController.getListsByBoardId);
router.post('/boards/:boardId/lists', listController.createList);
router.put('/boards/:boardId/lists/reorder', listController.reorderLists);
router.put('/boards/:boardId/lists/:listId', listController.updateList);
router.delete('/boards/:boardId/lists/:listId', listController.deleteList);

module.exports = router;
