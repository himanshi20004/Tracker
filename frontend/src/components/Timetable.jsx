import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Calendar from 'react-calendar';
import { toast } from 'react-toastify';
import 'react-calendar/dist/Calendar.css';
import api, { getStoredUser } from '../utils/api';

const Timetable = ({ standalone = false }) => {
    const [date, setDate] = useState(new Date());
    const [eventDetails, setEventDetails] = useState('');
    const [userTimetable, setUserTimetable] = useState({});
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const navigate = useNavigate();

    const getFormattedDate = (d) => d.toLocaleDateString('en-CA');
    const storedUser = getStoredUser();
    const userId = storedUser?.id || localStorage.getItem('userId');

    const fetchTimetable = useCallback(async () => {
        if (!userId) {
            setLoading(false);
            return;
        }
        try {
            const response = await api.get(`/timetable/${userId}`);
            setUserTimetable(response.data || {});
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to load timetable.');
        } finally {
            setLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        fetchTimetable();
    }, [fetchTimetable]);

    const handleAddEvent = async (e) => {
        if (e) e.preventDefault();
        const trimmed = eventDetails.trim();
        if (!trimmed || !userId || saving) return;

        setSaving(true);
        const formattedDate = getFormattedDate(date);
        try {
            const res = await api.post(`/timetable/${userId}`, {
                date: formattedDate,
                detail: trimmed,
            });
            setUserTimetable(res.data?.timetable || {});
            setEventDetails('');
            toast.success('Plan added!');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to add event.');
        } finally {
            setSaving(false);
        }
    };

    const handleEditEvent = async (e) => {
        if (e) e.preventDefault();
        const trimmed = eventDetails.trim();
        if (!selectedEvent || !trimmed || !userId || saving) return;

        setSaving(true);
        try {
            const res = await api.put(`/timetable/${userId}`, {
                date: selectedEvent.date,
                index: selectedEvent.index,
                detail: trimmed,
            });
            setUserTimetable(res.data?.timetable || {});
            resetUI();
            toast.success('Plan updated!');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update event.');
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteEvent = async (indexToDelete, eventDate) => {
        if (!userId) return;
        try {
            const res = await api.delete(`/timetable/${userId}/${indexToDelete}?date=${eventDate}`);
            setUserTimetable(res.data?.timetable || {});
            resetUI();
            toast.success('Plan deleted.');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to delete event.');
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
        <div className={`timetable-container flex flex-col items-center ${standalone ? 'bg-[#f8f9fa] min-h-screen p-4 sm:p-6' : ''} font-sans`}>
            <div className="w-full max-w-5xl flex items-center justify-between mb-6">
                <div className="flex items-center">
                    <h2 className="text-xl sm:text-2xl font-bold text-[#333]">📅 Timetable</h2>
                    <span className="ml-4 text-gray-400 text-sm hidden sm:inline">Organize your study schedule</span>
                </div>
                {standalone && (
                    <button
                        onClick={() => navigate(-1)}
                        className="px-4 py-2 text-xs font-semibold text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50"
                    >
                        ← Back
                    </button>
                )}
            </div>

            <div className="flex flex-col lg:flex-row gap-8 w-full max-w-5xl">
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

                <div className="flex-1 flex flex-col gap-6">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 min-h-[280px]">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold text-gray-700">Plans for {currentFormattedDate}</h3>
                            <span className="bg-purple-100 text-purple-600 px-3 py-1 rounded-full text-xs font-bold">
                                {tasksForSelectedDay.length} Plans
                            </span>
                        </div>

                        {loading ? (
                            <p className="text-sm text-gray-400 py-8 text-center">Loading timetable...</p>
                        ) : (
                            <div className="space-y-3">
                                {tasksForSelectedDay.length > 0 ? (
                                    tasksForSelectedDay.map((task, idx) => (
                                        <div key={`${currentFormattedDate}-${idx}`} className="flex justify-between items-center bg-gray-50 p-4 rounded-xl border border-gray-100 hover:border-purple-200 transition-all gap-3">
                                            <span className="text-gray-700 font-medium break-words">{task}</span>
                                            <div className="flex gap-3 shrink-0">
                                                <button
                                                    type="button"
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
                                                    type="button"
                                                    onClick={() => handleDeleteEvent(idx, currentFormattedDate)}
                                                    className="text-red-500 hover:text-red-700 text-sm font-semibold"
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
                        )}
                    </div>

                    <form onSubmit={isEditing ? handleEditEvent : handleAddEvent} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <h4 className="text-sm font-bold text-gray-500 mb-3 uppercase tracking-wider">
                            {isEditing ? 'Update Plan' : 'Quick Add'}
                        </h4>
                        <div className="flex flex-col gap-3">
                            <input
                                type="text"
                                value={eventDetails}
                                onChange={(e) => setEventDetails(e.target.value)}
                                placeholder="What are you studying today?"
                                maxLength={300}
                                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-700 outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400 transition-all"
                            />
                            <div className="flex gap-2">
                                <button
                                    type="submit"
                                    disabled={saving || !eventDetails.trim()}
                                    className={`flex-grow py-3 rounded-xl font-bold text-white transition-all shadow-md disabled:opacity-50 ${isEditing ? 'bg-blue-500 hover:bg-blue-600' : 'bg-[#8a4fff] hover:bg-[#7a3fee]'}`}
                                >
                                    {saving ? 'Saving...' : isEditing ? 'Save Changes' : 'Add to Schedule'}
                                </button>
                                {isEditing && (
                                    <button
                                        type="button"
                                        onClick={resetUI}
                                        className="px-6 py-3 bg-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-200"
                                    >
                                        Cancel
                                    </button>
                                )}
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Timetable;
