import { useState } from 'react';
import { toast } from 'react-toastify';
import { useNavigate, Link } from 'react-router-dom';
import api, { clearAuthStorage } from '../utils/api';
import { disconnectSocket } from '../utils/socket';

const CreateQuizForm = () => {
  const [title, setTitle] = useState('');
  const [timer, setTimer] = useState('');
  const [deadline, setDeadline] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [questions, setQuestions] = useState([
    { questionText: '', options: ['', '', '', ''], correctAnswer: 0, points: 10 },
  ]);

  const navigate = useNavigate();

  const addQuestion = () => {
    setQuestions((prev) => [
      ...prev,
      { questionText: '', options: ['', '', '', ''], correctAnswer: 0, points: 10 },
    ]);
  };

  const removeQuestion = (index) => {
    if (questions.length === 1) return;
    setQuestions((prev) => prev.filter((_, i) => i !== index));
  };

  const updateQuestion = (index, field, value) => {
    setQuestions((prev) =>
      prev.map((q, i) => (i === index ? { ...q, [field]: value } : q))
    );
  };

  const updateOption = (qIndex, optIndex, value) => {
    setQuestions((prev) =>
      prev.map((q, i) =>
        i === qIndex
          ? { ...q, options: q.options.map((o, oi) => (oi === optIndex ? value : o)) }
          : q
      )
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const isInvalid = questions.some(
      (q) => !q.questionText.trim() || q.options.some((opt) => opt.trim() === '')
    );
    if (!title.trim() || !timer || !deadline || isInvalid) {
      toast.error('Please fill in all fields including all options.');
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/postquizzes', {
        title: title.trim(),
        questions,
        timer: parseInt(timer, 10),
        deadline,
      });
      toast.success('Quiz created successfully!');
      setTimeout(() => navigate('/adminDashboard'), 1200);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create quiz.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = async () => {
    try { await api.get('/logout'); } catch { /* noop */ }
    disconnectSocket();
    clearAuthStorage();
    navigate('/login');
  };

  const optionLabels = ['A', 'B', 'C', 'D'];
  const navLinks = [
    { label: '🛠 Dashboard',        path: '/adminDashboard' },
    { label: '🧠 Create Quiz',      path: '/admin/create-quiz' },
    { label: '🏆 Leaderboard',      path: '/leaderboard' },
    { label: '📅 Timetable',        path: '/timetable' },
    { label: '💬 Chat',             path: '/chat' },
    { label: '❓ AI Doubts',        path: '/doubt' },
    { label: '📚 Manage Resources', path: '/upload' },
  ];

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
      <nav className="flex-1 px-3 space-y-1 mt-4">
        {navLinks.map(({ label, path }) => (
          <Link
            key={path}
            to={path}
            onClick={() => setMobileMenuOpen(false)}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition ${
              path === '/admin/create-quiz'
                ? 'bg-gradient-to-r from-purple-600 to-blue-500 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            {label}
          </Link>
        ))}
      </nav>
      <div className="px-4 pb-6 mt-auto">
        <button
          onClick={handleLogout}
          className="w-full px-4 py-2.5 text-sm font-medium text-red-600 bg-red-50 border border-red-100 rounded-xl hover:bg-red-100 transition"
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
              <h1 className="text-lg sm:text-xl font-bold text-gray-900">Create Quiz</h1>
              <p className="text-xs text-gray-400 mt-0.5">Build a new quiz for your students</p>
            </div>
          </div>
          <div className="text-sm text-gray-500">
            {questions.length} question{questions.length !== 1 ? 's' : ''}
          </div>
        </header>

        <div className="px-4 sm:px-8 py-7 max-w-3xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-base font-bold text-gray-900 mb-4">Quiz Details</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Quiz Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Chapter 5 - Thermodynamics"
                    required
                    className="w-full mt-1 px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 outline-none transition"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Timer (seconds)</label>
                    <input
                      type="number"
                      value={timer}
                      onChange={(e) => setTimer(e.target.value)}
                      placeholder="e.g. 600"
                      required
                      min="10"
                      className="w-full mt-1 px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 outline-none transition"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Deadline</label>
                    <input
                      type="datetime-local"
                      value={deadline}
                      onChange={(e) => setDeadline(e.target.value)}
                      required
                      className="w-full mt-1 px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 outline-none transition"
                    />
                  </div>
                </div>
              </div>
            </div>

            {questions.map((question, index) => (
              <div key={index} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-blue-500 flex items-center justify-center text-white text-xs font-bold">
                      {index + 1}
                    </div>
                    <h3 className="text-sm font-bold text-gray-900">Question {index + 1}</h3>
                  </div>
                  {questions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeQuestion(index)}
                      className="text-xs font-semibold text-red-500 bg-red-50 border border-red-100 px-3 py-1.5 rounded-lg hover:bg-red-100 transition"
                    >
                      Remove
                    </button>
                  )}
                </div>

                <div className="mb-4">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Question Text</label>
                  <input
                    type="text"
                    placeholder="Type your question here..."
                    value={question.questionText}
                    onChange={(e) => updateQuestion(index, 'questionText', e.target.value)}
                    required
                    className="w-full mt-1 px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 outline-none transition"
                  />
                </div>

                <div className="mb-4">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">Answer Options</label>
                  <div className="space-y-2">
                    {question.options.map((option, optIndex) => (
                      <div key={optIndex} className="flex items-center gap-3">
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 border ${
                          question.correctAnswer === optIndex
                            ? 'bg-green-500 text-white border-green-500'
                            : 'bg-gray-50 text-gray-500 border-gray-100'
                        }`}>
                          {optionLabels[optIndex]}
                        </div>
                        <input
                          type="text"
                          placeholder={`Option ${optionLabels[optIndex]}`}
                          value={option}
                          onChange={(e) => updateOption(index, optIndex, e.target.value)}
                          required
                          className="flex-1 px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 outline-none transition"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Correct Answer</label>
                    <select
                      value={question.correctAnswer}
                      onChange={(e) => updateQuestion(index, 'correctAnswer', parseInt(e.target.value, 10))}
                      className="w-full mt-1 px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 outline-none transition"
                    >
                      <option value={0}>A - Option 1</option>
                      <option value={1}>B - Option 2</option>
                      <option value={2}>C - Option 3</option>
                      <option value={3}>D - Option 4</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Points</label>
                    <input
                      type="number"
                      value={question.points}
                      onChange={(e) => {
                        const parsed = parseInt(e.target.value, 10);
                        updateQuestion(index, 'points', Number.isNaN(parsed) ? 0 : parsed);
                      }}
                      required
                      min="0"
                      className="w-full mt-1 px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 outline-none transition"
                    />
                  </div>
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={addQuestion}
              className="w-full py-3 border-2 border-dashed border-gray-200 rounded-2xl text-sm font-semibold text-gray-500 hover:border-purple-400 hover:text-purple-600 hover:bg-purple-50 transition"
            >
              + Add Another Question
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-500 text-white font-bold py-3 rounded-xl shadow-md hover:opacity-90 transition active:scale-95 disabled:opacity-60"
            >
              {submitting ? 'Saving Quiz...' : 'Save Quiz'}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default CreateQuizForm;
