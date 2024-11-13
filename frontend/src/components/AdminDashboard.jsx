import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import RedirectButton from './Redirectbuttton';
import ResourceUpload from './ResourceUpload';
import CreateQuizForm from './Quizcreation';

const AdminDashboard = () => {
    const [taskData, setTaskData] = useState({
        title: '',
        description: '',
        points: '',
        deadline: '',
    });
    const navigate = useNavigate();
    const [tasks, setTasks] = useState([]);
    const [editingTaskId, setEditingTaskId] = useState(null);
    const [quizzes, setQuizzes] = useState([]); // State to store quizzes
    const [showCreateQuizForm, setShowCreateQuizForm] = useState(false);

    useEffect(() => {
        const fetchTasks = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/v1/task', {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    }
                });
                setTasks(response.data.tasks);
            } catch (error) {
                console.error('Error fetching tasks:', error.response ? error.response.data : error.message);
            }
        };

        const fetchQuizzes = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/v1/quizzes', {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    }
                });
                setQuizzes(response.data.quizzes); // Store quizzes in state
            } catch (error) {
                console.error('Error fetching quizzes:', error.response ? error.response.data : error.message);
            }
        };

        fetchTasks();
        fetchQuizzes();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setTaskData({ ...taskData, [name]: value });
    };

    const saveTask = async (e) => {
        e.preventDefault();

        try {
            if (editingTaskId) {
                await axios.put(`http://localhost:5000/api/v1/task/${editingTaskId}`, taskData, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    }
                });
                setTasks(tasks.map(task => (task._id === editingTaskId ? { ...task, ...taskData } : task)));
            } else {
                const response = await axios.post('http://localhost:5000/api/v1/task', taskData, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    }
                });
                setTasks([...tasks, response.data.task]);
            }

            setTaskData({
                title: '',
                description: '',
                points: '',
                deadline: ''
            });
            setEditingTaskId(null);
        } catch (error) {
            console.error('Error saving task:', error.response ? error.response.data : error.message);
        }
    };

    const openResourcesTab = () => {
        window.open('/upload', '_blank');
    };

    const editTask = (task) => {
        setTaskData({
            title: task.title,
            description: task.description,
            points: task.points,
            deadline: task.deadline,
        });
        setEditingTaskId(task._id);
    };

    const deleteTask = async (taskId) => {
        try {
            await axios.delete(`http://localhost:5000/api/v1/task/${taskId}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                }
            });
            setTasks(tasks.filter(task => task._id !== taskId));
        } catch (error) {
            console.error('Error deleting task:', error.response ? error.response.data : error.message);
        }
    };

    const deleteQuiz = async (quizId) => {
        try {
            await axios.delete(`http://localhost:5000/api/v1/quizzes/${quizId}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                }
            });
            setQuizzes(quizzes.filter(quiz => quiz._id !== quizId)); // Remove deleted quiz from state
        } catch (error) {
            console.error('Error deleting quiz:', error.response ? error.response.data : error.message);
        }
    };

    return (
        <div className="p-5 bg-gradient-to-t from-black to-[#3b0a45] flex h-screen">
            {/* Left Column for Adding Tasks */}
            <div className="w-1/2 p-5">
                <h1 className="text-2xl font-bold mb-5 text-white font-serif">Admin Dashboard</h1>
                <form onSubmit={saveTask} className="mb-5">
                    <input
                        type="text"
                        name="title"
                        placeholder="Task Title"
                        value={taskData.title}
                        onChange={handleChange}
                        required
                        className="border p-2 font-serif w-full mb-2"
                    />
                    <textarea
                        name="description"
                        placeholder="Task Description"
                        value={taskData.description}
                        onChange={handleChange}
                        required
                        className="border p-2 font-serif w-full mb-2"
                    />
                    <input
                        type="number"
                        name="points"
                        placeholder="Points"
                        value={taskData.points}
                        onChange={handleChange}
                        required
                        className="border p-2 font-serif w-full mb-2"
                    />
                    <input
                        type="datetime-local"
                        name="deadline"
                        value={taskData.deadline}
                        onChange={handleChange}
                        required
                        className="border p-2 font-serif w-full mb-2"
                    />
                    <button type="button" onClick={saveTask} className="bg-[#475569] font-serif text-white p-2 rounded">
                        {editingTaskId ? 'Update Task' : 'Add Task'}
                    </button>
                </form>
            </div>

            {/* Right Column for Task List and Quizzes */}
            <div className="w-1/2 p-5">
                <h2 className="text-xl font-semibold mb-2 pl-5 text-white font-serif">Tasks</h2>
                <ul className="list-decimal pl-5 text-white font-serif">
                    {Array.isArray(tasks) && tasks.length > 0 ? (
                        tasks.map(task => (
                            <li key={task._id} className="flex justify-between items-center mb-2">
                                <span>{task.title} - {task.points} points - {new Date(task.deadline).toLocaleString()}</span>
                                <div>
                                    <button onClick={() => editTask(task)} className="bg-[#075985] font-serif text-white p-1 rounded mx-1">Edit</button>
                                    <button onClick={() => deleteTask(task._id)} className="bg-red-500 font-serif text-white p-1 rounded">Delete</button>
                                </div>
                            </li>
                        ))
                    ) : (
                        <li>No tasks available.</li>
                    )}
                </ul>

                {/* Display quizzes */}
                <h2 className="text-xl font-semibold mb-2 pl-5 text-white font-serif mt-5">Quizzes</h2>
                <ul className="list-decimal pl-5 text-white font-serif">
                    {Array.isArray(quizzes) && quizzes.length > 0 ? (
                        quizzes.map(quiz => (
                            <li key={quiz._id} className="flex justify-between items-center mb-2">
                                <span>{quiz.title} - {quiz.questions.length} questions</span>
                                <div>
                                    <button onClick={() => deleteQuiz(quiz._id)} className="bg-red-500 font-serif text-white p-1 rounded">Delete</button>
                                </div>
                            </li>
                        ))
                    ) : (
                        <li>No quizzes available.</li>
                    )}
                </ul>

                <RedirectButton />
                <button onClick={openResourcesTab} className="bg-blue-500 font-serif text-white p-1 rounded mx-1">
                    View Shared Resources
                </button>
                <button onClick={() => navigate('/admin/create-quiz')} className="bg-green-500 font-serif text-white p-1 rounded mx-1">
                    Create Quiz
                </button>
            </div>
        </div>
    );
};

export default AdminDashboard;
