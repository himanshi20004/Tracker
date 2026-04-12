import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const Leaderboard = () => {
    const [leaderboard, setLeaderboard] = useState([]);
    const navigate = useNavigate();

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
                console.error('Error fetching leaderboard:', error);
            }
        };
        fetchLeaderboard();
    }, []);

    // Helper to get initials for avatars
    const getInitials = (name) => name?.charAt(0).toUpperCase() || '?';

    return (
        <div className="min-h-screen flex bg-gray-50 font-sans">
            {/* ═══ SIDEBAR (Synchronized with Website) ═══ */}
            <aside className="w-64 shrink-0 flex flex-col bg-white border-r border-gray-100 shadow-sm min-h-screen">
                <div className="flex items-center gap-2.5 px-6 py-5 border-b border-gray-100">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-blue-500 flex items-center justify-center shadow">
                        <div className="w-2 h-2 bg-white rounded-full" />
                    </div>
                    <span className="text-lg font-bold text-gray-900">StudyWave</span>
                </div>

                <nav className="flex-1 px-3 space-y-1 mt-4">
                    <Link to="/adminDashboard" className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-[14px] font-medium text-gray-600 hover:bg-gray-50 transition">
                        🛠 Dashboard
                    </Link>
                    <Link to="/leaderboard" className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-[14px] font-medium bg-gradient-to-r from-purple-600 to-blue-500 text-white shadow-md">
                        🏆 Leaderboard
                    </Link>
                    <Link to="/admin/create-quiz" className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-[14px] font-medium text-gray-600 hover:bg-gray-50 transition">
                        🧠 Create Quiz
                    </Link>
                    <Link to="/upload" className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-[14px] font-medium text-gray-600 hover:bg-gray-50 transition">
                        📚 Resources
                    </Link>
                </nav>

                <div className="px-4 pb-6 mt-auto">
                    <button onClick={() => { localStorage.clear(); navigate('/login'); }} className="w-full px-4 py-2.5 text-[13px] font-medium text-red-600 bg-red-50 border border-red-100 rounded-xl hover:bg-red-100 transition">
                        🚪 Logout
                    </button>
                </div>
            </aside>

            {/* ═══ MAIN CONTENT ═══ */}
            <main className="flex-1 overflow-y-auto">
                <header className="sticky top-0 z-10 flex items-center justify-between px-8 py-4 bg-white border-b border-gray-100 shadow-sm">
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">Leaderboard</h1>
                        <p className="text-xs text-gray-400 mt-0.5">Top performing students this week ⚡</p>
                    </div>
                </header>

                <div className="px-8 py-10 max-w-5xl mx-auto">
                    {leaderboard.length > 0 ? (
                        <>
                            {/* TOP 3 PODIUM */}
                            <div className="grid grid-cols-3 gap-6 mb-12 items-end">
                                {/* Rank 2 */}
                                {leaderboard[1] && (
                                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm text-center flex flex-col items-center">
                                        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center text-xl font-bold text-gray-600 mb-3 border-4 border-gray-50">
                                            {getInitials(leaderboard[1].username)}
                                        </div>
                                        <p className="text-sm font-bold text-gray-900">{leaderboard[1].username}</p>
                                        <p className="text-xs text-purple-600 font-bold mt-1">{leaderboard[1].points} pts</p>
                                        <div className="mt-4 bg-gray-100 text-gray-600 text-[10px] font-black px-3 py-1 rounded-full">2ND</div>
                                    </div>
                                )}

                                {/* Rank 1 (The Winner) */}
                                {leaderboard[0] && (
                                    <div className="bg-white p-8 rounded-3xl border-2 border-purple-100 shadow-xl shadow-purple-50 text-center flex flex-col items-center transform scale-110 z-10">
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

                                {/* Rank 3 */}
                                {leaderboard[2] && (
                                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm text-center flex flex-col items-center">
                                        <div className="w-16 h-16 rounded-full bg-orange-50 flex items-center justify-center text-xl font-bold text-orange-700 mb-3 border-4 border-orange-50">
                                            {getInitials(leaderboard[2].username)}
                                        </div>
                                        <p className="text-sm font-bold text-gray-900">{leaderboard[2].username}</p>
                                        <p className="text-xs text-purple-600 font-bold mt-1">{leaderboard[2].points} pts</p>
                                        <div className="mt-4 bg-orange-100 text-orange-700 text-[10px] font-black px-3 py-1 rounded-full">3RD</div>
                                    </div>
                                )}
                            </div>

                            {/* REMAINING RANKINGS */}
                            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                                <div className="divide-y divide-gray-50">
                                    {leaderboard.slice(3).map((user, index) => (
                                        <div key={user._id} className="flex items-center justify-between px-8 py-5 hover:bg-gray-50 transition">
                                            <div className="flex items-center gap-6">
                                                <span className="text-sm font-black text-gray-300 w-4">#{index + 4}</span>
                                                <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-xs font-bold text-gray-500 border border-gray-100">
                                                    {getInitials(user.username)}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-gray-900">{user.username}</p>
                                                    <p className="text-[10px] text-gray-400 uppercase tracking-tighter">Verified Student</p>
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
                        </>
                    ) : (
                        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
                            <p className="text-gray-400 text-sm">No rankings available yet. Start a quiz to lead!</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default Leaderboard;