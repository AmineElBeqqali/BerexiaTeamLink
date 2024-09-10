import React, { useState } from 'react';
import axios from 'axios';

function TaskModal({ listId, onClose, onTaskCreated }) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await axios.post(`http://localhost:5000/api/lists/${listId}/tasks`, {
                title,
                description
            });
            onTaskCreated(response.data);
            onClose(); // Close the modal after task creation
        } catch (error) {
            console.error('There was an error creating the task!', error);
        }
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-4 rounded shadow-lg w-1/3">
                <h2 className="text-lg font-semibold mb-4">Add a new task</h2>
                <form onSubmit={handleSubmit}>
                    <input 
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Task title"
                        className="border rounded p-2 mb-2 w-full"
                        required
                    />
                    <textarea 
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Task description (optional)"
                        className="border rounded p-2 mb-2 w-full"
                    />
                    <div className="flex justify-end">
                        <button 
                            type="button"
                            className="bg-gray-500 text-white px-4 py-2 rounded mr-2"
                            onClick={onClose}
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit"
                            className="bg-blue-500 text-white px-4 py-2 rounded"
                        >
                            Add Task
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default TaskModal;
