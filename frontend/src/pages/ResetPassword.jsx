import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';

const ResetPassword = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');

        if (password.length < 8) {
            setError('Password must be at least 8 characters long.');
            return;
        }
        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        setLoading(true);
        try {
            await api.put(`/password/reset/${token}`, { password, confirmPassword });
            setMessage('Password reset successfully! Redirecting to login...');
            setTimeout(() => navigate('/login'), 1500);
        } catch (err) {
            setError(err.response?.data?.message || 'Reset link is invalid or has expired.');
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

                <h1 className="text-2xl font-extrabold text-gray-900 mb-2">Reset Password</h1>
                <p className="text-sm text-gray-500 mb-6">
                    Choose a strong new password (at least 8 characters).
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
                            New Password
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            minLength={8}
                            placeholder="Min. 8 characters"
                            className="w-full px-4 py-2.5 text-[14px] bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:border-purple-500 focus:bg-white focus:ring-2 focus:ring-purple-100 transition"
                        />
                    </div>
                    <div>
                        <label className="block text-[13px] font-medium text-gray-700 mb-1.5">
                            Confirm New Password
                        </label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            minLength={8}
                            placeholder="Re-enter password"
                            className="w-full px-4 py-2.5 text-[14px] bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:border-purple-500 focus:bg-white focus:ring-2 focus:ring-purple-100 transition"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 text-[15px] font-semibold text-white bg-gradient-to-r from-purple-600 to-blue-500 rounded-xl shadow-md hover:opacity-90 transition disabled:opacity-60"
                    >
                        {loading ? 'Updating...' : 'Reset Password'}
                    </button>
                </form>

                <p className="text-center text-[13px] text-gray-500 mt-6">
                    <Link to="/login" className="text-purple-600 font-semibold hover:underline">
                        Back to sign in
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default ResetPassword;
