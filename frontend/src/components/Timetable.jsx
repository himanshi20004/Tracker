import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import axios from 'axios';
import 'react-calendar/dist/Calendar.css';

const Timetable = () => {
    const [date, setDate] = useState(new Date());
    const [eventDetails, setEventDetails] = useState('');
    const [userTimetable, setUserTimetable] = useState({});
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [isEditing, setIsEditing] = useState(false);

    const getAuthToken = () => localStorage.getItem('token');
    const getUserData = () => JSON.parse(localStorage.getItem('user')) || {};
    const getFormattedDate = (d) => d.toLocaleDateString('en-CA');

    useEffect(() => {
        fetchTimetable();
    }, []);

    const fetchTimetable = async () => {
        try {
            const token = getAuthToken();
            const user = getUserData();
            if (!user.id) return;
            const response = await axios.get(`http://localhost:5000/api/v1/timetable/${user.id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setUserTimetable(response.data || {});
        } catch (error) {
            console.error('Error fetching timetable:', error);
        }
    };

    const handleAddEvent = async () => {
        if (!eventDetails.trim()) return;
        const formattedDate = getFormattedDate(date);
        const user = getUserData();
        try {
            const token = getAuthToken();
            await axios.post(`http://localhost:5000/api/v1/timetable/${user.id}`, {
                date: formattedDate,
                detail: eventDetails
            }, {
                headers: { Authorization: `Bearer ${token}` },
            });
            fetchTimetable();
            setEventDetails('');
        } catch (error) {
            console.error('Error saving event:', error);
        }
    };

    const handleEditEvent = async () => {
        if (!selectedEvent) return;
        const user = getUserData();
        try {
            const token = getAuthToken();
            await axios.put(`http://localhost:5000/api/v1/timetable/${user.id}`, {
                date: selectedEvent.date,
                index: selectedEvent.index,
                detail: eventDetails
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchTimetable();
            resetUI();
        } catch (error) {
            console.error('Error updating event:', error);
        }
    };

    const handleDeleteEvent = async (indexToDelete, eventDate) => {
        const user = getUserData();
        try {
            const token = getAuthToken();
            await axios.delete(`http://localhost:5000/api/v1/timetable/${user.id}/${indexToDelete}?date=${eventDate}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchTimetable();
            resetUI();
        } catch (error) {
            console.error('Error deleting event:', error);
        }
    };

    const resetUI = () => {
        setEventDetails('');
        setIsEditing(false);
        setSelectedEvent(null);
    };

    const currentFormattedDate = getFormattedDate(date);
    const tasksForSelectedDay = userTimetable[currentFormattedDate] || [];

    return (
        <div className="timetable-container flex flex-col items-center bg-[#f8f9fa] min-h-screen p-6 font-sans">
            {/* Header matches Dashboard Style */}
            <div className="w-full max-w-5xl flex items-center mb-8">
                <h2 className="text-2xl font-bold text-[#333]">📅 Timetable</h2>
                <span className="ml-4 text-gray-400 text-sm">Organize your study schedule</span>
            </div>
            
            <div className="flex flex-col lg:flex-row gap-8 w-full max-w-5xl">
                
                {/* Left Side: Calendar Card */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex-1">
                    <Calendar
                        onChange={setDate}
                        value={date}
                        className="border-none w-full"
                        tileContent={({ date: tileDate, view }) => {
                            if (view !== 'month') return null;
                            const formatted = getFormattedDate(tileDate);
                            const dayEvents = userTimetable[formatted];
                            if (!dayEvents || dayEvents.length === 0) return null;
                            return (
                                <div className="flex justify-center gap-1 mt-1">
                                    <div className="w-2 h-2 bg-[#8a4fff] rounded-full" />
                                </div>
                            );
                        }}
                    />
                </div>

                {/* Right Side: Task Management */}
                <div className="flex-1 flex flex-col gap-6">
                    
                    {/* Tasks List Card */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 min-h-[300px]">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold text-gray-700">Tasks for {currentFormattedDate}</h3>
                            <span className="bg-purple-100 text-purple-600 px-3 py-1 rounded-full text-xs font-bold">
                                {tasksForSelectedDay.length} Plans
                            </span>
                        </div>
                        
                        <div className="space-y-3">
                            {tasksForSelectedDay.length > 0 ? (
                                tasksForSelectedDay.map((task, idx) => (
                                    <div key={idx} className="flex justify-between items-center bg-gray-50 p-4 rounded-xl border border-gray-100 hover:border-purple-200 transition-all">
                                        <span className="text-gray-700 font-medium">{task}</span>
                                        <div className="flex gap-4">
                                            <button 
                                                onClick={() => {
                                                    setIsEditing(true);
                                                    setEventDetails(task);
                                                    setSelectedEvent({ detail: task, index: idx, date: currentFormattedDate });
                                                }}
                                                className="text-blue-500 hover:text-blue-700 text-sm font-semibold"
                                            >
                                                Edit
                                            </button>
                                            <button 
                                                onClick={() => handleDeleteEvent(idx, currentFormattedDate)}
                                                className="text-red-400 hover:text-red-600 text-sm font-semibold"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="flex flex-col items-center justify-center py-10">
                                    <p className="text-gray-400 italic text-sm">No tasks added for this day.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Input Area Card */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <h4 className="text-sm font-bold text-gray-500 mb-3 uppercase tracking-wider">
                            {isEditing ? 'Update Plan' : 'Quick Add'}
                        </h4>
                        <div className="flex flex-col gap-3">
                            <input
                                type="text"
                                value={eventDetails}
                                onChange={(e) => setEventDetails(e.target.value)}
                                placeholder="What are you studying today?"
                                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-700 outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400 transition-all"
                            />
                            <div className="flex gap-2">
                                <button
                                    onClick={isEditing ? handleEditEvent : handleAddEvent}
                                    className={`flex-grow py-3 rounded-xl font-bold text-white transition-all shadow-md ${isEditing ? 'bg-blue-500 hover:bg-blue-600' : 'bg-[#8a4fff] hover:bg-[#7a3fee]'}`}
                                >
                                    {isEditing ? 'Save Changes' : 'Add to Schedule'}
                                </button>
                                {isEditing && (
                                    <button onClick={resetUI} className="px-6 py-3 bg-gray-100 text-gray-500 font-bold rounded-xl hover:bg-gray-200">
                                        Cancel
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default Timetable;