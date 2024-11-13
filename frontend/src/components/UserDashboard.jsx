import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Navigate } from 'react-router-dom';
import RedirectButton from './Redirectbuttton';
import Timetable from './Timetable';
import ResourcesList from './ResourceList';
import ChatUI from './Chat';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom'; 
import QuizList from './QuizList';
import TakeQuiz from './Takequiz';
import coin from '../assets/coin.png'

const UserDashboard = () => {
    const [user, setUser] = useState({ name: '', points: 0, completedTasks: [] });
    const [tasks, setTasks] = useState([]);
    const [completedTaskDetails, setCompletedTaskDetails] = useState([]);
    const [quizzes, setQuizzes] = useState([]);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
    const navigate = useNavigate(); // Initialize navigate function



    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/v1/me', {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
                });
                const { user: userData } = response.data;

                setUser({
                    name: userData?.username || 'No Name',
                    points: userData?.points || 0,
                    completedTasks: userData?.completedTasks || [],
                });

                // Fetch completed task details
                if (userData.completedTasks.length > 0) {
                    const completedTasksResponse = await axios.post(
                        'http://localhost:5000/api/v1/details',
                        { taskIds: userData.completedTasks },
                        { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } }
                    );
                    setCompletedTaskDetails(completedTasksResponse.data.tasks);
                }

                // Fetch and filter tasks based on completedTasks
                const tasksResponse = await axios.get('http://localhost:5000/api/v1/task', {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
                });
                const allTasks = tasksResponse.data.tasks;
                const filteredTasks = allTasks.filter(
                    (task) => !userData.completedTasks.includes(task._id)
                );
                setTasks(filteredTasks);
            } catch (error) {
                console.error('Error fetching user or task data:', error);
            }
        };

        fetchUserData();
    }, []);
    const openResourcesTab = () => {
        window.open('/resources', '_blank');
    };
    useEffect(() => {
        //console.log("User state after fetch:", user);
    }, [user]);
    


    // Fetch all quizzes
  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          toast.error('You must be logged in to view quizzes.');
          return;
        }

        const response = await axios.get('http://localhost:5000/api/v1/getquizzes', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.data && response.data.quizzes) {
            console.log(response.data)
          setQuizzes(response.data.quizzes);
        } else {
          toast.error('No quizzes available.');
        }
      } catch (error) {
        toast.error('Failed to fetch quizzes.');
        console.error('Error fetching quizzes:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuizzes();
  }, []);
     


  // Handle quiz submission to reset the selectedQuiz state
  const handleQuizSubmit = () => {
    setSelectedQuiz(null);
  };

// Handle "Take Quiz" button click
const handleTakeQuiz = (quiz) => {
    setSelectedQuiz(quiz);
  };
const handleQuizClose = () => {
    console.log('Quiz is closed');
    setShowQuiz(false);  // This could hide the quiz modal or perform another action
  };


    const completeTask = async (taskId) => {
        const task = tasks.find((t) => t._id === taskId);
        if (!task) return;

        try {
            const updatedPoints = user.points + task.points;
            const updatedCompletedTasks = [...user.completedTasks, taskId];

            await axios.patch(
                'http://localhost:5000/api/v1/user/update',
                { completedTasks: updatedCompletedTasks, points: updatedPoints },
                { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } }
            );

            // Update local user state after completion
            setUser((prevUser) => ({
                ...prevUser,
                points: updatedPoints,
                completedTasks: updatedCompletedTasks,
            }));

            // Remove completed task from tasks list
            setTasks((prevTasks) => prevTasks.filter((task) => task._id !== taskId));

            // Update completed task details
            setCompletedTaskDetails((prevDetails) => [...prevDetails, task]);
        } catch (error) {
            console.error('Error completing task:', error);
        }
    };

    return (
        <div className="flex bg-gradient-to-t from-black to-[#3b0a45] h-[200vh]  font-serif">
            <div className="w-1/5 p-5 bg-gradient-to-t from-black to-[#5f3168] flex-row text-white">
                <h1 className="text-2xl font-bold mb-2 my-2">User: {user.name}</h1>
                <p className="mb-4 text-xl flex items-center">
  Points: {user.points} 
  <img src={coin} alt="coin icon" className="ml-2 w-6 h-6 rounded-full" />
</p>

                <button
                    className="bg-red-500 text-white p-2 rounded"
                    onClick={() => {
                        localStorage.removeItem('token');
                        setTimeout(() => {
                            Navigate('/login');
                        }, 1500);
                    }}
                >
                    Logout
                </button>
                <RedirectButton/>
                <button onClick={openResourcesTab} className="bg-purple-600 text-white p-2 rounded font-serif m-2">
                View Shared Resources
                </button>
                
               
            </div>
            <div className="w-3/4 p-5 h-screen text-white">
                <h2 className="text-2xl font-bold mb-4">Task List</h2>
                <ul className="list-disc text-white pl-5">
                    {tasks.length > 0 ? (
                        tasks.map((task) => (
                            <li key={task._id} className="flex justify-between items-center mb-2">
                                <span>
                                    {task.title} - {task.points} points
                                </span>
                                <button
                                    onClick={() => completeTask(task._id)}
                                    className="bg-green-500 text-white p-1 rounded"
                                >
                                    Complete
                                </button>
                            </li>
                        ))
                    ) : (
                        <li>No tasks available.</li>
                    )}
                </ul>
                
                <h2 className="text-2xl font-bold mt-8 mb-4">Completed Tasks</h2>
                <ul className="list-disc pl-5">
                    {completedTaskDetails.length > 0 ? (
                        completedTaskDetails.map((task) => (
                            <li key={task._id} className="mb-2">{task.title}</li>
                        ))
                    ) : (
                        <li>No completed tasks.</li>
                    )}
                </ul>
                <h2 className="text-2xl font-bold mt-8 mb-4">Available Quizzes</h2>
        <QuizList  className="text-black flex flex-col"quizzes={quizzes} onTakeQuiz={handleTakeQuiz} />

        {selectedQuiz && (
          <TakeQuiz className="bg-purple-600 text-white p-2 rounded font-serif m-2" quiz={selectedQuiz} onQuizSubmit={handleQuizSubmit}  />
        )}
            </div>
            
        </div>
    );
};

export default UserDashboard;
