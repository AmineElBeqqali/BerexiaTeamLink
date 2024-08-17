const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// Route to get tasks by list ID
router.get('/lists/:listId/tasks', async (req, res) => {
    const { listId } = req.params;
    try {
        const result = await pool.query('SELECT * FROM tasks WHERE list_id = $1', [listId]);
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching tasks:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
