import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const Sidebar = ({ setChatInitiated, setChats, socket, setReceiverId, setReceiverName }) => {
  const [users, setUsers] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) { toast.error('You must be logged in'); return; }

        const response = await fetch('${import.meta.env.VITE_API_URL}/api/v1/users', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          toast.error('Failed to fetch users');
          return;
        }

        const data = await response.json();
        setUsers(data || []);
      } catch (error) {
        toast.error('Error fetching users');
      }
    };
    fetchUsers();
  }, []);

  const startChat = async (user) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) { toast.error('You must be logged in'); return; }

      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/v1/read/${user._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setChats(Array.isArray(response.data) ? response.data : []);
      socket.emit('join', user._id);
      setChatInitiated(true);
      setReceiverId(user._id);
      setReceiverName(user.username);   // ← wires up the name for chat header
      setActiveId(user._id);
    } catch (error) {
      toast.error('Error starting chat');
    }
  };

  const getInitials = (name) => name ? name.slice(0, 2).toUpperCase() : '??';

  const filtered = users.filter(u =>
    u.username.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full">

      {/* Search */}
      <div className="px-1 pb-3">
        <input
          type="text"
          placeholder="Search contacts..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-purple-400 transition"
        />
      </div>

      {/* Contact list */}
      <div className="flex-1 overflow-y-auto space-y-0.5">
        {filtered.length > 0 ? (
          filtered.map((user) => {
            const isActive = activeId === user._id;
            return (
              <div
                key={user._id}
                onClick={() => startChat(user)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-purple-600 to-blue-500 shadow-md'
                    : 'hover:bg-gray-50'
                }`}
              >
                {/* Avatar */}
                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                  isActive
                    ? 'bg-white/20 text-white'
                    : 'bg-gradient-to-br from-purple-100 to-blue-100 text-purple-700'
                }`}>
                  {getInitials(user.username)}
                </div>

                {/* Name */}
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold truncate ${
                    isActive ? 'text-white' : 'text-gray-800'
                  }`}>
                    {user.username}
                  </p>
                  <p className={`text-xs truncate ${
                    isActive ? 'text-white/70' : 'text-gray-400'
                  }`}>
                    Tap to chat
                  </p>
                </div>

                {/* Active indicator dot */}
                {!isActive && (
                  <div className="w-2 h-2 rounded-full bg-green-400 shrink-0" />
                )}
              </div>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <p className="text-2xl mb-2">🔍</p>
            <p className="text-sm text-gray-400">
              {search ? 'No contacts found' : 'No users available'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;