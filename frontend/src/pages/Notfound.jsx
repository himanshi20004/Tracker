import React from 'react';
import { useNavigate, Link } from 'react-router-dom';

const WorkInProgress = ({ featureName = "This Feature" }) => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen flex bg-gray-50 font-sans">
            {/* ═══ SIDEBAR (Consistent with App) ═══ */}
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
                    <Link to="/leaderboard" className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-[14px] font-medium text-gray-600 hover:bg-gray-50 transition">
                        🏆 Leaderboard
                    </Link>
                    {/* Add more links as per your sidebar design */}
                </nav>
            </aside>

            {/* ═══ MAIN CONTENT ═══ */}
            <main className="flex-1 flex flex-col items-center justify-center p-8">
                <div className="max-w-md w-full text-center">
                    
                    {/* Animated Illustration Placeholder */}
                    <div className="relative mb-8 flex justify-center">
                        <div className="w-64 h-64 bg-purple-100 rounded-full animate-pulse absolute -z-10 opacity-50 blur-2xl"></div>
                        <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-50 relative">
                            <span className="text-7xl">🚀</span>
                            <div className="absolute -top-2 -right-2 bg-gradient-to-tr from-purple-600 to-blue-500 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase">
                                Coming Soon
                            </div>
                        </div>
                    </div>

                    {/* Text Content */}
                    <h1 className="text-3xl font-black text-gray-900 mb-3 leading-tight">
                        {featureName} is almost here!
                    </h1>
                    <p className="text-gray-500 text-sm mb-8 leading-relaxed">
                        We're currently polishing the mentorship program and exclusive features to give you the best experience possible. 
                        Check back in a few days!
                    </p>

                    {/* Progress Bar UI Mockup */}
                    <div className="bg-white border border-gray-100 p-4 rounded-2xl mb-8 flex items-center gap-4">
                        <div className="flex-1 bg-gray-100 h-2.5 rounded-full overflow-hidden">
                            <div className="bg-gradient-to-r from-purple-600 to-blue-500 h-full w-[75%] rounded-full transition-all duration-1000"></div>
                        </div>
                        <span className="text-xs font-bold text-purple-600">75% Done</span>
                    </div>

                    {/* Back Button */}
                    <button 
                        onClick={() => navigate(-1)}
                        className="inline-flex items-center gap-2 px-8 py-3 bg-gray-900 text-white rounded-2xl font-bold text-sm hover:shadow-lg hover:shadow-gray-200 transition-all active:scale-95"
                    >
                        ← Go Back to Dashboard
                    </button>
                    
                    <div className="mt-12 flex justify-center gap-4 opacity-30 grayscale">
                        {/* Fake "People working" avatars */}
                        <div className="w-8 h-8 rounded-full bg-gray-300"></div>
                        <div className="w-8 h-8 rounded-full bg-gray-400"></div>
                        <div className="w-8 h-8 rounded-full bg-gray-200"></div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default WorkInProgress;