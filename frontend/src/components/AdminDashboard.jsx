import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom'; // Added Link
import RedirectButton from './Redirectbuttton';

const AdminDashboard = () => {
    const [taskData, setTaskData] = useState({
        title: '',
        description: '',
        points: '',
        deadline: '',
    });
    const navigate = useNavigate();
    const [tasks, setTasks] = useState([]);
    const [editingTaskId, setEditingTaskId] = useState(null);

    useEffect(() => {
        const fetchTasks = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/v1/task`, {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                });
                setTasks(response.data.tasks);
            } catch (error) {
                console.error('Error fetching tasks:', error);
            }
        };
        fetchTasks();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setTaskData({ ...taskData, [name]: value });
    };

    const saveTask = async (e) => {
        e.preventDefault();
        try {
            if (editingTaskId) {
                await axios.put(`${import.meta.env.VITE_API_URL}/api/v1/task/${editingTaskId}`, taskData, {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                });
                setTasks(tasks.map(task => (task._id === editingTaskId ? { ...task, ...taskData } : task)));
            } else {
                const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/v1/task`, taskData, {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                });
                setTasks([...tasks, response.data.task]);
            }
            setTaskData({ title: '', description: '', points: '', deadline: '' });
            setEditingTaskId(null);
        } catch (error) {
            console.error('Error saving task:', error);
        }
    };

    const deleteTask = async (taskId) => {
        try {
            await axios.delete(`${import.meta.env.VITE_API_URL}/api/v1/task/${taskId}`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            setTasks(tasks.filter(task => task._id !== taskId));
        } catch (error) {
            console.error('Error deleting task:', error);
        }
    };

    return (
        <div className="min-h-screen flex bg-gray-50 font-sans">
            {/* ═══ SIDEBAR ═══ */}
            <aside className="w-64 shrink-0 flex flex-col bg-white border-r border-gray-100 shadow-sm min-h-screen">
                <div className="flex items-center gap-2.5 px-6 py-5 border-b border-gray-100">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-blue-500 flex items-center justify-center shadow">
                        <div className="w-2 h-2 bg-white rounded-full" />
                    </div>
                    <span className="text-lg font-bold text-gray-900">StudyWave Admin</span>
                </div>

                <nav className="flex-1 px-3 space-y-1 mt-4">
                    <Link to="/adminDashboard" className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-[14px] font-medium bg-gradient-to-r from-purple-600 to-blue-500 text-white shadow-md">
                        🛠 Dashboard
                    </Link>
                    <Link to="/admin/create-quiz" className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-[14px] font-medium text-gray-600 hover:bg-gray-50 transition">
                        🧠 Create Quiz
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
                    <Link to="/Doubt" className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-[14px] font-medium text-gray-600 hover:bg-gray-50 transition">
                        ❓ Doubts
                    </Link>
                    <Link to="/upload" className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-[14px] font-medium text-gray-600 hover:bg-gray-50 transition">
                        📚 Manage Resources
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
                        <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
                        <p className="text-xs text-gray-400 mt-0.5">Manage your classroom tasks and content 👋</p>
                    </div>
                </header>

                <div className="px-8 py-7">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        {/* Task Form */}
                        <div className="lg:col-span-4">
                            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                                <h2 className="text-base font-bold text-gray-900 mb-4">Add New Task</h2>
                                <form onSubmit={saveTask} className="space-y-4">
                                    <div>
                                        <label className="text-xs font-semibold text-gray-500 uppercase">Title</label>
                                        <input type="text" name="title" value={taskData.title} onChange={handleChange} placeholder="e.g. Bio Quiz 1" required 
                                            className="w-full mt-1 px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none" />
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-gray-500 uppercase">Description</label>
                                        <textarea name="description" value={taskData.description} onChange={handleChange} placeholder="Task details..." required 
                                            className="w-full mt-1 px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none h-24" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-xs font-semibold text-gray-500 uppercase">Points</label>
                                            <input type="number" name="points" value={taskData.points} onChange={handleChange} required 
                                                className="w-full mt-1 px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none" />
                                        </div>
                                        <div>
                                            <label className="text-xs font-semibold text-gray-500 uppercase">Deadline</label>
                                            <input type="datetime-local" name="deadline" value={taskData.deadline} onChange={handleChange} required 
                                                className="w-full mt-1 px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none" />
                                        </div>
                                    </div>
                                    <button type="submit" className="w-full bg-gradient-to-r from-purple-600 to-blue-500 text-white font-bold py-3 rounded-xl shadow-md hover:opacity-90 transition transform active:scale-95">
                                        {editingTaskId ? 'Update Task' : 'Add Task'}
                                    </button>
                                </form>
                            </div>
                        </div>

                        {/* Task List */}
                        <div className="lg:col-span-8">
                            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                                <div className="px-6 py-4 border-b border-gray-50 flex justify-between items-center">
                                    <h2 className="text-base font-semibold text-gray-900">Current Tasks</h2>
                                </div>
                                <div className="divide-y divide-gray-50">
                                    {tasks.map(task => (
                                        <div key={task._id} className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition">
                                            <div>
                                                <p className="text-sm font-bold text-gray-900">{task.title}</p>
                                                <div className="flex gap-3 mt-1">
                                                    <span className="text-xs text-purple-600 bg-purple-50 px-2 py-0.5 rounded-md">{task.points} pts</span>
                                                    <span className="text-[11px] text-gray-400">📅 {new Date(task.deadline).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <button onClick={() => setEditingTaskId(task._id)} className="text-blue-500 text-xs font-bold hover:underline">Edit</button>
                                                <button onClick={() => deleteTask(task._id)} className="text-red-500 text-xs font-bold hover:underline">Delete</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AdminDashboard;