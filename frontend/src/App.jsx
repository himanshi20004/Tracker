// App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LoginPage from './pages/Loginpage';
import Registration from './pages/Register';
import HomePage from './pages/Homepage';
import AdminDashboard from './components/AdminDashboard';
import UserDashboard from './components/UserDashboard';
import Leaderboard from './components/Leaderboard';
import Timetable from './components/Timetable';
import ResourcesPage from './components/resourcepage';
import ResourceUpload from './components/ResourceUpload';
import CreateQuizForm from './components/Quizcreation';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Store from './components/Store';
import ChatUI from './components/Chat';
import io from 'socket.io-client'

const socket=io.connect('http://localhost:8000')  //connecting with socket.io 

const App = () => {
  return (
    <Router>
      <ToastContainer /> 
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<Registration />} />
        <Route path="/adminDashboard" element={<AdminDashboard />} />
        <Route path="/userDashboard" element={<UserDashboard />} /> 
        <Route path="/leaderboard" element={<Leaderboard/>} />
        <Route path='/Timetable' element={<Timetable/>}/>
        <Route path="/resources" element={<ResourcesPage/>} />
        <Route path="/upload" element={<ResourceUpload/>}/>
        <Route path="/admin/create-quiz" element={<CreateQuizForm />} /> 
        <Route path="/store" element={<Store/>} />
        <Route path="/Chat" element={<ChatUI socket={socket}/>}/>
        
        
      </Routes>
    </Router>
  );
};

export default App;
