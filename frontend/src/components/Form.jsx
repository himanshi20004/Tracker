import { useState } from 'react';
import { toast } from 'react-toastify';
import api from '../utils/api';

const Form = ({ receiverId, setChats, socket }) => {
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const sendMessage = async (e) => {
    e.preventDefault();
    const trimmed = message.trim();
    if (!trimmed || !receiverId || sending) return;

    setSending(true);
    try {
      const response = await api.post(`/send/${receiverId}`, { content: trimmed });
      const savedMessage = response.data;

      if (socket && savedMessage?.socketReceipt) {
        socket.emit('sendMessage', { socketReceipt: savedMessage.socketReceipt });
      }

      setChats((prev) => {
        if (savedMessage._id && prev.some((m) => m._id === savedMessage._id)) {
          return prev;
        }
        return [...prev, savedMessage];
      });
      setMessage('');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error sending message');
    } finally {
      setSending(false);
    }
  };

  return (
    <form onSubmit={sendMessage} className="flex items-center gap-2">
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type your message..."
        maxLength={2000}
        className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
      />
      <button
        type="submit"
        disabled={!message.trim() || sending}
        className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-blue-500 text-white text-sm font-semibold rounded-xl hover:opacity-90 transition disabled:opacity-50"
      >
        {sending ? 'Sending...' : 'Send'}
      </button>
    </form>
  );
};

export default Form;
