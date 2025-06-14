import React from 'react';
import { useNavigate } from 'react-router-dom';

const RedirectButton = () => {
    const navigate = useNavigate();

    const handleRedirect = () => {
        navigate('/leaderboard'); // Redirect to the leaderboard route
    };

    const handleTime = () => {
        navigate('/Timetable'); // Redirect to the timetable route
    };
    const handlechat = () => {
        navigate('/Chat'); // Redirect to the timetable route
    };
     const handleDoubt = () => {
        navigate('/doubt'); // Redirect to the timetable route
    };

    return (
        <div> {/* Wrapping div */}
            <button 
                onClick={handleRedirect} 
                className="bg-purple-600 text-white p-2 rounded font-serif m-2"
            >
                Go to Leaderboard
            </button>
            <button 
                onClick={handleTime} 
                className="bg-purple-600 text-white p-2 rounded font-serif m-2"
            >
                Timetable
            </button>
            <button 
                onClick={handlechat} 
                className="bg-purple-600 text-white p-2 rounded font-serif m-2"
            >
                Chat with friends
            </button>
            <button 
                onClick={handleDoubt} 
                className="bg-purple-600 text-white p-2 rounded font-serif m-2"
            >
                Doubt
            </button>
        </div>
    );
};

export default RedirectButton;
