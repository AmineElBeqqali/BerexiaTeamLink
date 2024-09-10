import React, { useState } from 'react';
import axios from 'axios';

function TaskForm({ listId, onTaskCreated }) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(`/api/lists/${listId}/tasks`, {
                title,
                description,
                status: 'backlog', // Default status
                priority: 'medium'
            });
            onTaskCreated(response.data); // Callback to update task list in parent component
            setTitle('');
            setDescription('');
        } catch (error) {
            console.error('There was an error creating the task!', error);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <div>
                <label>Title</label>
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                />
            </div>
            <div>
                <label>Description</label>
                <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                />
            </div>
            <button type="submit">Create Task</button>
        </form>
    );
}

export default TaskForm;
