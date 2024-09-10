const pool = require('../config/db');

// Get all lists by boardId
exports.getListsByBoardId = async (req, res) => {
    const { boardId } = req.params;
    try {
        const result = await pool.query('SELECT * FROM lists WHERE board_id = $1 ORDER BY position', [boardId]);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Create a new list for the board
exports.createList = async (req, res) => {
    const { name } = req.body;
    const { boardId } = req.params;
    try {
        const positionResult = await pool.query(
            'SELECT COALESCE(MAX(position), 0) + 1 AS new_position FROM lists WHERE board_id = $1',
            [boardId]
        );
        const newPosition = positionResult.rows[0].new_position;

        const result = await pool.query(
            'INSERT INTO lists (name, board_id, position) VALUES ($1, $2, $3) RETURNING *',
            [name, boardId, newPosition]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Update a list
exports.renameList = async (req, res) => {
    const { boardId, listId } = req.params;
    const { name } = req.body;

    try {
        const result = await pool.query(
            'UPDATE lists SET name = $1 WHERE id = $2 AND board_id = $3 RETURNING *',
            [name, listId, boardId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'List not found' });
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error renaming list:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};




// Delete a list
exports.deleteList = async (req, res) => {
    const { boardId, listId } = req.params; 
    try {
        await pool.query('DELETE FROM lists WHERE id = $1 AND board_id = $2', [listId, boardId]);
        res.status(200).json({ message: 'List deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
};


// Reorder lists
exports.reorderLists = async (req, res) => {
    const { boardId } = req.params;
    const { lists } = req.body;

    try {
        for (let i = 0; i < lists.length; i++) {
            const list = lists[i];
            await pool.query(
                'UPDATE lists SET position = $1 WHERE id = $2 AND board_id = $3',
                [list.position, list.id, boardId]
            );
        }
        res.status(200).json({ message: 'Lists reordered successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
};
