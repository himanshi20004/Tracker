import React, { useEffect, useState } from 'react';
import axios from 'axios';

const ResourcesPage = () => {
    const [resources, setResources] = useState([]);

    useEffect(() => {
        async function fetchResources() {
            try {
                const response = await axios.get('http://localhost:5000/api/v1/resources', {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                });
                setResources(response.data);
            } catch (error) {
                console.error('Error fetching resources:', error);
            }
        }
        fetchResources();
    }, []);

    return (
        <div className=" mx-auto p-8 text-center bg-gradient-to-t from-black to-[#3b0a45] w-screen  h-screen  rounded-lg shadow-lg">
            <h1 className="text-3xl font-bold text-white mb-6 font-serif">Admin Shared Resources</h1>
            <ul className="space-y-4">
                {resources.map((resource, index) => (
                    <li key={index} className="transition-transform transform hover:scale-105">
                        <a 
                            href={`http://localhost:5000/${resource.fileUrl}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-block px-4 py-2 font-serif bg-purple-600 text-white rounded-lg  hover:bg-purple-700 transition-colors"
                        >
                            {resource.title|| `Resource ${index + 1}`}
                        </a>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default ResourcesPage;
