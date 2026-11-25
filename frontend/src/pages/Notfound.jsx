import { useNavigate, Link } from 'react-router-dom';
import { getStoredUser } from '../utils/api';

const Notfound = () => {
    const navigate = useNavigate();
    const user = getStoredUser();
    const dashboardPath = user?.role === 'admin' ? '/adminDashboard' : '/userDashboard';

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-6 font-sans">
            <div className="max-w-md w-full text-center bg-white rounded-3xl border border-gray-100 shadow-sm p-10">
                <div className="text-5xl mb-4">🧭</div>
                <p className="text-xs font-bold uppercase tracking-widest text-purple-600 mb-2">404</p>
                <h1 className="text-2xl font-extrabold text-gray-900 mb-2">Page not found</h1>
                <p className="text-sm text-gray-500 mb-8">
                    The page you are looking for does not exist or has been moved.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <button
                        onClick={() => navigate(-1)}
                        className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition"
                    >
                        ← Go Back
                    </button>
                    <Link
                        to={user ? dashboardPath : '/'}
                        className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-blue-500 text-white text-sm font-semibold hover:opacity-90 transition shadow-sm"
                    >
                        {user ? 'Go to Dashboard' : 'Go Home'}
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Notfound;
