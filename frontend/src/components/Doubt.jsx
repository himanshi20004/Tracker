import React, { useState } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';

const Doubt = () => {
    const [doubt, setDoubt] = useState('');
    const [answer, setAnswer] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!doubt.trim()) return;

        setLoading(true);
        setAnswer('');

        try {
            const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/v1/solveDoubt`, 
                { doubt }, 
                {
                    headers: { 
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}` 
                    }
                }
            );
            setAnswer(res.data.answer);
        } catch (err) {
            setAnswer('⚠️ **Connection Failed.** The AI tutor couldn\'t be reached. Please check your internet or try again later.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full w-full animate-in fade-in duration-700">
            {/* Header Section */}
            <div className="mb-8">
                <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">AI Mentor</h1>
                <p className="text-gray-500 mt-2">Personalized step-by-step guidance for your toughest questions.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 flex-grow">
                {/* Input Section */}
                <div className="lg:col-span-2 flex flex-col gap-4">
                    <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 flex flex-col h-fit sticky top-6">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Your Question</label>
                        <textarea
                            className="w-full p-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all text-gray-700 text-sm resize-none min-h-[200px]"
                            placeholder="Type your doubt here... (e.g., 'Explain the second law of thermodynamics')"
                            value={doubt}
                            onChange={(e) => setDoubt(e.target.value)}
                        />
                        
                        <button
                            type="submit"
                            disabled={loading || !doubt.trim()}
                            className={`mt-4 w-full py-4 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-3 shadow-lg shadow-purple-100 ${
                                loading 
                                ? 'bg-gray-100 text-gray-400 cursor-wait' 
                                : 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:opacity-90 active:scale-[0.98]'
                            }`}
                        >
                            {loading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Processing...
                                </>
                            ) : (
                                <><span>✨</span> Solve My Doubt</>
                            )}
                        </button>
                    </form>
                </div>

                {/* Response Section */}
                <div className="lg:col-span-3">
                    {!answer && !loading ? (
                        <div className="h-full flex flex-col items-center justify-center border-2 border-dashed border-gray-100 rounded-3xl p-10 text-center">
                            <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center text-3xl mb-4">💡</div>
                            <h3 className="text-lg font-semibold text-gray-900">Waiting for your question</h3>
                            <p className="text-gray-400 text-sm max-w-xs mt-2">Enter your doubt on the left to start a session with your AI tutor.</p>
                        </div>
                    ) : (
                        <div className={`bg-white rounded-3xl border border-gray-100 shadow-sm p-8 min-h-full transition-all ${loading ? 'opacity-50 blur-[1px]' : 'opacity-100'}`}>
                            <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-50">
                                <div className="p-3 bg-purple-100 text-purple-600 rounded-xl text-xl">🤖</div>
                                <div>
                                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Solution Engine</h3>
                                    <p className="text-xs text-green-500 font-medium italic">Verified Step-by-Step Response</p>
                                </div>
                            </div>

                            {/* Markdown Content */}
                            <div className="prose prose-purple max-w-none text-gray-700 leading-relaxed">
                                <ReactMarkdown>
                                    {answer || "Analyzing your request... please hold on."}
                                </ReactMarkdown>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Doubt;