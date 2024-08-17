import React from 'react';
import TaskList from './components/TaskList'; // Ensure this path is correct

function App() {
    return (
        <div className="App">
            <h1 className="text-2xl font-bold p-4">Task Management</h1>
            <TaskList listId={1} /> {/* Replace `1` with the actual listId you want to display tasks for */}
        </div>
    );
}

export default App;
