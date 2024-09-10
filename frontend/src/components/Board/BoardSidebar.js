import React, { useState } from 'react';
import { FaPlus, FaTrash, FaPen } from 'react-icons/fa';
import axios from 'axios';

function BoardSidebar({ boards, onBoardCreated, onBoardSelect, onBoardDeleted, onBoardRenamed }) {
    const [showAddBoardForm, setShowAddBoardForm] = useState(false);
    const [newBoardName, setNewBoardName] = useState('');
    const [newBoardColor, setNewBoardColor] = useState('#ffffff');
    const [isRenaming, setIsRenaming] = useState(false);
    const [renamingBoardId, setRenamingBoardId] = useState(null);
    const [renamingBoardName, setRenamingBoardName] = useState('');
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [boardToDelete, setBoardToDelete] = useState(null);

    // Add Board
    const handleAddBoard = async () => {
        if (newBoardName.trim() !== '') {
            try {
                const response = await axios.post('http://localhost:5000/api/boards', {
                    name: newBoardName,
                    color: newBoardColor
                });
                onBoardCreated(response.data);
                setNewBoardName('');
                setNewBoardColor('#ffffff');
                setShowAddBoardForm(false);
            } catch (error) {
                console.error('Error adding board:', error);
            }
        } else {
            console.log('Board name cannot be empty.');
        }
    };

    // Delete Board
    const handleDeleteBoard = async () => {
        if (boardToDelete) {
            try {
                const response = await axios.delete(`http://localhost:5000/api/boards/${boardToDelete}`);
                if (response.status === 200) {
                    onBoardDeleted(boardToDelete);
                    setShowDeleteConfirm(false);
                    setBoardToDelete(null);
                }
            } catch (error) {
                console.error('Error deleting board:', error);
            }
        }
    };

    // Rename Board
    const handleRenameBoard = async () => {
        if (renamingBoardName.trim() !== '') {
            try {
                const response = await axios.put(`http://localhost:5000/api/boards/${renamingBoardId}`, {
                    name: renamingBoardName
                });

                if (response.status === 200) {
                    onBoardRenamed(response.data);
                    setIsRenaming(false);
                    setRenamingBoardId(null);
                }
            } catch (error) {
                console.error('Error renaming board:', error);
            }
        } else {
            setIsRenaming(false);
            setRenamingBoardId(null);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleRenameBoard();
        }
    };

    return (
        <div className="sidebar p-4 bg-gray-900 min-h-screen text-black w-64">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl text-white">Your boards</h3>
                <button className="text-white" onClick={() => setShowAddBoardForm(!showAddBoardForm)}>
                    <FaPlus />
                </button>
            </div>
            <div className="board-list mb-4">
                {boards.map(board => (
                    <div
                        key={board.id}
                        className="board-item flex justify-between items-center p-2 rounded mb-2 cursor-pointer hover:bg-gray-800 group text-white"
                        onClick={() => onBoardSelect(board.id)}
                    >
                        <div className="flex items-center">
                            <div
                                className="w-4 h-4 mr-2 rounded"
                                style={{ backgroundColor: board.color }}
                            ></div>
                            {isRenaming && renamingBoardId === board.id ? (
                                <input
                                    type="text"
                                    value={renamingBoardName}
                                    onChange={(e) => setRenamingBoardName(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    className="bg-gray-800 text-white p-1 rounded"
                                    autoFocus
                                />
                            ) : (
                                <span>{board.name}</span>
                            )}
                        </div>
                        <div className="flex space-x-2">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setRenamingBoardId(board.id);
                                    setRenamingBoardName(board.name);
                                    setIsRenaming(true);
                                }}
                                className="text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                            >
                                <FaPen />  
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setBoardToDelete(board.id);
                                    setShowDeleteConfirm(true);
                                }}
                                className="text-red-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                            >
                                <FaTrash />  
                            </button>
                        </div>
                    </div>
                ))}
            </div>
            {showAddBoardForm && (
                <div className="add-board-form mt-4">
                    <input
                        type="text"
                        placeholder="Board name"
                        value={newBoardName}
                        onChange={(e) => setNewBoardName(e.target.value)}
                        className="w-full p-2 mb-2 border rounded"
                    />
                    <label className="text-sm mb-2 text-white">Choose a color:</label>
                    <input
                        type="color"
                        value={newBoardColor}
                        onChange={(e) => setNewBoardColor(e.target.value)}
                        className="h-10 w-full p-2 mb-2 border rounded"
                    />
                    <button onClick={handleAddBoard} className="bg-blue-500 text-white p-2 rounded w-full">
                        Add Board
                    </button>
                </div>
            )}

            {showDeleteConfirm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="bg-gray-800 p-4 rounded shadow-lg w-96">
                        <h2 className="text-white mb-4">Are you sure you want to delete this board?</h2>
                        <div className="flex justify-end space-x-4">
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                className="bg-gray-500 text-white px-4 py-2 rounded"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteBoard}
                                className="bg-red-500 text-white px-4 py-2 rounded"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default BoardSidebar;
