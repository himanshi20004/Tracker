import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api, { clearAuthStorage } from '../utils/api';
import { disconnectSocket } from '../utils/socket';
import Timetable from './Timetable';
import ResourcesList from './ResourceList';
import QuizList from './QuizList';
import TakeQuiz from './Takequiz';
import Doubt from './Doubt';
import Leaderboard from './Leaderboard';
import ProfileSettings from './ProfileSettings';
import coin from '../assets/coin.png';

const NAV_ITEMS = [
  { id: 'tasks',       label: 'My Tasks',    icon: '✅' },
  { id: 'quizzes',     label: 'Quizzes',     icon: '🧠' },
  { id: 'resources',   label: 'Resources',   icon: '📚' },
  { id: 'leaderboard', label: 'Leaderboard', icon: '🏆' },
  { id: 'timetable',   label: 'Timetable',   icon: '📅' },
  { id: 'chat',        label: 'Chat',        icon: '💬' },
  { id: 'doubt',       label: 'AI Doubt',    icon: '🙋' },
  { id: 'profile',     label: 'Profile',     icon: '⚙️' },
];

const STAT_STYLES = {
  purple: 'text-purple-600',
  blue: 'text-blue-600',
  green: 'text-green-600',
};

const UserDashboard = () => {
  const [user, setUser] = useState({ id: '', name: '', points: 0, completedTasks: [] });
  const [tasks, setTasks] = useState([]);
  const [completedTaskDetails, setCompletedTaskDetails] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [completingId, setCompletingId] = useState(null);
  const [activeTab, setActiveTab] = useState('tasks');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const fetchDashboardData = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const [meRes, taskRes, quizRes] = await Promise.all([
        api.get('/me'),
        api.get('/task'),
        api.get('/getquizzes'),
      ]);

      const userData = meRes.data.user;
      const completedIds = (userData?.completedTasks || []).map((id) => id.toString());

      setUser({
        id: userData?._id,
        name: userData?.username || 'Student',
        points: userData?.points || 0,
        completedTasks: completedIds,
      });

      const allTasks = taskRes.data.tasks || [];
      setTasks(allTasks.filter((t) => !completedIds.includes(t._id.toString())));
      setCompletedTaskDetails(allTasks.filter((t) => completedIds.includes(t._id.toString())));
      setQuizzes(quizRes.data?.quizzes || []);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to load dashboard data.';
      setError(msg);
      if (err.response?.status === 401) {
        clearAuthStorage();
        navigate('/login');
      }
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const completeTask = async (taskId) => {
    if (completingId) return;
    setCompletingId(taskId);

    try {
      const res = await api.post('/complete-task', { taskId });
      const updatedUser = res.data?.user;
      const completedTask = tasks.find((t) => t._id === taskId);

      if (updatedUser) {
        setUser((prev) => ({
          ...prev,
          points: updatedUser.points,
          completedTasks: (updatedUser.completedTasks || []).map((t) =>
            typeof t === 'string' ? t : t._id
          ),
        }));
      }

      setTasks((prev) => prev.filter((t) => t._id !== taskId));
      if (completedTask) {
        setCompletedTaskDetails((prev) => [completedTask, ...prev]);
      }
      toast.success(`Task completed! +${res.data?.pointsEarned ?? completedTask?.points ?? 0} points`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to complete task.');
    } finally {
      setCompletingId(null);
    }
  };

  const handleLogout = async () => {
    try {
      await api.get('/logout');
    } catch {
      // Proceed with local logout even if network fails
    }
    disconnectSocket();
    clearAuthStorage();
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

  const initials = user.name ? user.name.slice(0, 2).toUpperCase() : 'ST';

  const SidebarContent = () => (
    <>
      <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-blue-500 flex items-center justify-center shadow">
            <div className="w-2 h-2 bg-white rounded-full" />
          </div>
          <span className="text-lg font-bold text-gray-900">StudyWave</span>
        </div>
        <button
          onClick={() => setMobileMenuOpen(false)}
          className="md:hidden text-gray-500 hover:text-gray-800 text-lg"
          aria-label="Close menu"
        >
          ✕
        </button>
      </div>

      <div className="mx-4 mt-5 mb-4 p-4 rounded-2xl bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-100">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-blue-500 flex items-center justify-center text-white text-sm font-bold shrink-0">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900 leading-tight truncate">{user.name}</p>
            <p className="text-xs text-gray-400">Student</p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-white rounded-xl px-3 py-2 border border-purple-100">
          <img src={coin} alt="coins" className="w-5 h-5 rounded-full" />
          <span className="text-sm font-bold text-purple-700">{user.points}</span>
          <span className="text-xs text-gray-400">points</span>
        </div>
      </div>

      <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            onClick={() => {
              setMobileMenuOpen(false);
              if (item.id === 'chat') navigate('/chat');
              else setActiveTab(item.id);
            }}
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

      <div className="px-4 pb-6 pt-4 border-t border-gray-100 space-y-2 mt-2">
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
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 shrink-0 flex-col bg-white border-r border-gray-100 shadow-sm min-h-screen">
        <SidebarContent />
      </aside>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 flex md:hidden">
          <div
            className="fixed inset-0 bg-black/40"
            onClick={() => setMobileMenuOpen(false)}
          />
          <aside className="relative z-50 w-64 flex flex-col bg-white min-h-screen shadow-xl">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main Content */}
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
              <h1 className="text-lg sm:text-xl font-bold text-gray-900">
                {NAV_ITEMS.find((n) => n.id === activeTab)?.icon}{' '}
                {NAV_ITEMS.find((n) => n.id === activeTab)?.label}
              </h1>
              <p className="text-xs text-gray-400 mt-0.5">Welcome back, {user.name}</p>
            </div>
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

        <div className="px-4 sm:px-8 py-7">
          {error && (
            <div className="mb-6 flex items-center justify-between gap-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
              <span>{error}</span>
              <button
                onClick={fetchDashboardData}
                className="px-3 py-1 bg-white border border-red-200 rounded-lg text-xs font-semibold hover:bg-red-100"
              >
                Retry
              </button>
            </div>
          )}

          {activeTab === 'tasks' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { label: 'Pending Tasks',   val: tasks.length,                color: 'purple' },
                  { label: 'Completed Tasks', val: completedTaskDetails.length, color: 'blue'   },
                  { label: 'Total Points',    val: user.points,                 color: 'green'  },
                ].map((c) => (
                  <div key={c.label} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                    <p className="text-xs text-gray-400 mb-1">{c.label}</p>
                    <p className={`text-3xl font-extrabold ${STAT_STYLES[c.color]}`}>{c.val}</p>
                  </div>
                ))}
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-50">
                  <h2 className="text-base font-semibold text-gray-900">Pending Tasks</h2>
                </div>
                {isLoading ? (
                  <div className="px-6 py-10 text-center text-sm text-gray-400">Loading tasks...</div>
                ) : tasks.length > 0 ? (
                  <ul className="divide-y divide-gray-50">
                    {tasks.map((task) => {
                      const { label, expired } = getDeadlineStatus(task.deadline);
                      const isCompleting = completingId === task._id;
                      return (
                        <li
                          key={task._id}
                          className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-6 py-4 hover:bg-gray-50 transition"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900 truncate">{task.title}</p>
                            {task.description && (
                              <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{task.description}</p>
                            )}
                            <p className="text-xs text-gray-400 mt-1">
                              Due: {new Date(task.deadline).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true })}
                            </p>
                          </div>
                          <div className="flex items-center gap-2.5 shrink-0">
                            <span className="flex items-center gap-1 text-xs font-medium text-amber-600 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-100">
                              <img src={coin} alt="" className="w-3.5 h-3.5 rounded-full" /> {task.points} pts
                            </span>
                            <span className={`text-xs font-medium px-2.5 py-1 rounded-lg border ${expired ? 'text-red-600 bg-red-50 border-red-100' : 'text-green-600 bg-green-50 border-green-100'}`}>
                              {label}
                            </span>
                            <button
                              onClick={() => completeTask(task._id)}
                              disabled={expired || isCompleting}
                              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-gradient-to-r from-purple-600 to-blue-500 rounded-lg hover:opacity-90 transition disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                              {isCompleting ? 'Saving...' : 'Complete'}
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
                    {completedTaskDetails.map((task) => (
                      <li key={task._id} className="flex items-center justify-between gap-3 px-6 py-3.5">
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center text-green-600 text-xs shrink-0">✓</span>
                          <span className="text-sm text-gray-700 truncate">{task.title}</span>
                        </div>
                        <span className="text-xs font-semibold text-purple-600 shrink-0">+{task.points} pts</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="px-6 py-6 text-sm text-gray-400">No completed tasks yet.</p>
                )}
              </div>
            </div>
          )}

          {activeTab === 'quizzes' && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              {isLoading ? (
                <p className="text-sm text-gray-400">Loading quizzes...</p>
              ) : selectedQuiz ? (
                <TakeQuiz
                  quiz={selectedQuiz}
                  onQuizSubmit={(newTotalPoints) => {
                    if (typeof newTotalPoints === 'number') {
                      setUser((prev) => ({ ...prev, points: newTotalPoints }));
                    }
                    setSelectedQuiz(null);
                    fetchDashboardData();
                  }}
                  onCancel={() => setSelectedQuiz(null)}
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

          {activeTab === 'resources' && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <ResourcesList />
            </div>
          )}

          {activeTab === 'leaderboard' && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <Leaderboard />
            </div>
          )}

          {activeTab === 'timetable' && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6">
              <Timetable />
            </div>
          )}

          {activeTab === 'doubt' && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <Doubt />
            </div>
          )}

          {activeTab === 'profile' && (
            <ProfileSettings
              onProfileUpdated={(updated) => {
                setUser((prev) => ({ ...prev, name: updated.username }));
              }}
            />
          )}
        </div>
      </main>
    </div>
  );
};

export default UserDashboard;
