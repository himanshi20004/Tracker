import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate, Link } from 'react-router-dom';

const CreateQuizForm = () => {
  const [title, setTitle] = useState('');
  const [timer, setTimer] = useState('');
  const [deadline, setDeadline] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [questions, setQuestions] = useState([
    { questionText: '', options: ['', '', '', ''], correctAnswer: 0, points: 0 }
  ]);

  const navigate = useNavigate();

  const addQuestion = () => {
    setQuestions([...questions, { questionText: '', options: ['', '', '', ''], correctAnswer: 0, points: 0 }]);
  };

  const removeQuestion = (index) => {
    if (questions.length === 1) return;
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const updateQuestion = (index, field, value) => {
    const updated = [...questions];
    updated[index][field] = value;
    setQuestions(updated);
  };

  const updateOption = (qIndex, optIndex, value) => {
    const updated = [...questions];
    updated[qIndex].options[optIndex] = value;
    setQuestions(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const isInvalid = questions.some(q =>
      !q.questionText || q.options.some(opt => opt.trim() === '')
    );
    if (!title || !timer || !deadline || isInvalid) {
      toast.error('Please fill in all fields including all options.');
      return;
    }

    setSubmitting(true);
    const token = localStorage.getItem('token');
    try {
      await axios.post(
        'http://localhost:5000/api/v1/postquizzes',
        { title, questions, timer: parseInt(timer, 10), deadline },
        { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
      );
      toast.success('Quiz created successfully!');
      setTimeout(() => navigate('/adminDashboard'), 1500);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create quiz.');
    } finally {
      setSubmitting(false);
    }
  };

  const optionLabels = ['A', 'B', 'C', 'D'];

  return (
    <div className="min-h-screen flex bg-gray-50 font-sans">

      {/* Sidebar */}
      <aside className="w-64 shrink-0 flex flex-col bg-white border-r border-gray-100 shadow-sm min-h-screen">
        <div className="flex items-center gap-2.5 px-6 py-5 border-b border-gray-100">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-blue-500 flex items-center justify-center shadow">
            <div className="w-2 h-2 bg-white rounded-full" />
          </div>
          <span className="text-lg font-bold text-gray-900">StudyWave Admin</span>
        </div>
        <nav className="flex-1 px-3 space-y-1 mt-4">
          {[
            { label: 'Dashboard',        icon: 'grid',     path: '/adminDashboard' },
            { label: 'Create Quiz',      icon: 'brain',    path: '/admin/create-quiz' },
            { label: 'Leaderboard',      icon: 'trophy',   path: '/leaderboard' },
            { label: 'Timetable',        icon: 'calendar', path: '/timetable' },
            { label: 'Chat',             icon: 'chat',     path: '/chat' },
            { label: 'Doubts',           icon: 'question', path: '/doubts' },
            { label: 'Manage Resources', icon: 'book',     path: '/upload' },
          ].map(({ label, path }) => (
            <Link
              key={path}
              to={path}
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
            onClick={() => { localStorage.clear(); navigate('/login'); }}
            className="w-full px-4 py-2.5 text-sm font-medium text-red-600 bg-red-50 border border-red-100 rounded-xl hover:bg-red-100 transition"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto">
        <header className="sticky top-0 z-10 flex items-center justify-between px-8 py-4 bg-white border-b border-gray-100 shadow-sm">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Create Quiz</h1>
            <p className="text-xs text-gray-400 mt-0.5">Build a new quiz for your students</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            {questions.length} question{questions.length !== 1 ? 's' : ''} added
          </div>
        </header>

        <div className="px-8 py-7 max-w-3xl">
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Quiz Info Card */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-base font-bold text-gray-900 mb-4">Quiz Details</h2>
              <div className="space-y-4">

                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Quiz Title
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Chapter 5 - Thermodynamics"
                    required
                    className="w-full mt-1 px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 outline-none transition"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Timer (seconds)
                    </label>
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
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Deadline
                    </label>
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

            {/* Questions */}
            {questions.map((question, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6"
              >
                {/* Question header */}
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

                {/* Question text */}
                <div className="mb-4">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Question Text
                  </label>
                  <input
                    type="text"
                    placeholder="Type your question here..."
                    value={question.questionText}
                    onChange={(e) => updateQuestion(index, 'questionText', e.target.value)}
                    required
                    className="w-full mt-1 px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 outline-none transition"
                  />
                </div>

                {/* Options */}
                <div className="mb-4">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">
                    Answer Options
                  </label>
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
                          placeholder={"Option " + optionLabels[optIndex]}
                          value={option}
                          onChange={(e) => updateOption(index, optIndex, e.target.value)}
                          required
                          className="flex-1 px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 outline-none transition"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Correct answer + points */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Correct Answer (0-3)
                    </label>
                    <select
                      value={question.correctAnswer}
                      onChange={(e) => updateQuestion(index, 'correctAnswer', parseInt(e.target.value))}
                      className="w-full mt-1 px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 outline-none transition"
                    >
                      <option value={0}>A - Option 1</option>
                      <option value={1}>B - Option 2</option>
                      <option value={2}>C - Option 3</option>
                      <option value={3}>D - Option 4</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Points
                    </label>
                    <input
                      type="number"
                      value={question.points}
                      onChange={(e) => updateQuestion(index, 'points', parseInt(e.target.value))}
                      required
                      min="0"
                      className="w-full mt-1 px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 outline-none transition"
                    />
                  </div>
                </div>

              </div>
            ))}

            {/* Add Question */}
            <button
              type="button"
              onClick={addQuestion}
              className="w-full py-3 border-2 border-dashed border-gray-200 rounded-2xl text-sm font-semibold text-gray-500 hover:border-purple-400 hover:text-purple-600 hover:bg-purple-50 transition"
            >
              + Add Another Question
            </button>

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-500 text-white font-bold py-3 rounded-xl shadow-md hover:opacity-90 transition active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
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