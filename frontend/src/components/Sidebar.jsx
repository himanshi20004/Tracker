import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import api from '../utils/api';

const Sidebar = ({ setChatInitiated, setChats, setReceiverId, setReceiverName, onlineUserIds = [] }) => {
  const [users, setUsers] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await api.get('/users');
        setUsers(Array.isArray(res.data) ? res.data : []);
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to fetch contacts');
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const startChat = async (user) => {
    try {
      const response = await api.get(`/read/${user._id}`);
      const msgs = Array.isArray(response.data)
        ? response.data
        : response.data?.messages || [];

      setChats(msgs);
      setChatInitiated(true);
      setReceiverId(user._id);
      setReceiverName(user.username);
      setActiveId(user._id);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error loading conversation');
    }
  };

  const getInitials = (name) => (name ? name.slice(0, 2).toUpperCase() : '??');

  const filtered = users.filter((u) =>
    u.username?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full">
      <div className="px-1 pb-3">
        <input
          type="text"
          placeholder="Search contacts..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-purple-400 transition"
        />
      </div>

      <div className="flex-1 overflow-y-auto space-y-0.5">
        {loading ? (
          <p className="text-center text-xs text-gray-400 py-8">Loading contacts...</p>
        ) : filtered.length > 0 ? (
          filtered.map((user) => {
            const isActive = activeId === user._id;
            const isOnline = onlineUserIds.includes(user._id);
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
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : 'bg-gradient-to-br from-purple-100 to-blue-100 text-purple-700'
                  }`}
                >
                  {getInitials(user.username)}
                </div>

                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold truncate ${isActive ? 'text-white' : 'text-gray-800'}`}>
                    {user.username}
                  </p>
                  <p className={`text-xs truncate ${isActive ? 'text-white/70' : 'text-gray-400'}`}>
                    {isOnline ? 'Online' : 'Tap to chat'}
                  </p>
                </div>

                {isOnline && !isActive && (
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
