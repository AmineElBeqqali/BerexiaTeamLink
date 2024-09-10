import React from 'react';

function Header({ boardName, onMenuClick }) {
    return (
        <div className="flex items-center justify-between p-4 text-white backdrop-blur-sm bg-black/30 mb-3">
            <div className="text-xl font-bold">{boardName}</div>
            <div className="cursor-pointer" onClick={onMenuClick}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 12h12M6 6h12M6 18h12" />
                </svg>
            </div>
        </div>
    );
}

export default Header;
