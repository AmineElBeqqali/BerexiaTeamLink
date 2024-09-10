import React, { useState, useEffect } from 'react';
import axios from 'axios';
import BoardSidebar from './components/Board/BoardSidebar';
import MainBoardComponent from './components/MainBoardComponent';

function App() {
    const [boards, setBoards] = useState([]);
    const [selectedBoardId, setSelectedBoardId] = useState(null);
    const [selectedBoardName, setSelectedBoardName] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBoards = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/boards');
                setBoards(response.data);

                // Get the last selected board ID from local storage
                const savedBoardId = localStorage.getItem('selectedBoardId');
                if (savedBoardId && response.data.some(board => board.id === parseInt(savedBoardId))) {
                    const selectedBoard = response.data.find(board => board.id === parseInt(savedBoardId));
                    setSelectedBoardId(parseInt(savedBoardId));
                    setSelectedBoardName(selectedBoard.name);
                } else if (response.data.length > 0) {
                    setSelectedBoardId(response.data[0].id);
                    setSelectedBoardName(response.data[0].name);
                }
            } catch (error) {
                console.error('Error fetching boards:', error);
            } finally {
                setLoading(false); // Set loading to false when data is fetched
            }
        };

        fetchBoards();
    }, []);

    const handleBoardCreated = (newBoard) => {
        setBoards([...boards, newBoard]);
        setSelectedBoardId(newBoard.id);
        setSelectedBoardName(newBoard.name);
        localStorage.setItem('selectedBoardId', newBoard.id);  // Save to local storage
    };

    const handleBoardSelect = (boardId) => {
        const selectedBoard = boards.find(board => board.id === boardId);
        setSelectedBoardId(boardId);
        setSelectedBoardName(selectedBoard.name);
        localStorage.setItem('selectedBoardId', boardId);  // Save to local storage
    };

    const handleBoardDeleted = async (boardId) => {
        await axios.delete(`http://localhost:5000/api/boards/${boardId}`);

        // Fetch the updated list of boards
        const response = await axios.get('http://localhost:5000/api/boards');
        setBoards(response.data);
    };

    // New handler for renaming a board
    const handleBoardRenamed = (updatedBoard) => {
        setBoards(prevBoards =>
            prevBoards.map(board =>
                board.id === updatedBoard.id ? updatedBoard : board
            )
        );
        
        // Update the selected board name if the renamed board is the one currently selected
        if (updatedBoard.id === selectedBoardId) {
            setSelectedBoardName(updatedBoard.name);
        }
    };

    if (loading) {
        return <div className="loading-screen">Loading...</div>; // Show loading screen or spinner
    }

    return (
        <div className="flex">
            <BoardSidebar
                boards={boards}
                onBoardSelect={handleBoardSelect}
                onBoardCreated={handleBoardCreated}
                onBoardDeleted={handleBoardDeleted}  // Pass the delete handler
                onBoardRenamed={handleBoardRenamed}  // Pass the rename handler
            />
            <div className="flex-grow">
                {selectedBoardId && (
                    <MainBoardComponent 
                        boardId={selectedBoardId} 
                        boardName={selectedBoardName} 
                    />
                )}
            </div>
        </div>
    );
}

export default App;
