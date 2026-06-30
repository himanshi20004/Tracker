import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import RedirectButton from './Redirectbuttton';
import Timetable from './Timetable';
import ResourcesList from './ResourceList';
import { toast } from 'react-toastify';
import QuizList from './QuizList';
import TakeQuiz from './Takequiz';
import Doubt from './Doubt';
import coin from '../assets/coin.png';
import Leaderboard from './Leaderboard'
const NAV_ITEMS = [
  { id: 'tasks',     label: 'My Tasks',   icon: '✅' },
  { id: 'quizzes',   label: 'Quizzes',    icon: '🧠' },
  { id: 'resources', label: 'Resources',  icon: '📚' },
  { id: 'leaderboard', label: 'Leaderboard', icon: '🏆' }, // New Item
  { id: 'timetable', label: 'Timetable',  icon: '📅' },
  { id: 'chat',      label: 'Chat',       icon: '💬' },
  { id: 'doubt',     label: 'Doubt',      icon: '🙋' },
];

const UserDashboard = () => {
  const [user, setUser] = useState({ id: '', name: '', points: 0, completedTasks: [] });
  const [tasks, setTasks] = useState([]);
  const [completedTaskDetails, setCompletedTaskDetails] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('tasks');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const res = await axios.get('${import.meta.env.VITE_API_URL}/api/v1/me', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        const userData = res.data.user;
        setUser({ 
          id: userData?._id, 
          name: userData?.username || 'No Name', 
          points: userData?.points || 0, 
          completedTasks: userData?.completedTasks || [] 
        });

        if (userData.completedTasks.length > 0) {
          const ctRes = await axios.post(
            '${import.meta.env.VITE_API_URL}/api/v1/details',
            { taskIds: userData.completedTasks },
            { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
          );
          setCompletedTaskDetails(ctRes.data.tasks);
        }

        const taskRes = await axios.get('${import.meta.env.VITE_API_URL}/api/v1/task', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setTasks(taskRes.data.tasks.filter(t => !userData.completedTasks.includes(t._id)));
      } catch (err) {
        console.error('Error fetching data:', err);
      }
    };
    fetchUserData();
  }, []);

  const fetchQuizzes = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) { toast.error('You must be logged in to view quizzes.'); return; }
      const res = await axios.get('${import.meta.env.VITE_API_URL}/api/v1/getquizzes', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data?.quizzes) setQuizzes(res.data.quizzes);
      else toast.error('No quizzes available.');
    } catch (err) {
      toast.error('Failed to fetch quizzes.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const completeTask = async (taskId) => {
    const task = tasks.find(t => t._id === taskId);
    if (!task) return;
    try {
      const updatedPoints         = user.points + task.points;
      const updatedCompletedTasks = [...user.completedTasks, taskId];
      await axios.patch(
        '${import.meta.env.VITE_API_URL}/api/v1/user/update',
        { completedTasks: updatedCompletedTasks, points: updatedPoints },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      setUser(prev => ({ ...prev, points: updatedPoints, completedTasks: updatedCompletedTasks }));
      setTasks(prev => prev.filter(t => t._id !== taskId));
      setCompletedTaskDetails(prev => [...prev, task]);
    } catch (err) {
      console.error('Error completing task:', err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const getDeadlineStatus = (deadline) => {
    const diff = new Date(deadline) - new Date();
    if (diff <= 0) return { label: 'Deadline passed', expired: true };
    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff / 3600000) % 24);
    const m = Math.floor((diff / 60000) % 60);
    return { label: `${d > 0 ? `${d}d ` : ''}${h}h ${m}m left`, expired: false };
  };

  const initials = user.name ? user.name.slice(0, 2).toUpperCase() : 'US';

  return (
    <div className="min-h-screen flex bg-gray-50 font-sans">

      {/* ═══ SIDEBAR ═══ */}
      <aside className="w-64 shrink-0 flex flex-col bg-white border-r border-gray-100 shadow-sm min-h-screen">

        {/* Logo */}
        <div className="flex items-center gap-2.5 px-6 py-5 border-b border-gray-100">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-blue-500 flex items-center justify-center shadow">
            <div className="w-2 h-2 bg-white rounded-full" />
          </div>
          <span className="text-lg font-bold text-gray-900">StudyWave</span>
        </div>

        {/* User card */}
        <div className="mx-4 mt-5 mb-4 p-4 rounded-2xl bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-blue-500 flex items-center justify-center text-white text-sm font-bold shrink-0">
              {initials}
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900 leading-tight">{user.name}</p>
              <p className="text-xs text-gray-400">Student</p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-white rounded-xl px-3 py-2 border border-purple-100">
            <img src={coin} alt="coins" className="w-5 h-5 rounded-full" />
            <span className="text-sm font-bold text-purple-700">{user.points}</span>
            <span className="text-xs text-gray-400">points</span>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 space-y-0.5">
          {NAV_ITEMS.map(item => (
            <button
              key={item.id}
              onClick={() => item.id === 'chat' ? navigate('/chat') : setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-[14px] font-medium transition-all ${
                activeTab === item.id
                  ? 'bg-gradient-to-r from-purple-600 to-blue-500 text-white shadow-md shadow-purple-100'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        {/* Bottom actions */}
        <div className="px-4 pb-6 pt-4 border-t border-gray-100 space-y-2 mt-2">
          <button
            onClick={handleLogout}
            className="w-full px-4 py-2.5 text-[13px] font-medium text-red-600 bg-red-50 border border-red-100 rounded-xl hover:bg-red-100 transition"
          >
            🚪 Logout
          </button>
        </div>
      </aside>

      {/* ═══ MAIN CONTENT ═══ */}
      <main className="flex-1 overflow-y-auto">

        {/* Top bar */}
        <header className="sticky top-0 z-10 flex items-center justify-between px-8 py-4 bg-white border-b border-gray-100 shadow-sm">
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              {NAV_ITEMS.find(n => n.id === activeTab)?.icon}{' '}
              {NAV_ITEMS.find(n => n.id === activeTab)?.label}
            </h1>
            <p className="text-xs text-gray-400 mt-0.5">Welcome back, {user.name} 👋</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 rounded-xl border border-purple-100">
              <img src={coin} alt="coins" className="w-4 h-4 rounded-full" />
              <span className="text-sm font-bold text-purple-700">{user.points} pts</span>
            </div>
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-600 to-blue-500 flex items-center justify-center text-white text-xs font-bold">
              {initials}
            </div>
          </div>
        </header>

        <div className="px-8 py-7">

          {/* ── TASKS TAB ── */}
          {activeTab === 'tasks' && (
            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: 'Pending Tasks',    val: tasks.length,                  color: 'purple' },
                  { label: 'Completed Tasks',  val: completedTaskDetails.length,   color: 'blue'   },
                  { label: 'Total Points',     val: user.points,                   color: 'green'  },
                ].map(c => (
                  <div key={c.label} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                    <p className="text-xs text-gray-400 mb-1">{c.label}</p>
                    <p className={`text-3xl font-extrabold text-${c.color}-600`}>{c.val}</p>
                  </div>
                ))}
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-50">
                  <h2 className="text-base font-semibold text-gray-900">Pending Tasks</h2>
                </div>
                {tasks.length > 0 ? (
                  <ul className="divide-y divide-gray-50">
                    {tasks.map(task => {
                      const { label, expired } = getDeadlineStatus(task.deadline);
                      return (
                        <li key={task._id} className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900 truncate">{task.title}</p>
                            <p className="text-xs text-gray-400 mt-0.5">
                              Due: {new Date(task.deadline).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true })}
                            </p>
                          </div>
                          <div className="flex items-center gap-3 shrink-0 ml-4">
                            <span className="flex items-center gap-1 text-xs font-medium text-amber-600 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-100">
                              <img src={coin} alt="" className="w-3.5 h-3.5 rounded-full" /> {task.points} pts
                            </span>
                            <span className={`text-xs font-medium px-2.5 py-1 rounded-lg border ${expired ? 'text-red-600 bg-red-50 border-red-100' : 'text-green-600 bg-green-50 border-green-100'}`}>
                              {label}
                            </span>
                            <button
                              onClick={() => completeTask(task._id)}
                              disabled={expired}
                              className="px-3 py-1.5 text-xs font-semibold text-white bg-gradient-to-r from-purple-600 to-blue-500 rounded-lg hover:opacity-90 transition disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                              Complete
                            </button>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <div className="px-6 py-10 text-center">
                    <p className="text-4xl mb-3">🎉</p>
                    <p className="text-sm font-medium text-gray-500">All tasks done! Great work.</p>
                  </div>
                )}
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-50">
                  <h2 className="text-base font-semibold text-gray-900">Completed Tasks</h2>
                </div>
                {completedTaskDetails.length > 0 ? (
                  <ul className="divide-y divide-gray-50">
                    {completedTaskDetails.map(task => (
                      <li key={task._id} className="flex items-center gap-3 px-6 py-3.5">
                        <span className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center text-green-600 text-xs shrink-0">✓</span>
                        <span className="text-sm text-gray-700">{task.title}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="px-6 py-6 text-sm text-gray-400">No completed tasks yet.</p>
                )}
              </div>
            </div>
          )}

          {/* ── QUIZZES TAB ── */}
          {activeTab === 'quizzes' && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              {isLoading ? (
                <p className="text-sm text-gray-400">Loading quizzes...</p>
              ) : selectedQuiz ? (
                <TakeQuiz 
                  quiz={selectedQuiz} 
                  onQuizSubmit={() => {
                    setSelectedQuiz(null);
                    fetchQuizzes(); 
                  }} 
                />
              ) : (
                <QuizList 
                  quizzes={quizzes} 
                  onTakeQuiz={setSelectedQuiz} 
                  currentUserId={user.id} 
                />
              )}
            </div>
          )}

          {/* ── RESOURCES TAB ── */}
          {activeTab === 'resources' && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <ResourcesList />
            </div>
          )}
          
          {/* ── LEADERBOARD TAB ── */}
{activeTab === 'leaderboard' && (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
    <Leaderboard />
  </div>
)}
          {/* ── TIMETABLE TAB ── */}
          {activeTab === 'timetable' && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <Timetable />
            </div>
          )}
           
          
          {/* ── DOUBT TAB ── */}
          {activeTab === 'doubt' && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <Doubt />
            </div>
          )}

        </div>
      </main>
    </div>
  );
};

export default UserDashboard;