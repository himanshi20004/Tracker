import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const ResourceUpload = () => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) { setError('Please select a PDF file.'); return; }
        setUploading(true);
        setError('');
        setSuccess(false);

        const formData = new FormData();
        formData.append('file', file);
        formData.append('title', title);
        formData.append('description', description);

        try {
            const token = localStorage.getItem('token');
            await axios.post('http://localhost:5000/api/v1/resource', formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data',
                },
            });
            setSuccess(true);
            setTitle('');
            setDescription('');
            setFile(null);
            // reset file input
            document.getElementById('file-input').value = '';
        } catch (err) {
            setError(err.response?.data?.message || 'Upload failed. Please try again.');
        } finally {
            setUploading(false);
        }
    };

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
                        { label: '🛠 Dashboard',         path: '/adminDashboard' },
                        { label: '🧠 Create Quiz',       path: '/admin/create-quiz' },
                        { label: '🏆 Leaderboard',       path: '/leaderboard' },
                        { label: '📅 Timetable',         path: '/timetable' },
                        { label: '💬 Chat',              path: '/chat' },
                        { label: '❓ Doubts',            path: '/doubts' },
                        { label: '📚 Manage Resources',  path: '/upload' },
                    ].map(({ label, path }) => (
                        <button
                            key={path}
                            onClick={() => navigate(path)}
                            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-[14px] font-medium transition ${
                                path === '/upload'
                                    ? 'bg-gradient-to-r from-purple-600 to-blue-500 text-white shadow-md'
                                    : 'text-gray-600 hover:bg-gray-50'
                            }`}
                        >
                            {label}
                        </button>
                    ))}
                </nav>
                <div className="px-4 pb-6 mt-auto">
                    <button
                        onClick={() => { localStorage.clear(); navigate('/login'); }}
                        className="w-full px-4 py-2.5 text-[13px] font-medium text-red-600 bg-red-50 border border-red-100 rounded-xl hover:bg-red-100 transition"
                    >
                        🚪 Logout
                    </button>
                </div>
            </aside>

            {/* Main */}
            <main className="flex-1 overflow-y-auto">
                <header className="sticky top-0 z-10 flex items-center justify-between px-8 py-4 bg-white border-b border-gray-100 shadow-sm">
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">📚 Manage Resources</h1>
                        <p className="text-xs text-gray-400 mt-0.5">Upload PDFs and study materials for students</p>
                    </div>
                </header>

                <div className="px-8 py-7 max-w-2xl">

                    {/* Success banner */}
                    {success && (
                        <div className="mb-5 flex items-center gap-3 px-4 py-3 bg-green-50 border border-green-100 rounded-xl text-green-700 text-sm font-medium">
                            <span>✅</span> Resource uploaded successfully!
                        </div>
                    )}

                    {/* Error banner */}
                    {error && (
                        <div className="mb-5 flex items-center gap-3 px-4 py-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm font-medium">
                            <span>⚠️</span> {error}
                        </div>
                    )}

                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                        <h2 className="text-base font-bold text-gray-900 mb-5">Upload New Resource</h2>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Title */}
                            <div>
                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Title</label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="e.g. Chapter 3 - Organic Chemistry"
                                    required
                                    className="w-full mt-1 px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 outline-none transition"
                                />
                            </div>

                            {/* Description */}
                            <div>
                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Description</label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Brief description of the resource..."
                                    required
                                    rows={3}
                                    className="w-full mt-1 px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 outline-none transition resize-none"
                                />
                            </div>

                            {/* File Upload */}
                            <div>
                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">PDF File</label>
                                <label className="mt-1 flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-purple-400 hover:bg-purple-50 transition group">
                                    <input
                                        id="file-input"
                                        type="file"
                                        accept=".pdf"
                                        onChange={(e) => { setFile(e.target.files[0]); setError(''); }}
                                        required
                                        className="hidden"
                                    />
                                    {file ? (
                                        <div className="text-center">
                                            <p className="text-2xl mb-1">📄</p>
                                            <p className="text-sm font-semibold text-purple-700">{file.name}</p>
                                            <p className="text-xs text-gray-400">{(file.size / 1024).toFixed(1)} KB</p>
                                        </div>
                                    ) : (
                                        <div className="text-center">
                                            <p className="text-2xl mb-1 group-hover:scale-110 transition-transform">📁</p>
                                            <p className="text-sm font-medium text-gray-500">Click to choose a PDF</p>
                                            <p className="text-xs text-gray-400 mt-0.5">Only .pdf files accepted</p>
                                        </div>
                                    )}
                                </label>
                            </div>

                            <button
                                type="submit"
                                disabled={uploading}
                                className="w-full bg-gradient-to-r from-purple-600 to-blue-500 text-white font-bold py-3 rounded-xl shadow-md hover:opacity-90 transition transform active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                {uploading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                                        </svg>
                                        Uploading...
                                    </span>
                                ) : '📤 Upload Resource'}
                            </button>
                        </form>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ResourceUpload;