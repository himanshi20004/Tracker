import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const ResourcesPage = () => {
    const [resources, setResources] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        async function fetchResources() {
            try {
                const response = await axios.get('http://localhost:5000/api/v1/resources', {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });
                setResources(response.data || []);
            } catch (err) {
                setError('Could not load resources. Please try again.');
            } finally {
                setLoading(false);
            }
        }
        fetchResources();
    }, []);

    const filtered = resources.filter(r =>
        r.title?.toLowerCase().includes(search.toLowerCase()) ||
        r.description?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gray-50 font-sans">

            {/* Header */}
            <header className="sticky top-0 z-10 bg-white border-b border-gray-100 shadow-sm px-8 py-4 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-blue-500 flex items-center justify-center shadow">
                        <div className="w-2 h-2 bg-white rounded-full" />
                    </div>
                    <span className="text-lg font-bold text-gray-900">StudyWave</span>
                </div>
                <button
                    onClick={() => navigate(-1)}
                    className="text-sm text-gray-500 hover:text-gray-800 transition flex items-center gap-1"
                >
                    <span>←</span> Back
                </button>
            </header>

            <div className="max-w-4xl mx-auto px-8 py-8">

                {/* Page title + search */}
                <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Resources</h1>
                        <p className="text-sm text-gray-400 mt-0.5">Study materials shared by your admin</p>
                    </div>
                    <input
                        type="text"
                        placeholder="Search resources..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="px-4 py-2 text-sm bg-white border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-purple-400 transition w-60 shadow-sm"
                    />
                </div>

                {/* States */}
                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : error ? (
                    <div className="px-4 py-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm font-medium">
                        ⚠️ {error}
                    </div>
                ) : filtered.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filtered.map((resource) => (
                            <div
                                key={resource._id}
                                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md hover:border-purple-200 transition flex flex-col gap-3"
                            >
                                <div className="w-12 h-12 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-2xl">
                                    {resource.fileUrl?.endsWith('.pdf') ? '📄' : '📁'}
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-bold text-gray-900 line-clamp-1">{resource.title}</p>
                                    {resource.description && (
                                        <p className="text-xs text-gray-400 mt-1 line-clamp-2">{resource.description}</p>
                                    )}
                                </div>
                                
                                {/* FIXED: Proper <a> tag with attributes */}
                                <a
                                    href={`http://localhost:5000/${resource.fileUrl}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full text-center py-2.5 text-xs font-bold text-white bg-gradient-to-r from-purple-600 to-blue-500 rounded-xl hover:opacity-90 transition shadow-sm"
                                >
                                    Download File
                                </a>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20">
                        <p className="text-4xl mb-3">📭</p>
                        <p className="text-sm text-gray-500">
                            {search ? 'No resources match your search.' : 'No resources available yet.'}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ResourcesPage;