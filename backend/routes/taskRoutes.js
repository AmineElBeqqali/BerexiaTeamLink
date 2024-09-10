const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// Fetch tasks for a specific list
router.get('/lists/:listId/tasks', async (req, res) => {
    const { listId } = req.params;
    try {
        const result = await pool.query('SELECT * FROM tasks WHERE list_id = $1 ORDER BY position', [listId]);
        console.log('Fetched tasks from DB:', result.rows); // Log fetched tasks
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching tasks:', err.message);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Create a new task in a specific list
router.post('/lists/:listId/tasks', async (req, res) => {
    const { listId } = req.params;
    const { title, description = '', status = 'backlog', priority = 'medium', due_date } = req.body;

    try {
        const positionResult = await pool.query('SELECT COALESCE(MAX(position), 0) + 1 AS new_position FROM tasks WHERE list_id = $1', [listId]);
        const newPosition = positionResult.rows[0].new_position;

        const result = await pool.query(
            'INSERT INTO tasks (title, description, status, priority, list_id, position, due_date) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
            [title, description, status, priority, listId, newPosition, due_date]
        );
        console.log('Task created:', result.rows[0]); // Log the created task
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Error creating task:', err.message);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.put('/tasks/:taskId', async (req, res) => {
    const { taskId } = req.params;
    const { title, description, listId, newPosition } = req.body;

    try {
        await pool.query('BEGIN');

        // Fetch the current task data
        const oldTaskResult = await pool.query('SELECT list_id, position FROM tasks WHERE id = $1', [taskId]);

        if (oldTaskResult.rows.length === 0) {
            await pool.query('ROLLBACK');
            console.log('Task not found:', taskId);
            return res.status(404).json({ error: 'Task not found' });
        }

        const oldListId = oldTaskResult.rows[0].list_id;
        const oldPosition = oldTaskResult.rows[0].position;

        // Handle the position updates depending on whether the task is moving within the same list or to a different list
        if (oldListId !== listId) {
            // Moving task to a different list
            await pool.query(
                'UPDATE tasks SET position = position - 1 WHERE list_id = $1 AND position > $2',
                [oldListId, oldPosition]
            );
            await pool.query(
                'UPDATE tasks SET position = position + 1 WHERE list_id = $1 AND position >= $2',
                [listId, newPosition]
            );
        } else if (newPosition < oldPosition) {
            // Moving task up within the same list
            await pool.query(
                'UPDATE tasks SET position = position + 1 WHERE list_id = $1 AND position >= $2 AND position < $3',
                [listId, newPosition, oldPosition]
            );
        } else if (newPosition > oldPosition) {
            // Moving task down within the same list
            await pool.query(
                'UPDATE tasks SET position = position - 1 WHERE list_id = $1 AND position > $2 AND position <= $3',
                [listId, oldPosition, newPosition]
            );
        }

        // Finally, update the task with the new data
        const result = await pool.query(
            'UPDATE tasks SET title = $1, description = $2, list_id = $3, position = $4 WHERE id = $5 RETURNING *',
            [title, description, listId, newPosition, taskId]
        );

        console.log('Task updated:', result.rows[0]);
        await pool.query('COMMIT');

        res.status(200).json(result.rows[0]);  // Return the updated task object
    } catch (err) {
        await pool.query('ROLLBACK');
        console.error('Error updating task:', err.message);
        res.status(500).json({ error: 'Internal server error', details: err.message });
    }
});





// Delete a task
router.delete('/tasks/:taskId', async (req, res) => {
    const { taskId } = req.params;

    try {
        const result = await pool.query('DELETE FROM tasks WHERE id = $1', [taskId]);

        if (result.rowCount > 0) {
            console.log('Task deleted:', taskId); // Log the deleted task
            res.status(200).json({ message: 'Task deleted successfully' });
        } else {
            console.error('Task not found:', taskId);
            res.status(404).json({ message: 'Task not found' });
        }
    } catch (err) {
        console.error('Error deleting task:', err.message);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
