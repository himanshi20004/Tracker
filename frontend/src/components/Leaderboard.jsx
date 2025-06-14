import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Leaderboard = () => {
    const [leaderboard, setLeaderboard] = useState([]);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/v1/leaderboard', {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    },
                });
                setLeaderboard(response.data.leaderboard);
            } catch (error) {
                console.error('Error fetching leaderboard:', error.response ? error.response.data : error.message);
            }
        };

        fetchLeaderboard();
        
    }, []);

    return (
        <div className="bg-gradient-to-t from-black to-[#3b0a45] h-[150vh] text-white p-8 font-serif">
            <h1 className="text-4xl font-bold text-center mb-8">Leaderboard</h1>

            {/* Users List in Vertical Layout */}
            <div className="flex flex-col space-y-6 h-1 items-center">
                {leaderboard.length > 0 ? (
                    leaderboard.map((user, index) => (
                        <div
                            key={user._id}
                            className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl shadow-lg p-6 flex items-center justify-between w-2/5 h-32"  // Increased width and decreased height
                        >
                            {/* Rank */}
                            <div className="text-3xl font-semibold text-white">
                                <span className="bg-yellow-400 text-black rounded-full px-6 py-3">{index + 1}</span>
                            </div>

                            {/* User Info (Horizontal Layout) */}
                            <div className="flex flex-row items-center space-x-6">
                                <div className="flex flex-col items-center">
                                    <span className="text-xl font-bold">{user.username}</span>
                                    <span className="text-sm text-gray-300">Username</span>
                                </div>

                                <div className="text-xl font-semibold text-yellow-300">
                                    {user.points} Points
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center text-lg text-gray-400">No users found.</div>
                )}
            </div>
        </div>
    );
};

export default Leaderboard;
