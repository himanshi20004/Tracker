import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const Form = ({ receiverId, setChats, chats }) => {
  const [message, setMessage] = useState('');
  const userId = window.localStorage.getItem("userId");

  const sendMessage = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('You must be logged in');
        return;
      }

      const response = await axios.post('http://localhost:5000/api/v1/send/' + receiverId, { content: message }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setChats([...chats, { content: message, sender: userId }]);
      setMessage('');
    } catch (error) {
      toast.error('Error sending message');
    }
  };

  return (
    <form onSubmit={sendMessage} className="flex items-center p-2 ">
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type your message"
        className="flex-1 p-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-purple-600"
      />
      <button type="submit" className="bg-purple-600 text-white p-2 rounded font-serif m-2">Send</button>
    </form>
  );
};

export default Form;
