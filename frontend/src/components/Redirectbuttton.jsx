import React from 'react';

const RedirectButton = ({ setActiveTab }) => {
    return (
        <div>
            <button 
                onClick={() => setActiveTab('quizzes')}
                className="bg-purple-600 text-white p-2 rounded font-serif m-2"
            >
                Go to Leaderboard
            </button>

            <button 
                onClick={() => setActiveTab('timetable')}
                className="bg-purple-600 text-white p-2 rounded font-serif m-2"
            >
                Timetable
            </button>

            <button 
                onClick={() => setActiveTab('chat')}
                className="bg-purple-600 text-white p-2 rounded font-serif m-2"
            >
                Chat with friends
            </button>

            <button 
                onClick={() => setActiveTab('doubt')}
                className="bg-purple-600 text-white p-2 rounded font-serif m-2"
            >
                Doubt
            </button>
        </div>
    );
};

export default RedirectButton;