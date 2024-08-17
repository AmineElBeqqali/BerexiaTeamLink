import React, { useEffect, useState } from 'react';
import axios from 'axios';

function TaskList({ listId }) {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        axios.get(`/api/lists/${listId}/tasks`)
            .then(response => {
                setTasks(response.data);
                setLoading(false); // Stop loading when data is fetched
            })
            .catch(error => {
                setError('Error fetching tasks');
                console.error('There was an error fetching the tasks!', error);
                setLoading(false); // Stop loading even if there is an error
            });
    }, [listId]);

    if (loading) return <p>Loading tasks...</p>;
    if (error) return <p>{error}</p>;

    return (
        <div className="p-4">
            <h2 className="text-xl font-bold">Tasks for List {listId}</h2>
            <ul className="space-y-4">
                {tasks.length > 0 ? (
                    tasks.map(task => (
                        <li key={task.id} className="p-4 bg-gray-100 rounded-lg shadow">
                            <h3 className="text-lg font-semibold">{task.title}</h3>
                            <p className="text-gray-700">{task.description}</p>
                            <p className="text-sm text-gray-500">
                                Status: {task.status}, Priority: {task.priority}, 
                                Due Date: {task.due_date ? new Date(task.due_date).toLocaleDateString() : 'N/A'}
                            </p>
                        </li>
                    ))
                ) : (
                    <p>No tasks found.</p>
                )}
            </ul>
        </div>
    );
}

export default TaskList;
