import React, { useState } from 'react';
import TaskModal from '../Task/TaskModal';

function DropdownMenu({ listId, onTaskCreated }) {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleAddTaskClick = () => {
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    return (
        <div className="relative">
            <button onClick={handleAddTaskClick} className="text-white">
                <svg className="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                    <path stroke="currentColor" strokeLinecap="round" strokeWidth="2" d="M6 12h.01m6 0h.01m5.99 0h.01"/>
                </svg>
            </button>
            {isModalOpen && (
                <TaskModal
                    listId={listId}
                    onClose={handleCloseModal}
                    onTaskCreated={onTaskCreated}
                />
            )}
        </div>
    );
}

export default DropdownMenu;
