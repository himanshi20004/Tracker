import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ResourcesList = () => {
    const [resources, setResources] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');

    useEffect(() => {
        const fetchResources = async () => {
            try {
                const response = await axios.get('${import.meta.env.VITE_API_URL}/api/v1/resources', {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });
                setResources(response.data || []);
            } catch (err) {
                setError('Failed to load resources. Please try again.');
            } finally {
                setLoading(false);
            }
        };
        fetchResources();
    }, []);

    const getFileIcon = (url = '') => {
        if (url.endsWith('.pdf')) return 'PDF';
        if (url.match(/\.(png|jpg|jpeg|gif)$/)) return 'IMG';
        return 'FILE';
    };

    const getIconColors = (url = '') => {
        if (url.endsWith('.pdf')) return 'bg-red-50 text-red-600 border-red-100';
        if (url.match(/\.(png|jpg|jpeg|gif)$/)) return 'bg-blue-50 text-blue-600 border-blue-100';
        return 'bg-purple-50 text-purple-600 border-purple-100';
    };

    const filtered = resources.filter(r =>
        r.title?.toLowerCase().includes(search.toLowerCase()) ||
        r.description?.toLowerCase().includes(search.toLowerCase())
    );

    if (loading) return (
        <div className="flex items-center justify-center py-16">
            <div className="text-center">
                <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-sm text-gray-400">Loading resources...</p>
            </div>
        </div>
    );

    if (error) return (
        <div className="flex items-center gap-3 px-4 py-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm font-medium">
            {error}
        </div>
    );

    return (
        <div className="space-y-5">
            {/* ═══ Header ═══ */}
            <div className="flex items-center justify-between gap-4 flex-wrap">
                <div>
                    <h2 className="text-base font-bold text-gray-900">Shared Resources</h2>
                    <p className="text-xs text-gray-400 mt-0.5">
                        {resources.length} file{resources.length !== 1 ? 's' : ''} available
                    </p>
                </div>
                <input
                    type="text"
                    placeholder="Search resources..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="px-4 py-2 text-sm bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-purple-400 transition w-56"
                />
            </div>

            {/* ═══ Resource Cards ═══ */}
            {filtered.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {filtered.map((resource) => (
                        <div
                            key={resource._id}
                            className="flex items-start gap-4 p-4 bg-gray-50 border border-gray-100 rounded-2xl hover:border-purple-200 hover:bg-purple-50 transition group"
                        >
                            {/* File Type Icon */}
                            <div className={`w-11 h-11 rounded-xl border flex items-center justify-center text-[10px] font-black shrink-0 shadow-sm ${getIconColors(resource.fileUrl)}`}>
                                {getFileIcon(resource.fileUrl)}
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-gray-900 truncate">{resource.title}</p>
                                {resource.description && (
                                    <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{resource.description}</p>
                                )}
                                
                                {/* Fixed Download Link */}
                                <a
                                    href={`http://localhost:5000/${resource.fileUrl}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 mt-3 px-3 py-1.5 text-[11px] font-bold text-white bg-gradient-to-r from-purple-600 to-blue-500 rounded-lg hover:opacity-90 transition shadow-sm"
                                >
                                    📥 Download
                                </a>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-400 text-2xl mb-3 font-bold">
                        ?
                    </div>
                    <p className="text-sm font-medium text-gray-500">
                        {search ? 'No resources match your search.' : 'No resources uploaded yet.'}
                    </p>
                </div>
            )}
        </div>
    );
};

export default ResourcesList;