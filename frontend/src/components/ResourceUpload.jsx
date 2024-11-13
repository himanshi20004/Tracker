import React, { useState } from 'react';
import axios from 'axios';

const ResourceUpload = () => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [file, setFile] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
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
            alert('Resource uploaded successfully!');
            setTitle('');            
        setDescription('');       
        setFile(null);            
        

        } catch (error) {
            console.error('Error uploading resource:', error);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-t from-black to-[#3b0a45]">
            <form 
                onSubmit={handleSubmit} 
                className="w-full max-w-md p-8 bg-[#a3a6a2]  rounded-lg shadow-md"
            >
                <h2 className="text-2xl font-semibold text-gray-700 text-center mb-6">Upload Resource</h2>
                <div className="mb-4">
                    <input 
                        type="text" 
                        value={title} 
                        onChange={(e) => setTitle(e.target.value)} 
                        placeholder="Title" 
                        required 
                        className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-600"
                    />
                </div>
                <div className="mb-4">
                    <textarea 
                        value={description} 
                        onChange={(e) => setDescription(e.target.value)} 
                        placeholder="Description" 
                        required 
                        className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-600"
                    />
                </div>
                <div className="mb-4">
                    <input 
                        type="file" 
                        accept=".pdf" 
                        onChange={(e) => setFile(e.target.files[0])} 
                        required 
                        className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-600"
                    />
                </div>
                <button 
                    type="submit" 
                    className="w-full px-4 py-2 mt-4 text-white bg-purple-600 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-4 focus:ring-purple-500 focus:ring-opacity-50"
                >
                    Upload Resource
                </button>
            </form>
        </div>
    );
};

export default ResourceUpload;
