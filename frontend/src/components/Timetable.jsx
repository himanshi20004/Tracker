import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import axios from 'axios';
import 'react-calendar/dist/Calendar.css';

const Timetable = () => {
    const [date, setDate] = useState(new Date());
    const [eventDetails, setEventDetails] = useState('');
    const [userTimetable, setUserTimetable] = useState({});
    const [selectedDateEvents, setSelectedDateEvents] = useState([]);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [isEditing, setIsEditing] = useState(false);

    const getAuthToken = () => localStorage.getItem('token');
    const getUserData = () => {
        const userData = JSON.parse(localStorage.getItem('user'));
        return userData || {};
    };

    useEffect(() => {
        async function fetchTimetable() {
            try {
                const token = getAuthToken();
                const user = getUserData();
                const response = await axios.get(`http://localhost:5000/api/v1/timetable/${user.id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                

                setUserTimetable(response.data);
            } catch (error) {
                console.error('Error fetching timetable:', error);
            }
        }
        fetchTimetable();
    }, []);

    useEffect(() => {
        const formattedDate = date.toISOString().split('T')[0];
        setSelectedDateEvents(userTimetable[formattedDate] || []);
    }, [date, userTimetable]);

    const handleAddEvent = async () => {
        const formattedDate = date.toISOString().split('T')[0];
        const newEvent = {
            date: formattedDate,
            detail: eventDetails,
            userId: getUserData().id,
            userRole: getUserData().role,
        };

        try {
            const token = getAuthToken();
            await axios.post(`http://localhost:5000/api/v1/timetable/${newEvent.userId}`, newEvent, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            // Update local state
            setUserTimetable((prev) => ({
                ...prev,
                [formattedDate]: [...(prev[formattedDate] || []), eventDetails],
            }));
            setEventDetails('');
            
        } catch (error) {
            console.error('Error saving event:', error);
            alert('Failed to add event. Please check your authentication and try again.');
        }
    };
    
    const handleEditEvent = async () => {
        try {
            const token = getAuthToken();
            const userId = getUserData().id;
            const formattedDate = date.toISOString().split('T')[0];
            await axios.put(`http://localhost:5000/api/v1/timetable/${userId}`, {
                id: selectedEvent.id, detail: eventDetails
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setUserTimetable((prev) => ({
                ...prev,
                [formattedDate]: prev[formattedDate].map(event => 
                    event.id === selectedEvent.id ? eventDetails : event)
            }));
            setEventDetails('');
            setIsEditing(false);
            setSelectedEvent(null);
        } catch (error) {
            console.error('Error updating event:', error);
        }
    };

    const handleDeleteEvent = async (eventId) => {
        try {
            const token = getAuthToken();
            const userId = getUserData().id;
            await axios.delete(`http://localhost:5000/api/v1/timetable/${userId}/${eventId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUserTimetable((prev) => ({
                ...prev,
                [formattedDate]: prev[formattedDate].filter(event => event.id !== eventId)
            }));
        } catch (error) {
            console.error('Error deleting event:', error);
        }
    };
   
    return (
        <div className="timetable-container flex flex-col items-center justify-center bg-gradient-to-t from-black to-[#3b0a45] h-screen font-serif">
        <h2 className="text-3xl text-white mb-4">User Timetable</h2>
        <div className="flex-grow flex flex-col items-center ">
            <Calendar
                onChange={setDate}
                value={date}
                className="calendar-size"
                tileContent={({ date }) => {
                    const formattedDate = date.toISOString().split('T')[0];
                    return (
                        <div className="event-tile">
                            {userTimetable[formattedDate] && userTimetable[formattedDate].map((event, index) => (
                                <div key={index} className="event  text-purple-900 font-serif font-bold "
                                onClick={() => { setSelectedEvent(event); setEventDetails(event.detail); setIsEditing(true); }}>
                                    {event}
                                </div>
                            ))}
                        </div>
                    );
                }}
            />
        </div>
        <div className="add-event-form w-3/4 px-4 py-2 fixed bottom-20 text-center">
            <input
                type="text"
                value={eventDetails}
                onChange={(e) => setEventDetails(e.target.value)}
                placeholder="Enter event details"
                className="px-3 py-2 w-3/4 rounded"
            />
            <button
                onClick={isEditing ? handleEditEvent : handleAddEvent}
                    className="ml-2 px-4 py-2 bg-purple-600 text-white rounded"
            >
                 {isEditing ? 'Edit Event' : 'Add Event'}
            </button>
            {isEditing && (
                    <button
                        onClick={() => handleDeleteEvent(selectedEvent.id)}
                        className="ml-2 px-4 py-2 bg-red-600 text-white rounded"
                    >
                        Delete Event
                    </button>
                )}
        </div>
    </div>
    
    );
};

export default Timetable;
