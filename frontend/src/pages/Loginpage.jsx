import React, { useState } from "react";
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate(); // useNavigate for navigation

    const handleSubmit = async (e) => {
        e.preventDefault(); // Prevent default form submission
    
        try {
            // Send post request to backend API
            const response = await axios.post('http://localhost:5000/api/v1/login', {
                email,
                password,
            });
    
            // Assuming that backend returns token and user data
            const { user } = response.data; // Destructure user object from response
            if (user && user.role && response.data.token) {
                const { role, token } = user;
                const userData = { id: response.data.user.id, role: response.data.user.role };
    
                // Store token and role in localStorage
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('role', role);
                localStorage.setItem('user', JSON.stringify(userData));
                
                localStorage.setItem("userId", user.id); // Assuming user._id is the user's ID
                
                // Navigate to the dashboard based on the user's role
                if (role === 'admin') {
                    navigate('/adminDashboard'); // Redirect to Admin Dashboard
                } else {
                    navigate('/userDashboard'); // Redirect to User Dashboard
                }
            }
        } catch (err) {
            // Invalid credentials or error response
            if (err.response && err.response.status === 401) {
                setError('Invalid Email or Password');
            } else {
                setError('An Error Occurred. Please try again later...');
            }
        }
    };
    
    return (
        <div className="bg-gradient-to-t from-black to-[#3b0a45] flex items-center justify-center h-screen">
            <div className="bg-[#a3a6a2] rounded-lg shadow-lg p-8 w-96">
                <h1 className="text-center text-2xl font-semibold text-gray-800 font-serif">Login</h1>
                {error && <p className="text-red-500 text-center font-serif">{error}</p>}
                <form onSubmit={handleSubmit} className="mt-4">
                    <div className="mb-4">
                        <label className="block text-gray-900">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="mt-1 block w-full border border-gray-300 rounded-md font-serif p-2"
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-900 font-serif ">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="mt-1 block w-full border font-serif border-gray-300 rounded-md p-2"
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-purple-900 text-white rounded-md py-2 hover:bg-purple-700 transition font-serif duration-200"
                    >
                        Login
                    </button>
                </form>
            </div>
        </div>
    );
};

export default LoginPage;
