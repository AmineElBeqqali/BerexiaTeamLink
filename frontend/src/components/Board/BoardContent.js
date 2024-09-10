import React, { useRef, useState, useEffect } from 'react';
import axios from 'axios';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { FaEllipsisH } from 'react-icons/fa';  

function BoardContent({ boardId, boardName }) {
    const [lists, setLists] = useState([]);
    const [newListName, setNewListName] = useState('');
    const [editingTask, setEditingTask] = useState(null);
    const [showTaskDropdown, setShowTaskDropdown] = useState(null);
    const dropdownRef = useRef(null); 

    useEffect(() => {
        const fetchLists = async () => {
            if (boardId) {
                try {
                    const response = await axios.get(`http://localhost:5000/api/boards/${boardId}/lists`);
                    const updatedLists = await Promise.all(
                        response.data.map(async (list) => {
                            const tasksResponse = await axios.get(`http://localhost:5000/api/lists/${list.id}/tasks`);
                            return { ...list, tasks: tasksResponse.data };
                        })
                    );
                    setLists(updatedLists);
                } catch (error) {
                    console.error('There was an error fetching the lists!', error);
                }
            }
        };
    
        fetchLists();
    }, [boardId]);

    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowTaskDropdown(null);
            }
        }
    
        document.addEventListener('mousedown', handleClickOutside);
    
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [dropdownRef]);

    const handleAddList = async () => {
        if (newListName.trim() !== '') {
            try {
                const response = await axios.post(`http://localhost:5000/api/boards/${boardId}/lists`, { name: newListName });
                setLists([...lists, { ...response.data, tasks: [] }]);
                setNewListName('');
            } catch (error) {
                console.error('There was an error adding the list!', error);
            }
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleAddList();
        }
    };

    const handleDragEnd = async (result) => {
        const { destination, source, draggableId, type } = result;
    
        if (!destination) return;
    
        const taskId = draggableId.replace("task-", "");
    
        if (type === 'task') {
            const sourceList = lists.find(list => `list-${list.id}` === source.droppableId);
            const destinationList = lists.find(list => `list-${list.id}` === destination.droppableId);
            const movedTask = sourceList.tasks.find(task => task.id === parseInt(taskId));
    
            if (!movedTask) {
                console.error('Task not found for update');
                return;
            }
    
            if (sourceList === destinationList) {
                const newTaskOrder = Array.from(sourceList.tasks);
                const [removed] = newTaskOrder.splice(source.index, 1);
                newTaskOrder.splice(destination.index, 0, removed);
    
                setLists(prevLists => prevLists.map(list => 
                    list.id === sourceList.id ? { ...list, tasks: newTaskOrder } : list
                ));
    
                try {
                    await axios.put(`http://localhost:5000/api/tasks/${taskId}`, {
                        title: movedTask.title,  
                        description: movedTask.description,
                        listId: destinationList.id,
                        newPosition: destination.index + 1,
                    });
                } catch (error) {
                    console.error('There was an error updating the task position!', error);
                }
            } else {
                const sourceTasks = Array.from(sourceList.tasks);
                const [removed] = sourceTasks.splice(source.index, 1);
                const destinationTasks = Array.from(destinationList.tasks);
                destinationTasks.splice(destination.index, 0, removed);
    
                setLists(prevLists => prevLists.map(list => {
                    if (list.id === sourceList.id) {
                        return { ...list, tasks: sourceTasks };
                    } else if (list.id === destinationList.id) {
                        return { ...list, tasks: destinationTasks };
                    } else {
                        return list;
                    }
                }));
    
                try {
                    await axios.put(`http://localhost:5000/api/tasks/${taskId}`, {
                        title: movedTask.title,  
                        description: movedTask.description,
                        listId: destinationList.id,
                        newPosition: destination.index + 1,
                    });
                } catch (error) {
                    console.error('There was an error updating the task position!', error);
                }
            }
        } else if (type === 'list') {
            const reorderedLists = Array.from(lists);
            const [removed] = reorderedLists.splice(source.index, 1);
            reorderedLists.splice(destination.index, 0, removed);
    
            const updatedLists = reorderedLists.map((list, index) => ({
                ...list,
                position: index + 1,
            }));
    
            console.log('After reordering:', updatedLists);
    
            setLists(updatedLists);
    
            try {
                await axios.put(`http://localhost:5000/api/boards/${boardId}/lists/reorder`, { lists: updatedLists });
            } catch (error) {
                console.error('Error updating list positions:', error);
            }
        }
    };
    
    
    

    const handleEditTask = (taskId, listId) => {
        const list = lists.find(l => l.id === listId);
        const task = list.tasks.find(t => t.id === taskId);
        setEditingTask({ ...task, listId });
        setShowTaskDropdown(null); 
    };

    const handleDeleteTask = async (taskId, listId) => {
        try {
            await axios.delete(`http://localhost:5000/api/tasks/${taskId}`);
            setLists(prevLists => 
                prevLists.map(list => 
                    list.id === listId
                        ? { ...list, tasks: list.tasks.filter(task => task.id !== taskId) }
                        : list
                )
            );
            setShowTaskDropdown(null);  
        } catch (error) {
            console.error('There was an error deleting the task!', error);
        }
    };

    const handleSaveTask = async () => {
        console.log('handleSaveTask called');
        console.log('Current editingTask:', editingTask);
        
        if (editingTask.title.trim() !== '') {
            try {
                const response = await axios.put(`http://localhost:5000/api/tasks/${editingTask.id}`, {
                    title: editingTask.title,
                    description: editingTask.description,
                    listId: editingTask.listId,
                    newPosition: editingTask.position
                });
        
                console.log('Response from API:', response.data);  // Log the response
        
                if (response.status === 200) {
                    const updatedTask = response.data;
    
                    console.log('Updated Task from API:', updatedTask); // Ensure this task has the correct data
    
                    setLists(prevLists =>
                        prevLists.map(list => {
                            if (list.id === updatedTask.list_id) {
                                return {
                                    ...list,
                                    tasks: list.tasks.map(task =>
                                        task.id === updatedTask.id
                                            ? {
                                                ...task,
                                                title: updatedTask.title,
                                                description: updatedTask.description,
                                                position: updatedTask.position,
                                            }
                                            : task
                                    ),
                                };
                            } else if (list.id === editingTask.listId) {
                                return {
                                    ...list,
                                    tasks: list.tasks.filter(task => task.id !== updatedTask.id),
                                };
                            }
                            return list;
                        })
                    );
                    setEditingTask(null);
                } else {
                    console.error('Error updating the task:', response.status);
                }
            } catch (error) {
                console.error('There was an error updating the task!', error);
            }
        }
    };
    

    const handleTaskChange = (field, value) => {
        setEditingTask(prev => ({ ...prev, [field]: value }));
    };

    return (
        <div className="p-4 h-full min-h-screen bg-gray-800">
            <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="all-lists" direction="horizontal" type="list">
                    {(provided) => (
                        <div
                            className="lists flex space-x-4 overflow-x-auto"
                            {...provided.droppableProps}
                            ref={provided.innerRef}
                        >
                            {lists.map((list, index) => (
                                <Draggable key={list.id} draggableId={`list-${list.id}`} index={index}>
                                    {(provided) => (
                                        <div
                                            className="list bg-black rounded-lg mb-4 shadow"
                                            ref={provided.innerRef}
                                            {...provided.draggableProps}
                                            {...provided.dragHandleProps}
                                            style={{ 
                                                ...provided.draggableProps.style, 
                                                minWidth: '250px', 
                                                maxWidth: '500px',
                                                width: 'auto', 
                                                padding: '1.5rem',
                                                marginRight: '0.1rem',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                            }}
                                        >
                                            <div className="flex justify-between items-center mb-4">
                                                <h3 className="text-xl text-white font-semibold">{list.name}</h3>
                                            </div>
                                            <Droppable droppableId={`list-${list.id}`} type="task">
                                                {(provided, snapshot) => (
                                                    <div
                                                        ref={provided.innerRef}
                                                        {...provided.droppableProps}
                                                        className={`min-h-[50px] ${snapshot.isDraggingOver ? 'bg-black' : ''}`}
                                                        style={{ minHeight: '1px' }} 
                                                    >
                                                        {list.tasks.map((task, taskIndex) => (
                                                            <Draggable key={task.id} draggableId={`task-${task.id}`} index={taskIndex}>
                                                                {(provided) => (
                                                                    <div
                                                                        className="bg-gray-800 hover:bg-sky-700 text-white p-2 rounded mt-2 shadow flex justify-between items-center"
                                                                        ref={provided.innerRef}
                                                                        {...provided.draggableProps}
                                                                        {...provided.dragHandleProps}
                                                                    >
                                                                        <div className="flex-grow">
                                                                            {editingTask && editingTask.id === task.id ? (
                                                                                <div>
                                                                                    <input
                                                                                        type="text"
                                                                                        value={editingTask.title}
                                                                                        onChange={(e) => handleTaskChange('title', e.target.value)}
                                                                                        className="bg-gray-700 text-white p-1 rounded w-full"
                                                                                        onKeyPress={(e) => {
                                                                                            if (e.key === 'Enter') {
                                                                                                handleSaveTask();
                                                                                            }
                                                                                        }}
                                                                                    />
                                                                                    <textarea
                                                                                        value={editingTask.description}
                                                                                        onChange={(e) => handleTaskChange('description', e.target.value)}
                                                                                        className="bg-gray-700 text-white p-1 rounded w-full mt-2"
                                                                                        onKeyPress={(e) => {
                                                                                            if (e.key === 'Enter') {
                                                                                                handleSaveTask();
                                                                                            }
                                                                                        }}
                                                                                    />
                                                                                </div>
                                                                            ) : (
                                                                                <>
                                                                                    <div className="font-bold">{task.title}</div>
                                                                                    {task.description && (
                                                                                        <div className="text-sm">{task.description}</div>
                                                                                    )}
                                                                                </>
                                                                            )}
                                                                        </div>
                                                                        <div className="relative ">
                                                                            <button
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation();
                                                                                    setShowTaskDropdown(task.id === showTaskDropdown ? null : task.id);
                                                                                }}
                                                                                className="ml-2"
                                                                            >
                                                                                <FaEllipsisH className="opacity-60 " />
                                                                            </button>
                                                                            {showTaskDropdown === task.id && (
                                                                                <div className="absolute right-0 mt-2 w-32 bg-gray-700 text-white rounded shadow-lg z-10" ref={dropdownRef}>
                                                                                    <button
                                                                                        className="w-full text-left px-4 py-2 hover:bg-gray-600"
                                                                                        onClick={(e) => {
                                                                                            e.stopPropagation();
                                                                                            handleEditTask(task.id, list.id);
                                                                                        }}
                                                                                    >
                                                                                        Rename Task
                                                                                    </button>
                                                                                    <button
                                                                                        className="w-full text-left px-4 py-2 hover:bg-gray-600"
                                                                                        onClick={(e) => {
                                                                                            e.stopPropagation();
                                                                                            handleDeleteTask(task.id, list.id);
                                                                                        }}
                                                                                    >
                                                                                        Delete Task
                                                                                    </button>
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </Draggable>
                                                        ))}
                                                        {provided.placeholder}
                                                    </div>
                                                )}
                                            </Droppable>
                                            <button 
                                                onClick={() => setLists(prevLists => prevLists.map(l => 
                                                    l.id === list.id ? { ...l, addingTask: true } : l
                                                ))}
                                                className="text-sm text-white flex items-center mt-2"
                                            >
                                                <span>+ Add a card</span>
                                            </button>
                                            {list.addingTask && (
                                            <div className="mt-2">
                                                <input 
                                                    type="text"
                                                    value={list.newTaskTitle || ''}
                                                    onChange={(e) => setLists(prevLists => prevLists.map(l => 
                                                        l.id === list.id ? { ...l, newTaskTitle: e.target.value } : l
                                                    ))}
                                                    placeholder="Enter a name for this card..."
                                                    className="border rounded p-2 mb-2 w-full bg-gray-700 hover:bg-gray-600 text-white"
                                                    onKeyDown={async (e) => {
                                                        if (e.key === 'Enter') {
                                                            const title = list.newTaskTitle;
                                                            const description = list.newTaskDescription || '';
                                                            if (title.trim() !== '') {
                                                                try {
                                                                    const response = await axios.post(`http://localhost:5000/api/lists/${list.id}/tasks`, { title, description });
                                                                    setLists(prevLists => prevLists.map(l => 
                                                                        l.id === list.id ? { 
                                                                            ...l, 
                                                                            tasks: [...l.tasks, response.data],
                                                                            newTaskTitle: '',
                                                                            newTaskDescription: '',
                                                                            addingTask: false
                                                                        } : l
                                                                    ));
                                                                } catch (error) {
                                                                    console.error('There was an error adding the task!', error);
                                                                }
                                                            }
                                                        }
                                                    }}
                                                />
                                                <textarea
                                                    value={list.newTaskDescription || ''}
                                                    onChange={(e) => setLists(prevLists => prevLists.map(l => 
                                                        l.id === list.id ? { ...l, newTaskDescription: e.target.value } : l
                                                    ))}
                                                    placeholder="Enter a description for this card..."
                                                    className="border rounded p-2 mb-2 w-full bg-gray-700 hover:bg-gray-600 text-white"
                                                />
                                                <button 
                                                    onClick={async () => {
                                                        const title = list.newTaskTitle;
                                                        const description = list.newTaskDescription || '';
                                                        if (title.trim() !== '') {
                                                            try {
                                                                const response = await axios.post(`http://localhost:5000/api/lists/${list.id}/tasks`, { title, description });
                                                                setLists(prevLists => prevLists.map(l => 
                                                                    l.id === list.id ? { 
                                                                        ...l, 
                                                                        tasks: [...l.tasks, response.data],
                                                                        newTaskTitle: '',
                                                                        newTaskDescription: '',
                                                                        addingTask: false
                                                                    } : l
                                                                ));
                                                            } catch (error) {
                                                                console.error('There was an error adding the task!', error);
                                                            }
                                                        }
                                                    }}
                                                    className="bg-blue-500 text-white px-4 py-2 rounded w-full"
                                                >
                                                    Add Card
                                                </button>
                                                <button 
                                                    onClick={() => setLists(prevLists => prevLists.map(l => 
                                                        l.id === list.id ? { ...l, addingTask: false } : l
                                                    ))}
                                                    className="text-sm text-white flex items-center mt-2"
                                                >
                                                    <span>Cancel</span>
                                                </button>
                                            </div>
                                        )}

                                        </div>
                                    )}
                                </Draggable>
                            ))}
                            {provided.placeholder}
                        </div>
                    )}
                </Droppable>
            </DragDropContext>
            <div className="add-list w-64 p-4 bg-gray-800 rounded mb-4 shadow">
                <input 
                    type="text"
                    value={newListName}
                    onChange={(e) => setNewListName(e.target.value)}
                    placeholder="Add another list"
                    onKeyPress={handleKeyPress}
                    className="border rounded p-2 mb-4 w-full"
                />
                <button onClick={handleAddList} className="bg-blue-500 text-white px-4 py-2 rounded w-full">
                    Add List
                </button>
            </div>
        </div>
    );
}

export default BoardContent;
