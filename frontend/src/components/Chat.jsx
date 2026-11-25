import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Form from './Form';
import { getSocket } from '../utils/socket';
import { getStoredUser } from '../utils/api';

const Chat = () => {
  const [chatInitiated, setChatInitiated] = useState(false);
  const [chats, setChats] = useState([]);
  const [receiverId, setReceiverId] = useState(null);
  const [receiverName, setReceiverName] = useState('');
  const [socketStatus, setSocketStatus] = useState('connecting');
  const [onlineUserIds, setOnlineUserIds] = useState([]);
  const [socket, setSocket] = useState(null);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  const storedUser = getStoredUser();
  const userId = storedUser?.id || window.localStorage.getItem('userId');
  const dashboardPath = storedUser?.role === 'admin' ? '/adminDashboard' : '/userDashboard';

  useEffect(() => {
    const activeSocket = getSocket();
    if (!activeSocket) return;
    setSocket(activeSocket);

    const handleConnect = () => setSocketStatus('connected');
    const handleDisconnect = () => setSocketStatus('disconnected');
    const handleReconnecting = () => setSocketStatus('reconnecting');
    const handleOnlineUsers = (ids) => setOnlineUserIds(Array.isArray(ids) ? ids : []);

    if (activeSocket.connected) {
      setSocketStatus('connected');
    }

    activeSocket.on('connect', handleConnect);
    activeSocket.on('disconnect', handleDisconnect);
    activeSocket.io.on('reconnect_attempt', handleReconnecting);
    activeSocket.on('onlineUsers', handleOnlineUsers);

    return () => {
      activeSocket.off('connect', handleConnect);
      activeSocket.off('disconnect', handleDisconnect);
      activeSocket.io.off('reconnect_attempt', handleReconnecting);
      activeSocket.off('onlineUsers', handleOnlineUsers);
    };
  }, []);

  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (message) => {
      if (!message || !receiverId) return;

      const isRelevant =
        (message.sender === receiverId && message.receiverId === userId) ||
        (message.sender === userId && message.receiverId === receiverId);

      if (!isRelevant) return;

      setChats((prev) => {
        if (message._id && prev.some((m) => m._id === message._id)) {
          return prev;
        }
        return [...prev, message];
      });
    };

    socket.on('newMessage', handleNewMessage);
    return () => {
      socket.off('newMessage', handleNewMessage);
    };
  }, [socket, receiverId, userId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chats]);

  const getInitials = (name) => (name ? name.slice(0, 2).toUpperCase() : '??');
  const isReceiverOnline = receiverId ? onlineUserIds.includes(receiverId) : false;

  return (
    <div className="flex h-screen bg-gray-50 font-sans overflow-hidden">
      {/* ═══ SIDEBAR ═══ */}
      <aside className={`${chatInitiated ? 'hidden md:flex' : 'flex'} w-full md:w-72 shrink-0 flex-col bg-white border-r border-gray-100 shadow-sm`}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-blue-500 flex items-center justify-center shadow">
              <div className="w-2 h-2 bg-white rounded-full" />
            </div>
            <span className="text-base font-bold text-gray-900">Messages</span>
          </div>
          <button
            onClick={() => navigate(dashboardPath)}
            className="text-xs font-medium text-gray-500 hover:text-gray-800 px-2.5 py-1 rounded-lg border border-gray-200"
          >
            ← Dashboard
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
          <Sidebar
            setChatInitiated={setChatInitiated}
            setChats={setChats}
            setReceiverId={setReceiverId}
            setReceiverName={setReceiverName}
            onlineUserIds={onlineUserIds}
          />
        </div>
      </aside>

      {/* ═══ MAIN CHAT AREA ═══ */}
      <main className={`${chatInitiated ? 'flex' : 'hidden md:flex'} flex-1 flex-col bg-gray-50 overflow-hidden`}>
        {chatInitiated ? (
          <>
            <header className="flex items-center justify-between px-4 sm:px-6 py-4 bg-white border-b border-gray-100 shadow-sm shrink-0">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setChatInitiated(false)}
                  className="md:hidden text-sm font-semibold text-gray-600 px-2 py-1 rounded-lg hover:bg-gray-100"
                >
                  ←
                </button>
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-600 to-blue-500 flex items-center justify-center text-white text-xs font-bold">
                  {getInitials(receiverName)}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{receiverName || 'Chat'}</p>
                  <p className={`text-xs font-medium ${isReceiverOnline ? 'text-green-500' : 'text-gray-400'}`}>
                    {isReceiverOnline ? 'Online' : 'Offline'}
                  </p>
                </div>
              </div>
              <span
                className={`text-[11px] font-medium px-2.5 py-1 rounded-full ${
                  socketStatus === 'connected'
                    ? 'bg-green-50 text-green-600'
                    : 'bg-amber-50 text-amber-600'
                }`}
              >
                {socketStatus === 'connected' ? 'Live' : socketStatus}
              </span>
            </header>

            <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-5 space-y-3">
              {chats.length === 0 ? (
                <p className="text-center text-xs text-gray-400 py-10">No messages yet. Say hello!</p>
              ) : (
                chats.map((chat, index) => {
                  const isMine = chat.sender === userId;
                  return (
                    <div key={chat._id || index} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                      {!isMine && (
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-400 to-blue-400 flex items-center justify-center text-white text-[10px] font-bold mr-2 mt-1 shrink-0">
                          {getInitials(receiverName)}
                        </div>
                      )}
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2.5 rounded-2xl text-sm leading-relaxed break-words ${
                          isMine
                            ? 'bg-gradient-to-r from-purple-600 to-blue-500 text-white rounded-br-sm'
                            : 'bg-white border border-gray-100 text-gray-800 rounded-bl-sm shadow-sm'
                        }`}
                      >
                        {chat.content}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="px-4 sm:px-6 py-4 bg-white border-t border-gray-100 shrink-0">
              <Form
                receiverId={receiverId}
                setChats={setChats}
                socket={socket}
              />
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center px-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center mb-4">
              <span className="text-2xl">💬</span>
            </div>
            <h2 className="text-base font-semibold text-gray-900 mb-1">Start a conversation</h2>
            <p className="text-sm text-gray-400">Select a contact from the left to begin chatting</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Chat;
