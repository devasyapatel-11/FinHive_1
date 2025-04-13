import React, { useState } from 'react';
import PageTemplate from './PageTemplate';
import { useAuth } from '@/hooks/useAuth';
import { Send, Plus, Bot } from 'lucide-react';

const Chat = () => {
  const { user } = useAuth();
  const [message, setMessage] = useState('');
  const [activeChat, setActiveChat] = useState<number | null>(1);
  
  // Sample chat data for demonstration
  const [chats] = useState([
    { id: 1, name: 'FinHive Assistant', avatar: <Bot size={20} />, unread: 3, isBot: true },
    { id: 2, name: 'Support Team', avatar: 'S', unread: 0, isBot: false },
  ]);
  
  const [messages] = useState({
    1: [
      { id: 1, text: 'Hello! How can I help you with your finances today?', sender: 'bot', time: '10:30 AM' },
      { id: 2, text: 'I can help you track expenses, set budgets, or analyze your spending patterns.', sender: 'bot', time: '10:31 AM' },
      { id: 3, text: 'Would you like me to give you a summary of your recent transactions?', sender: 'bot', time: '10:31 AM' },
    ],
    2: [
      { id: 1, text: 'Hi there! Welcome to FinHive. How can we assist you today?', sender: 'other', time: '11:45 AM' },
    ],
  });

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !activeChat) return;
    
    // In a real app, we would send this message to the backend
    // For demo purposes, we'll just show an alert
    alert(`Message sent: ${message}`);
    setMessage('');
  };

  return (
    <PageTemplate title="Chat">
      <div className="bg-white rounded-lg border border-finhive-border h-[calc(100vh-12rem)]">
        <div className="flex h-full">
          {/* Chat list sidebar */}
          <div className="w-64 border-r border-finhive-border h-full flex flex-col">
            <div className="p-4 border-b border-finhive-border">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search chats..."
                  className="w-full px-3 py-2 pl-8 text-sm rounded-md border border-finhive-border focus:outline-none focus:ring-2 focus:ring-finhive-primary/50"
                />
                <svg className="absolute left-2.5 top-2.5 w-4 h-4 text-finhive-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto">
              {chats.map((chat) => (
                <button
                  key={chat.id}
                  className={`w-full flex items-center p-3 hover:bg-gray-50 ${activeChat === chat.id ? 'bg-finhive-accent/10' : ''}`}
                  onClick={() => setActiveChat(chat.id)}
                >
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-finhive-accent/30 flex items-center justify-center text-finhive-primary font-medium mr-3">
                      {typeof chat.avatar === 'string' ? chat.avatar : chat.avatar}
                    </div>
                    {chat.unread > 0 && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-finhive-primary text-white text-xs flex items-center justify-center">
                        {chat.unread}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-medium">{chat.name}</div>
                    <div className="text-xs text-finhive-muted truncate">
                      {chat.isBot ? 'AI Assistant' : 'Customer Support'}
                    </div>
                  </div>
                </button>
              ))}
            </div>
            
            <div className="p-3 border-t border-finhive-border">
              <button className="w-full flex items-center justify-center gap-2 p-2 rounded-md border border-finhive-border hover:bg-gray-50 text-sm">
                <Plus size={16} />
                <span>New Chat</span>
              </button>
            </div>
          </div>
          
          {/* Chat content */}
          <div className="flex-1 flex flex-col h-full">
            {activeChat ? (
              <>
                {/* Chat header */}
                <div className="p-4 border-b border-finhive-border flex items-center">
                  <div className="w-10 h-10 rounded-full bg-finhive-accent/30 flex items-center justify-center text-finhive-primary font-medium mr-3">
                    {typeof chats.find(c => c.id === activeChat)?.avatar === 'string' 
                      ? chats.find(c => c.id === activeChat)?.avatar 
                      : chats.find(c => c.id === activeChat)?.avatar}
                  </div>
                  <div>
                    <div className="font-medium">{chats.find(c => c.id === activeChat)?.name}</div>
                    <div className="text-xs text-finhive-muted">
                      {chats.find(c => c.id === activeChat)?.isBot ? 'AI Assistant' : 'Customer Support'}
                    </div>
                  </div>
                </div>
                
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages[activeChat as keyof typeof messages]?.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.sender === 'bot' || msg.sender === 'other' ? 'justify-start' : 'justify-end'}`}>
                      <div className={`max-w-[80%] rounded-lg p-3 ${msg.sender === 'bot' || msg.sender === 'other' ? 'bg-gray-100' : 'bg-finhive-primary text-white'}`}>
                        <div className="text-sm">{msg.text}</div>
                        <div className={`text-xs mt-1 ${msg.sender === 'bot' || msg.sender === 'other' ? 'text-finhive-muted' : 'text-white/70'}`}>
                          {msg.time}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Message input */}
                <div className="p-4 border-t border-finhive-border">
                  <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Type your message..."
                      className="flex-1 px-4 py-2 rounded-md border border-finhive-border focus:outline-none focus:ring-2 focus:ring-finhive-primary/50"
                    />
                    <button
                      type="submit"
                      className="p-2 rounded-md bg-finhive-primary text-white hover:bg-finhive-accent transition-colors"
                      disabled={!message.trim()}
                    >
                      <Send size={20} />
                    </button>
                  </form>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-finhive-accent/30 flex items-center justify-center mx-auto mb-4">
                    <Bot className="text-finhive-primary" size={24} />
                  </div>
                  <h2 className="text-xl font-medium text-finhive-text mb-2">Select a chat</h2>
                  <p className="text-finhive-muted max-w-md mx-auto">
                    Choose a conversation from the sidebar or start a new chat.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </PageTemplate>
  );
};

export default Chat;
