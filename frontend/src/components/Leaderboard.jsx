import { useEffect, useState } from 'react';
import api from '../utils/api';

const Leaderboard = () => {
    const [leaderboard, setLeaderboard] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                const response = await api.get('/leaderboard');
                setLeaderboard(response.data.leaderboard || []);
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to load leaderboard.');
            } finally {
                setLoading(false);
            }
        };
        fetchLeaderboard();
    }, []);

    const getInitials = (name) => name?.charAt(0).toUpperCase() || '?';

    if (loading) {
        return <div className="text-center py-12 text-sm text-gray-400">Loading leaderboard...</div>;
    }

    if (error) {
        return <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">{error}</div>;
    }

    return (
        <div className="w-full max-w-5xl mx-auto p-4 sm:p-0">
            {leaderboard.length > 0 ? (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10 items-end pt-4">
                        {leaderboard[1] && (
                            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm text-center flex flex-col items-center order-2 sm:order-1">
                                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center text-xl font-bold text-gray-600 mb-3 border-4 border-gray-50">
                                    {getInitials(leaderboard[1].username)}
                                </div>
                                <p className="text-sm font-bold text-gray-900">{leaderboard[1].username}</p>
                                <p className="text-xs text-purple-600 font-bold mt-1">{leaderboard[1].points} pts</p>
                                <div className="mt-4 bg-gray-100 text-gray-600 text-[10px] font-black px-3 py-1 rounded-full">2ND</div>
                            </div>
                        )}

                        {leaderboard[0] && (
                            <div className="bg-white p-8 rounded-3xl border-2 border-purple-100 shadow-xl shadow-purple-50 text-center flex flex-col items-center sm:scale-105 z-10 order-1 sm:order-2">
                                <div className="relative mb-4">
                                    <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-yellow-400 to-orange-500 flex items-center justify-center text-2xl font-bold text-white shadow-lg">
                                        {getInitials(leaderboard[0].username)}
                                    </div>
                                    <span className="absolute -top-3 -right-2 text-3xl">👑</span>
                                </div>
                                <p className="text-base font-black text-gray-900">{leaderboard[0].username}</p>
                                <p className="text-sm text-purple-600 font-black mt-1">{leaderboard[0].points} pts</p>
                                <div className="mt-4 bg-yellow-400 text-yellow-900 text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest">Champion</div>
                            </div>
                        )}

                        {leaderboard[2] && (
                            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm text-center flex flex-col items-center order-3">
                                <div className="w-16 h-16 rounded-full bg-orange-50 flex items-center justify-center text-xl font-bold text-orange-700 mb-3 border-4 border-orange-50">
                                    {getInitials(leaderboard[2].username)}
                                </div>
                                <p className="text-sm font-bold text-gray-900">{leaderboard[2].username}</p>
                                <p className="text-xs text-purple-600 font-bold mt-1">{leaderboard[2].points} pts</p>
                                <div className="mt-4 bg-orange-100 text-orange-700 text-[10px] font-black px-3 py-1 rounded-full">3RD</div>
                            </div>
                        )}
                    </div>

                    {leaderboard.length > 3 && (
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-10">
                            <div className="divide-y divide-gray-50">
                                {leaderboard.slice(3).map((user, index) => (
                                    <div key={user._id} className="flex items-center justify-between px-6 sm:px-8 py-4 hover:bg-gray-50 transition">
                                        <div className="flex items-center gap-4 sm:gap-6">
                                            <span className="text-sm font-black text-gray-300 w-6">#{index + 4}</span>
                                            <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-xs font-bold text-gray-500 border border-gray-100">
                                                {getInitials(user.username)}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-gray-900">{user.username}</p>
                                                <p className="text-[10px] text-gray-400 uppercase tracking-tighter">Student</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-black text-gray-900">{user.points}</p>
                                            <p className="text-[10px] text-purple-500 font-bold uppercase">Points</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </>
            ) : (
                <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
                    <p className="text-gray-400 text-sm">No rankings available yet. Complete tasks or quizzes to lead!</p>
                </div>
            )}
        </div>
    );
};

export default Leaderboard;
