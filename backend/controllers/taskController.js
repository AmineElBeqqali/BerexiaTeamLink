const pool = require('../config/db');

exports.getTasksByListId = async (req, res) => {
    const { listId } = req.params;
    try {
        const result = await pool.query('SELECT * FROM tasks WHERE list_id = $1', [listId]);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
};
