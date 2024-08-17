const pool = require('../config/db');

exports.getListsByBoardId = async (req, res) => {
    const { boardId } = req.params;
    try {
        const result = await pool.query('SELECT * FROM lists WHERE board_id = $1', [boardId]);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.createList = async (req, res) => {
    const { name } = req.body;
    const { boardId } = req.params;
    try {
        const result = await pool.query(
            'INSERT INTO lists (name, board_id) VALUES ($1, $2) RETURNING *',
            [name, boardId]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
};
