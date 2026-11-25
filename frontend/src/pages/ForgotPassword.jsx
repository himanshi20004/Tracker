import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        setError('');

        try {
            const res = await api.post('/password/forgot', { email });
            setMessage(
                res.data?.message ||
                'If an account with that email exists, a password reset link has been sent.'
            );
        } catch (err) {
            setError(err.response?.data?.message || 'Unable to process your request right now.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50 px-4">
            <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
                <div className="flex items-center gap-2.5 mb-8">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-600 to-blue-500 flex items-center justify-center shadow-md">
                        <div className="w-2.5 h-2.5 bg-white rounded-full" />
                    </div>
                    <span className="text-xl font-bold text-indigo-900">StudyWave</span>
                </div>

                <h1 className="text-2xl font-extrabold text-gray-900 mb-2">Forgot your password?</h1>
                <p className="text-sm text-gray-500 mb-6">
                    Enter your registered email address and we will send you a link to reset your password.
                </p>

                {message && (
                    <div className="mb-5 px-4 py-3 bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl">
                        {message}
                    </div>
                )}
                {error && (
                    <div className="mb-5 px-4 py-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-[13px] font-medium text-gray-700 mb-1.5">
                            Email address
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder="you@example.com"
                            className="w-full px-4 py-2.5 text-[14px] bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:border-purple-500 focus:bg-white focus:ring-2 focus:ring-purple-100 transition"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 text-[15px] font-semibold text-white bg-gradient-to-r from-purple-600 to-blue-500 rounded-xl shadow-md hover:opacity-90 transition disabled:opacity-60"
                    >
                        {loading ? 'Sending...' : 'Send Reset Link'}
                    </button>
                </form>

                <p className="text-center text-[13px] text-gray-500 mt-6">
                    Remembered your password?{' '}
                    <Link to="/login" className="text-purple-600 font-semibold hover:underline">
                        Back to sign in
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default ForgotPassword;
