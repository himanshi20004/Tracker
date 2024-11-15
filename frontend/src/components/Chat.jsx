import React, { useEffect, useState } from 'react';
import Sidebar from './Sidebar';
import Form from './Form';

const Chat = ({ socket }) => {
  const [chatInitiated, setChatInitiated] = useState(false);
  const [chats, setChats] = useState([]);
  const [receiverId, setReceiverId] = useState();
  const userId = window.localStorage.getItem("userId");
  
  useEffect(() => {
    socket.on('newMessage', (message) => {
      setChats((state) => [...state, { sender: message.sender, content: message.content }]);
    });
  }, [socket]);

  return (
    <div className="flex min-h-screen bg-gradient-to-t from-black to-[#3b0a45] font-serif font-bold">
      {/* Sidebar Section */}
      <div className="w-80 bg-gradient-to-t from-black to-[#a96bb6] shadow-lg p-4 py-7">
        <Sidebar
          setChatInitiated={setChatInitiated}
          setChats={setChats}
          socket={socket}
          setReceiverId={setReceiverId}
        />
      </div>

      {/* Chat Section */}
      <div className="flex-1 bg-gradient-to-t from-black to-[#3b0a45] flex flex-col">
        {chatInitiated ? (
          <div className="flex-1 flex flex-col p-4">
            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto mb-4">
              {chats && chats.map((chat, index) => (
                <div
                  key={index}
                  className={`flex px-4 py-2 ${chat.sender === userId ? "justify-end" : "justify-start"}`}
                >
                  <div className={`p-2 rounded-lg ${chat.sender === userId ? "bg-purple-600 text-white" : "bg-gray-200 text-black"}`}>
                    {chat.content}
                  </div>
                </div>
              ))}
            </div>
            
            {/* Chat Input Form */}
            <Form
              receiverId={receiverId}
              setChats={setChats}
              chats={chats}
            />
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <h2 className="text-xl text-gray-500">Start a Chat</h2>
          </div>
        )}
      </div>
    </div>
  );
}

export default Chat;
