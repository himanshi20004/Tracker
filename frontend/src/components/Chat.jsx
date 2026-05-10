import React, { useEffect, useState, useRef } from 'react';
import Sidebar from './Sidebar';
import Form from './Form';

const Chat = ({ socket }) => {
  const [chatInitiated, setChatInitiated] = useState(false);
  const [chats, setChats] = useState([]);
  const [receiverId, setReceiverId] = useState();
  const [receiverName, setReceiverName] = useState('');
  const messagesEndRef = useRef(null);
  const userId = window.localStorage.getItem("userId");

  useEffect(() => {
    socket.on('newMessage', (message) => {
      setChats((state) => [...state, { sender: message.sender, content: message.content }]);
    });
  }, [socket]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chats]);

  const getInitials = (name) => name ? name.slice(0, 2).toUpperCase() : '??';

  return (
    <div className="flex h-screen bg-gray-50 font-sans overflow-hidden">

      {/* ═══ SIDEBAR ═══ */}
      <aside className="w-72 shrink-0 flex flex-col bg-white border-r border-gray-100 shadow-sm">

        {/* Header */}
        <div className="flex items-center gap-2.5 px-5 py-4 border-b border-gray-100">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-blue-500 flex items-center justify-center shadow">
            <div className="w-2 h-2 bg-white rounded-full" />
          </div>
          <span className="text-base font-bold text-gray-900">Messages</span>
        </div>

        {/* Contacts */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
          <Sidebar
            setChatInitiated={setChatInitiated}
            setChats={setChats}
            socket={socket}
            setReceiverId={setReceiverId}
            setReceiverName={setReceiverName}
          />
        </div>
      </aside>

      {/* ═══ MAIN CHAT AREA ═══ */}
      <main className="flex-1 flex flex-col bg-gray-50 overflow-hidden">

        {chatInitiated ? (
          <>
            {/* Chat Header */}
            <header className="flex items-center gap-3 px-6 py-4 bg-white border-b border-gray-100 shadow-sm shrink-0">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-600 to-blue-500 flex items-center justify-center text-white text-xs font-bold">
                {getInitials(receiverName)}
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">{receiverName || 'Chat'}</p>
                <p className="text-xs text-green-500 font-medium">Online</p>
              </div>
            </header>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-3">
              {chats.map((chat, index) => {
                const isMine = chat.sender === userId;
                return (
                  <div key={index} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                    {!isMine && (
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-400 to-blue-400 flex items-center justify-center text-white text-[10px] font-bold mr-2 mt-1 shrink-0">
                        {getInitials(receiverName)}
                      </div>
                    )}
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                        isMine
                          ? 'bg-gradient-to-r from-purple-600 to-blue-500 text-white rounded-br-sm'
                          : 'bg-white border border-gray-100 text-gray-800 rounded-bl-sm shadow-sm'
                      }`}
                    >
                      {chat.content}
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="px-6 py-4 bg-white border-t border-gray-100 shrink-0">
              <Form
                receiverId={receiverId}
                setChats={setChats}
                chats={chats}
              />
            </div>
          </>
        ) : (
          /* Empty State */
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