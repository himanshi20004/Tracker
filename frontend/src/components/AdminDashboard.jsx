import { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api, { clearAuthStorage } from '../utils/api';
import { disconnectSocket } from '../utils/socket';
import ProfileSettings from './ProfileSettings';

const formatDatetimeLocal = (isoDate) => {
    if (!isoDate) return '';
    const d = new Date(isoDate);
    if (Number.isNaN(d.getTime())) return '';
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const AdminDashboard = () => {
    const [taskData, setTaskData] = useState({
        title: '',
        description: '',
        points: '',
        deadline: '',
    });
    const [tasks, setTasks] = useState([]);
    const [users, setUsers] = useState([]);
    const [editingTaskId, setEditingTaskId] = useState(null);
    const [loadingTasks, setLoadingTasks] = useState(true);
    const [savingTask, setSavingTask] = useState(false);
    const [activeSection, setActiveSection] = useState('tasks');
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const navigate = useNavigate();

    const fetchTasks = useCallback(async () => {
        setLoadingTasks(true);
        try {
            const response = await api.get('/task');
            setTasks(response.data.tasks || []);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to load tasks.');
        } finally {
            setLoadingTasks(false);
        }
    }, []);

    const fetchUsers = useCallback(async () => {
        try {
            const response = await api.get('/admin/users');
            setUsers(response.data.users || []);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to load users.');
        }
    }, []);

    useEffect(() => {
        fetchTasks();
    }, [fetchTasks]);

    useEffect(() => {
        if (activeSection === 'users') {
            fetchUsers();
        }
    }, [activeSection, fetchUsers]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setTaskData((prev) => ({ ...prev, [name]: value }));
    };

    const startEditTask = (task) => {
        setEditingTaskId(task._id);
        setTaskData({
            title: task.title || '',
            description: task.description || '',
            points: String(task.points ?? ''),
            deadline: formatDatetimeLocal(task.deadline),
        });
    };

    const cancelEdit = () => {
        setEditingTaskId(null);
        setTaskData({ title: '', description: '', points: '', deadline: '' });
    };

    const saveTask = async (e) => {
        e.preventDefault();
        const pointsNum = Number(taskData.points);
        if (!Number.isFinite(pointsNum) || pointsNum < 0) {
            toast.error('Points must be a non-negative number.');
            return;
        }

        setSavingTask(true);
        try {
            const payload = {
                title: taskData.title.trim(),
                description: taskData.description.trim(),
                points: pointsNum,
                deadline: taskData.deadline,
            };

            if (editingTaskId) {
                const res = await api.put(`/task/${editingTaskId}`, payload);
                const updated = res.data.task;
                setTasks((prev) => prev.map((t) => (t._id === editingTaskId ? updated : t)));
                toast.success('Task updated successfully!');
            } else {
                const res = await api.post('/task', payload);
                setTasks((prev) => [res.data.task, ...prev]);
                toast.success('Task created successfully!');
            }
            cancelEdit();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error saving task.');
        } finally {
            setSavingTask(false);
        }
    };

    const deleteTask = async (taskId) => {
        try {
            await api.delete(`/task/${taskId}`);
            setTasks((prev) => prev.filter((task) => task._id !== taskId));
            if (editingTaskId === taskId) cancelEdit();
            toast.success('Task deleted.');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error deleting task.');
        }
    };

    const toggleUserRole = async (user) => {
        const nextRole = user.role === 'admin' ? 'user' : 'admin';
        try {
            const res = await api.put(`/admin/user/${user._id}`, { role: nextRole });
            setUsers((prev) => prev.map((u) => (u._id === user._id ? res.data.user : u)));
            toast.success(`${user.username} is now ${nextRole}.`);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update role.');
        }
    };

    const handleLogout = async () => {
        try {
            await api.get('/logout');
        } catch {
            // Proceed cleanly
        }
        disconnectSocket();
        clearAuthStorage();
        navigate('/login');
    };

    const SidebarContent = () => (
        <>
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
                <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-blue-500 flex items-center justify-center shadow">
                        <div className="w-2 h-2 bg-white rounded-full" />
                    </div>
                    <span className="text-lg font-bold text-gray-900">StudyWave Admin</span>
                </div>
                <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="md:hidden text-gray-500 hover:text-gray-800 text-lg"
                    aria-label="Close menu"
                >
                    ✕
                </button>
            </div>

            <nav className="flex-1 px-3 space-y-1 mt-4 overflow-y-auto">
                <button
                    onClick={() => { setActiveSection('tasks'); setMobileMenuOpen(false); }}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-[14px] font-medium transition ${
                        activeSection === 'tasks'
                            ? 'bg-gradient-to-r from-purple-600 to-blue-500 text-white shadow-md'
                            : 'text-gray-600 hover:bg-gray-50'
                    }`}
                >
                    🛠 Tasks & Overview
                </button>
                <button
                    onClick={() => { setActiveSection('users'); setMobileMenuOpen(false); }}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-[14px] font-medium transition ${
                        activeSection === 'users'
                            ? 'bg-gradient-to-r from-purple-600 to-blue-500 text-white shadow-md'
                            : 'text-gray-600 hover:bg-gray-50'
                    }`}
                >
                    👥 Manage Users
                </button>
                <Link to="/admin/create-quiz" className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-[14px] font-medium text-gray-600 hover:bg-gray-50 transition">
                    🧠 Create Quiz
                </Link>
                <Link to="/upload" className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-[14px] font-medium text-gray-600 hover:bg-gray-50 transition">
                    📚 Manage Resources
                </Link>
                <Link to="/leaderboard" className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-[14px] font-medium text-gray-600 hover:bg-gray-50 transition">
                    🏆 Leaderboard
                </Link>
                <Link to="/timetable" className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-[14px] font-medium text-gray-600 hover:bg-gray-50 transition">
                    📅 Timetable
                </Link>
                <Link to="/chat" className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-[14px] font-medium text-gray-600 hover:bg-gray-50 transition">
                    💬 Chat
                </Link>
                <Link to="/doubt" className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-[14px] font-medium text-gray-600 hover:bg-gray-50 transition">
                    ❓ AI Doubts
                </Link>
                <button
                    onClick={() => { setActiveSection('profile'); setMobileMenuOpen(false); }}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-[14px] font-medium transition ${
                        activeSection === 'profile'
                            ? 'bg-gradient-to-r from-purple-600 to-blue-500 text-white shadow-md'
                            : 'text-gray-600 hover:bg-gray-50'
                    }`}
                >
                    ⚙️ Profile & Security
                </button>
            </nav>

            <div className="px-4 pb-6 mt-auto pt-4 border-t border-gray-100">
                <button
                    onClick={handleLogout}
                    className="w-full px-4 py-2.5 text-[13px] font-medium text-red-600 bg-red-50 border border-red-100 rounded-xl hover:bg-red-100 transition"
                >
                    🚪 Logout
                </button>
            </div>
        </>
    );

    return (
        <div className="min-h-screen flex bg-gray-50 font-sans">
            <aside className="hidden md:flex w-64 shrink-0 flex-col bg-white border-r border-gray-100 shadow-sm min-h-screen">
                <SidebarContent />
            </aside>

            {mobileMenuOpen && (
                <div className="fixed inset-0 z-40 flex md:hidden">
                    <div className="fixed inset-0 bg-black/40" onClick={() => setMobileMenuOpen(false)} />
                    <aside className="relative z-50 w-64 flex flex-col bg-white min-h-screen shadow-xl">
                        <SidebarContent />
                    </aside>
                </div>
            )}

            <main className="flex-1 min-w-0 overflow-y-auto">
                <header className="sticky top-0 z-10 flex items-center justify-between px-4 sm:px-8 py-4 bg-white border-b border-gray-100 shadow-sm">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setMobileMenuOpen(true)}
                            className="md:hidden p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50"
                            aria-label="Open menu"
                        >
                            ☰
                        </button>
                        <div>
                            <h1 className="text-lg sm:text-xl font-bold text-gray-900">Admin Dashboard</h1>
                            <p className="text-xs text-gray-400 mt-0.5">Manage classroom tasks, quizzes, resources, and users</p>
                        </div>
                    </div>
                </header>

                <div className="px-4 sm:px-8 py-7">
                    {activeSection === 'tasks' && (
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                            <div className="lg:col-span-4">
                                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <h2 className="text-base font-bold text-gray-900">
                                            {editingTaskId ? 'Edit Task' : 'Add New Task'}
                                        </h2>
                                        {editingTaskId && (
                                            <button
                                                type="button"
                                                onClick={cancelEdit}
                                                className="text-xs text-gray-500 hover:text-gray-800 underline"
                                            >
                                                Cancel
                                            </button>
                                        )}
                                    </div>
                                    <form onSubmit={saveTask} className="space-y-4">
                                        <div>
                                            <label className="text-xs font-semibold text-gray-500 uppercase">Title</label>
                                            <input
                                                type="text"
                                                name="title"
                                                value={taskData.title}
                                                onChange={handleChange}
                                                placeholder="e.g. Bio Assignment 1"
                                                required
                                                className="w-full mt-1 px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs font-semibold text-gray-500 uppercase">Description</label>
                                            <textarea
                                                name="description"
                                                value={taskData.description}
                                                onChange={handleChange}
                                                placeholder="Task details..."
                                                required
                                                className="w-full mt-1 px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none h-24"
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-xs font-semibold text-gray-500 uppercase">Points</label>
                                                <input
                                                    type="number"
                                                    name="points"
                                                    min="0"
                                                    value={taskData.points}
                                                    onChange={handleChange}
                                                    required
                                                    className="w-full mt-1 px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-xs font-semibold text-gray-500 uppercase">Deadline</label>
                                                <input
                                                    type="datetime-local"
                                                    name="deadline"
                                                    value={taskData.deadline}
                                                    onChange={handleChange}
                                                    required
                                                    className="w-full mt-1 px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none text-xs"
                                                />
                                            </div>
                                        </div>
                                        <button
                                            type="submit"
                                            disabled={savingTask}
                                            className="w-full bg-gradient-to-r from-purple-600 to-blue-500 text-white font-bold py-3 rounded-xl shadow-md hover:opacity-90 transition disabled:opacity-60"
                                        >
                                            {savingTask ? 'Saving...' : editingTaskId ? 'Update Task' : 'Add Task'}
                                        </button>
                                    </form>
                                </div>
                            </div>

                            <div className="lg:col-span-8">
                                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                                    <div className="px-6 py-4 border-b border-gray-50 flex justify-between items-center">
                                        <h2 className="text-base font-semibold text-gray-900">Current Tasks ({tasks.length})</h2>
                                    </div>
                                    {loadingTasks ? (
                                        <div className="px-6 py-10 text-center text-sm text-gray-400">Loading tasks...</div>
                                    ) : tasks.length === 0 ? (
                                        <div className="px-6 py-10 text-center text-sm text-gray-400">No tasks created yet.</div>
                                    ) : (
                                        <div className="divide-y divide-gray-50">
                                            {tasks.map((task) => (
                                                <div key={task._id} className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition gap-4">
                                                    <div className="min-w-0">
                                                        <p className="text-sm font-bold text-gray-900 truncate">{task.title}</p>
                                                        {task.description && (
                                                            <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{task.description}</p>
                                                        )}
                                                        <div className="flex gap-3 mt-1.5">
                                                            <span className="text-xs text-purple-600 bg-purple-50 px-2 py-0.5 rounded-md font-medium">{task.points} pts</span>
                                                            <span className="text-[11px] text-gray-400">📅 {new Date(task.deadline).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</span>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-3 shrink-0">
                                                        <button
                                                            onClick={() => startEditTask(task)}
                                                            className="text-blue-600 text-xs font-bold hover:underline"
                                                        >
                                                            Edit
                                                        </button>
                                                        <button
                                                            onClick={() => deleteTask(task._id)}
                                                            className="text-red-500 text-xs font-bold hover:underline"
                                                        >
                                                            Delete
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeSection === 'users' && (
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-50 flex justify-between items-center">
                                <div>
                                    <h2 className="text-base font-bold text-gray-900">Registered Users ({users.length})</h2>
                                    <p className="text-xs text-gray-400">Manage student and administrator roles</p>
                                </div>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                                        <tr>
                                            <th className="px-6 py-3">Username</th>
                                            <th className="px-6 py-3">Email</th>
                                            <th className="px-6 py-3">Role</th>
                                            <th className="px-6 py-3">Points</th>
                                            <th className="px-6 py-3 text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {users.map((u) => (
                                            <tr key={u._id} className="hover:bg-gray-50">
                                                <td className="px-6 py-3.5 font-medium text-gray-900">{u.username}</td>
                                                <td className="px-6 py-3.5 text-gray-500">{u.email}</td>
                                                <td className="px-6 py-3.5">
                                                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-50 text-blue-700'}`}>
                                                        {u.role}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-3.5 text-gray-700 font-semibold">{u.points ?? 0}</td>
                                                <td className="px-6 py-3.5 text-right">
                                                    <button
                                                        onClick={() => toggleUserRole(u)}
                                                        className="text-xs font-semibold text-purple-600 hover:underline"
                                                    >
                                                        {u.role === 'admin' ? 'Demote to Student' : 'Promote to Admin'}
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {activeSection === 'profile' && <ProfileSettings />}
                </div>
            </main>
        </div>
    );
};

export default AdminDashboard;
