import React from 'react';
import BoardContent from './Board/BoardContent';
import Header from './Board/Header';

function MainBoardComponent({ boardId, boardName }) {
    return (
        <div className="min-h-screen flex flex-col bg-gray-800">
            <Header boardName={boardName} />
            <BoardContent boardId={boardId} boardName={boardName} />
        </div>
    );
}
export default MainBoardComponent;