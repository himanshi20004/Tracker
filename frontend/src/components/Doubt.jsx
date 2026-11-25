import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import api from '../utils/api';

const Doubt = ({ standalone = false }) => {
    const [doubt, setDoubt] = useState('');
    const [answer, setAnswer] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!doubt.trim() || loading) return;

        setLoading(true);
        setAnswer('');
        setError('');

        try {
            const res = await api.post('/solveDoubt', { doubt: doubt.trim() });
            setAnswer(res.data.answer);
        } catch (err) {
            const msg = err.response?.data?.message || 'The AI tutor could not be reached. Please try again later.';
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full w-full">
            <div className="mb-8 flex items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">AI Mentor</h1>
                    <p className="text-gray-500 mt-1 text-sm">Personalized step-by-step guidance for your toughest questions.</p>
                </div>
                {standalone && (
                    <button
                        onClick={() => navigate(-1)}
                        className="px-4 py-2 text-xs font-semibold text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50"
                    >
                        ← Back
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 flex-grow">
                <div className="lg:col-span-2 flex flex-col gap-4">
                    <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 flex flex-col h-fit sticky top-6">
                        <div className="flex items-center justify-between mb-3">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Your Question</label>
                            <span className="text-[11px] text-gray-400">{doubt.length}/2000</span>
                        </div>
                        <textarea
                            className="w-full p-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:ring-2 focus:ring-purple-500 outline-none transition-all text-gray-700 text-sm resize-none min-h-[200px]"
                            placeholder="Type your doubt here... (e.g., 'Explain the second law of thermodynamics')"
                            value={doubt}
                            maxLength={2000}
                            onChange={(e) => setDoubt(e.target.value)}
                        />

                        <button
                            type="submit"
                            disabled={loading || !doubt.trim()}
                            className={`mt-4 w-full py-4 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-3 shadow-lg shadow-purple-100 ${
                                loading
                                    ? 'bg-gray-100 text-gray-400 cursor-wait'
                                    : 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:opacity-90 active:scale-[0.98] disabled:opacity-50'
                            }`}
                        >
                            {loading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-purple-500/30 border-t-purple-600 rounded-full animate-spin" />
                                    Processing...
                                </>
                            ) : (
                                <><span>✨</span> Solve My Doubt</>
                            )}
                        </button>
                    </form>
                </div>

                <div className="lg:col-span-3">
                    {error ? (
                        <div className="bg-red-50 border border-red-200 rounded-3xl p-8 text-red-700 text-sm">
                            ⚠️ {error}
                        </div>
                    ) : !answer && !loading ? (
                        <div className="h-full min-h-[260px] flex flex-col items-center justify-center border-2 border-dashed border-gray-100 rounded-3xl p-10 text-center">
                            <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center text-3xl mb-4">💡</div>
                            <h3 className="text-lg font-semibold text-gray-900">Waiting for your question</h3>
                            <p className="text-gray-400 text-sm max-w-xs mt-2">Enter your doubt on the left to start a session with your AI tutor.</p>
                        </div>
                    ) : (
                        <div className={`bg-white rounded-3xl border border-gray-100 shadow-sm p-8 min-h-full transition-all ${loading ? 'opacity-50' : 'opacity-100'}`}>
                            <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-50">
                                <div className="p-3 bg-purple-100 text-purple-600 rounded-xl text-xl">🤖</div>
                                <div>
                                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Solution Engine</h3>
                                    <p className="text-xs text-green-500 font-medium italic">Step-by-Step AI Guidance</p>
                                </div>
                            </div>

                            <div className="prose prose-purple max-w-none text-gray-700 leading-relaxed text-sm">
                                <ReactMarkdown>
                                    {answer || 'Analyzing your request... please hold on.'}
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
