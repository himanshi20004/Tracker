import { Navigate } from 'react-router-dom';
import { getStoredUser } from '../utils/api';

const ProtectedRoute = ({ children, allowedRoles }) => {
    const token = localStorage.getItem('token');
    const storedUser = getStoredUser();
    const role = storedUser?.role || localStorage.getItem('role');

    if (!token || !role) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(role)) {
        return <Navigate to={role === 'admin' ? '/adminDashboard' : '/userDashboard'} replace />;
    }

    return children;
};

export default ProtectedRoute;
