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
        <div className="bg-gradient-to-t from-black to-[#3b0a45] h-screen text-white p-5 font-serif">
            <h1 className="text-3xl font-bold mb-4">Leaderboard</h1>
            <table className="min-w-full border-collapse">
                <thead>
                    <tr>
                        <th className="border p-2">Rank</th>
                        <th className="border p-2">Username</th>
                        <th className="border p-2">Points</th>
                    </tr>
                </thead>
                <tbody>
                    {leaderboard.length > 0 ? (
                        leaderboard.map((user, index) => (
                            <tr key={user._id} className="border">
                                <td className="border p-2">{index + 1}</td>
                                <td className="border p-2">{user.username}</td>
                                <td className="border p-2">{user.points}</td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="3" className="border p-2 text-center">No users found.</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default Leaderboard;
