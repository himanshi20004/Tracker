import React, { useState } from "react";
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Registration = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('user'); // Default role set to 'User'
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            // Send post request to backend API
            const response = await axios.post('http://localhost:5000/api/v1/register', {
                username,
                email,
                password,
                role, 
            });

            if (response.data.message) {
                setSuccess('Registration successful! Redirecting to login...');
                setError('');
                setTimeout(() => {
                    navigate('/login');
                }, 1000);
            }
        } catch (err) {
            setError(err.response ? err.response.data.message : 'An error occurred. Please try again.');
            setSuccess('');
        }
    };

    return (
        <div className="bg-gradient-to-t from-black to-[#3b0a45] flex items-center justify-center h-screen">
            <div className="bg-[#a3a6a2] rounded-lg shadow-lg p-8 w-96">
                <h1 className="text-2xl font-bold text-center mb-4">Register</h1>
                {error && <p className="text-red-500 text-center">{error}</p>}
                {success && <p className="text-green-500 text-center">{success}</p>}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium">Username</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            className="w-full px-4 py-2 mt-1 rounded-lg text-black"
                            placeholder="Enter your username"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full px-4 py-2 mt-1 rounded-lg text-black"
                            placeholder="Enter your email"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full px-4 py-2 mt-1 rounded-lg text-black"
                            placeholder="Create a password"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Role</label>
                        <select
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            required
                            className="w-full px-4 py-2 mt-1 rounded-lg text-black"
                        >
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>
                    <button
                        type="submit"
                        className="w-full py-2 bg-[#4b007a] hover:bg-[#3c0063] rounded-lg font-semibold text-white"
                    >
                        Register
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Registration;
