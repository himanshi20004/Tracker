import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const Sidebar = ({ setChatInitiated, setChats, socket, setReceiverId }) => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          toast.error('You must be logged in');
          return;
        }

        const response = await fetch('http://localhost:5000/api/v1/users', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          const text = await response.text();
          toast.error(`Failed to fetch users: ${text}`);
          return;
        }

        const data = await response.json();
        setUsers(data || []);  // Adjust based on the actual response structure
      } catch (error) {
        toast.error('Error fetching users');
      }
    };

    fetchUsers();
  }, []);

  const startChat = async (id) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('You must be logged in');
        return;
      }

      const response = await axios.get('http://localhost:5000/api/v1/read/' + id, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setChats(Array.isArray(response.data) ? response.data : []);
      //setChats(response.data);
      socket.emit('join', id);
      setChatInitiated(true);
      setReceiverId(id);
      //toast.success('Chat initiated successfully');
    } catch (error) {
      console.log(error.response);
      toast.error('Error starting chat');
    }
  };

  return (
    <div className="space-y-4">
      

      <div className="space-y-2">
        {users.length > 0 ? (
          users.map((user) => (
            <div
              key={user._id}
              onClick={() => startChat(user._id)}
              className="flex items-center justify-between p-2 bg-gray-100 rounded-md hover:bg-gray-200 cursor-pointer"
            >
              <span className="text-sm font-medium">{user.username}</span>
            </div>
          ))
        ) : (
          <div className="text-center py-4 text-white">No Users</div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
