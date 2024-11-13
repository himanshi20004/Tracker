import React, { useState, useEffect } from 'react';
const ResourcesList = () => {
    const [resources, setResources] = useState([]);

    useEffect(() => {
        const fetchResources = async () => {
            const response = await axios.get('http://localhost:5000/api/v1/resource');
            setResources(response.data);
        };
        fetchResources();
    }, []);

    return (
        <div>
            <h2>Resources</h2>
            <ul>
                {resources.map(resource => (
                    <li key={resource._id}>
                        <h3>{resource.title}</h3>
                        <p>{resource.description}</p>
                        <a href={resource.fileUrl} target="_blank" rel="noopener noreferrer">Download PDF</a>
                    </li>
                ))}
            </ul>
        </div>
    );
};
export default ResourcesList