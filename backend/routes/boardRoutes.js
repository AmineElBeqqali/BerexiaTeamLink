const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// Fetch all boards
router.get('/boards', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM boards ORDER BY id');
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching boards:', err.message);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Create a new board
router.post('/boards', async (req, res) => {
    const { name, color } = req.body;

    if (!name || !color) {
        return res.status(400).json({ error: 'Name and color are required' });
    }

    try {
        const result = await pool.query(
            'INSERT INTO boards (name, color) VALUES ($1, $2) RETURNING *',
            [name, color]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Error creating board:', err.message);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Fetch lists for a specific board
router.get('/boards/:boardId/lists', async (req, res) => {
    const { boardId } = req.params;

    try {
        const result = await pool.query(
            'SELECT * FROM lists WHERE board_id = $1 ORDER BY position',
            [boardId]
        );
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching lists:', err.message);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Create a new list for a board
router.post('/boards/:boardId/lists', async (req, res) => {
    const { boardId } = req.params;
    const { name } = req.body;

    if (!name) {
        return res.status(400).json({ error: 'List name is required' });
    }

    try {
        const positionResult = await pool.query('SELECT COALESCE(MAX(position), 0) + 1 AS new_position FROM lists WHERE board_id = $1', [boardId]);
        const newPosition = positionResult.rows[0].new_position;

        const result = await pool.query(
            'INSERT INTO lists (name, board_id, position) VALUES ($1, $2, $3) RETURNING *',
            [name, boardId, newPosition]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Error creating list:', err.message);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Delete a board
router.delete('/boards/:boardId', async (req, res) => {
    const { boardId } = req.params;

    try {
        await pool.query('DELETE FROM boards WHERE id = $1', [boardId]);
        res.status(200).json({ message: 'Board deleted successfully' });
    } catch (err) {
        console.error('Error deleting board:', err.message);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Rename a board
router.put('/boards/:id', async (req, res) => {
    const { id } = req.params;
    const { name } = req.body;

    try {
        const result = await pool.query(
            'UPDATE boards SET name = $1 WHERE id = $2 RETURNING *',
            [name, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Board not found' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error renaming board:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// **New Route: Reorder Lists**
router.put('/boards/:boardId/lists/reorder', async (req, res) => {
    const { boardId } = req.params;
    const { lists } = req.body;

    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // Update the position of each list
        for (let i = 0; i < lists.length; i++) {
            const { id, position } = lists[i];
            await client.query(
                'UPDATE lists SET position = $1 WHERE id = $2 AND board_id = $3',
                [position, id, boardId]
            );
        }

        await client.query('COMMIT');
        res.status(200).json({ message: 'Lists reordered successfully' });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error reordering lists:', error);
        res.status(500).json({ error: 'Internal server error' });
    } finally {
        client.release();
    }
});

module.exports = router;
