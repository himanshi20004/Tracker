import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { clearAuthStorage } from '../utils/api';
import { disconnectSocket } from '../utils/socket';

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

const ResourceUpload = () => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const navigate = useNavigate();

    const handleFileChange = (e) => {
        const selected = e.target.files?.[0] || null;
        setError('');
        if (selected) {
            if (!selected.name.toLowerCase().endsWith('.pdf')) {
                setError('Only PDF files are allowed.');
                e.target.value = '';
                setFile(null);
                return;
            }
            if (selected.size > MAX_FILE_SIZE_BYTES) {
                setError('File size must be 10MB or less.');
                e.target.value = '';
                setFile(null);
                return;
            }
        }
        setFile(selected);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) {
            setError('Please select a PDF file.');
            return;
        }
        setUploading(true);
        setError('');
        setSuccess(false);

        const formData = new FormData();
        formData.append('file', file);
        formData.append('title', title.trim());
        formData.append('description', description.trim());

        try {
            await api.post('/resource', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            setSuccess(true);
            setTitle('');
            setDescription('');
            setFile(null);
            const inputEl = document.getElementById('file-input');
            if (inputEl) inputEl.value = '';
        } catch (err) {
            setError(err.response?.data?.message || 'Upload failed. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    const handleLogout = async () => {
        try { await api.get('/logout'); } catch { /* noop */ }
        disconnectSocket();
        clearAuthStorage();
        navigate('/login');
    };

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
                    <button
                        key={path}
                        onClick={() => { setMobileMenuOpen(false); navigate(path); }}
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
                <header className="sticky top-0 z-10 flex items-center gap-3 px-4 sm:px-8 py-4 bg-white border-b border-gray-100 shadow-sm">
                    <button
                        onClick={() => setMobileMenuOpen(true)}
                        className="md:hidden p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50"
                        aria-label="Open menu"
                    >
                        ☰
                    </button>
                    <div>
                        <h1 className="text-lg sm:text-xl font-bold text-gray-900">📚 Manage Resources</h1>
                        <p className="text-xs text-gray-400 mt-0.5">Upload PDFs and study materials for students (max 10MB)</p>
                    </div>
                </header>

                <div className="px-4 sm:px-8 py-7 max-w-2xl">
                    {success && (
                        <div className="mb-5 flex items-center gap-3 px-4 py-3 bg-green-50 border border-green-100 rounded-xl text-green-700 text-sm font-medium">
                            <span>✅</span> Resource uploaded successfully!
                        </div>
                    )}

                    {error && (
                        <div className="mb-5 flex items-center gap-3 px-4 py-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm font-medium">
                            <span>⚠️</span> {error}
                        </div>
                    )}

                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                        <h2 className="text-base font-bold text-gray-900 mb-5">Upload New Resource</h2>

                        <form onSubmit={handleSubmit} className="space-y-4">
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

                            <div>
                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">PDF File</label>
                                <label className="mt-1 flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-purple-400 hover:bg-purple-50 transition group">
                                    <input
                                        id="file-input"
                                        type="file"
                                        accept=".pdf,application/pdf"
                                        onChange={handleFileChange}
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
                                            <p className="text-xs text-gray-400 mt-0.5">Only .pdf files up to 10MB</p>
                                        </div>
                                    )}
                                </label>
                            </div>

                            <button
                                type="submit"
                                disabled={uploading}
                                className="w-full bg-gradient-to-r from-purple-600 to-blue-500 text-white font-bold py-3 rounded-xl shadow-md hover:opacity-90 transition active:scale-95 disabled:opacity-60"
                            >
                                {uploading ? 'Uploading...' : '📤 Upload Resource'}
                            </button>
                        </form>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ResourceUpload;
