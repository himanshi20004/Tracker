// App.jsx
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import LoginPage from './pages/Loginpage';
import Registration from './pages/Register';
import HomePage from './pages/Homepage';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Notfound from './pages/Notfound';
import AdminDashboard from './components/AdminDashboard';
import UserDashboard from './components/UserDashboard';
import Leaderboard from './components/Leaderboard';
import Timetable from './components/Timetable';
import ResourcesPage from './components/ResourcePage';
import ResourceUpload from './components/ResourceUpload';
import CreateQuizForm from './components/Quizcreation';
import Store from './components/Store';
import ChatUI from './components/Chat';
import Doubt from './components/Doubt';
import ProtectedRoute from './components/ProtectedRoute';

const App = () => {
  return (
    <Router>
      <ToastContainer position="top-right" autoClose={3000} />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<Registration />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        <Route
          path="/adminDashboard"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/create-quiz"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <CreateQuizForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/upload"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <ResourceUpload />
            </ProtectedRoute>
          }
        />

        <Route
          path="/userDashboard"
          element={
            <ProtectedRoute allowedRoles={['user']}>
              <UserDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/leaderboard"
          element={
            <ProtectedRoute>
              <Leaderboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/timetable"
          element={
            <ProtectedRoute>
              <Timetable standalone />
            </ProtectedRoute>
          }
        />
        <Route
          path="/resources"
          element={
            <ProtectedRoute>
              <ResourcesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/store"
          element={
            <ProtectedRoute>
              <Store />
            </ProtectedRoute>
          }
        />
        <Route
          path="/chat"
          element={
            <ProtectedRoute>
              <ChatUI />
            </ProtectedRoute>
          }
        />
        <Route
          path="/doubt"
          element={
            <ProtectedRoute>
              <div className="min-h-screen bg-gray-50 p-6 md:p-10">
                <div className="max-w-6xl mx-auto">
                  <Doubt standalone />
                </div>
              </div>
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Notfound />} />
      </Routes>
    </Router>
  );
};

export default App;
