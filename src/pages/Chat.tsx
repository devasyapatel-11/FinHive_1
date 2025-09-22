import React, { useState, useEffect, useRef } from 'react';
import PageTemplate from './PageTemplate';
import { useAuth } from '@/hooks/useAuth';
import { Send, Plus, Bot, Sparkles, MessageSquare, TrendingUp, Target, Wallet } from 'lucide-react';
import { generateBotResponse, getSuggestedQuestions, ChatMessage } from '@/services/chatbotService';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const Chat = () => {
  const { user } = useAuth();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize with greeting message
  useEffect(() => {
    if (user) {
      const greetingMessage: ChatMessage = {
        id: 'greeting',
        text: `Hello ${user.email?.split('@')[0] || 'there'}! 👋\n\nI'm your FinHive AI assistant. I can help you understand your finances better by analyzing your transactions, budgets, and spending patterns.\n\nTry asking me questions like:\n• "What's my balance?"\n• "How much did I spend this month?"\n• "Show me my budget status"`,
        sender: 'bot',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: 'text'
      };
      setMessages([greetingMessage]);
      loadSuggestedQuestions();
    }
  }, [user]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadSuggestedQuestions = async () => {
    if (user) {
      try {
        const questions = await getSuggestedQuestions(user.id);
        setSuggestedQuestions(questions);
      } catch (error) {
        console.error('Error loading suggested questions:', error);
      }
    }
  };

  const addMessage = (message: ChatMessage) => {
    setMessages(prev => [...prev, message]);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !user) return;

    const userMessage: ChatMessage = {
      id: `user_${Date.now()}`,
      text: message.trim(),
      sender: 'user',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    addMessage(userMessage);
    const currentMessage = message;
    setMessage('');
    setIsTyping(true);

    try {
      // Generate bot response
      const botResponse = await generateBotResponse(user.id, currentMessage);
      setTimeout(() => {
        addMessage(botResponse);
        setIsTyping(false);
        loadSuggestedQuestions(); // Refresh suggestions
      }, 1000); // Simulate typing delay
    } catch (error) {
      console.error('Error getting bot response:', error);
      const errorMessage: ChatMessage = {
        id: `error_${Date.now()}`,
        text: "Sorry, I'm having trouble connecting right now. Please try again.",
        sender: 'bot',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: 'text'
      };
      setTimeout(() => {
        addMessage(errorMessage);
        setIsTyping(false);
      }, 500);
    }
  };

  const handleSuggestedQuestion = (question: string) => {
    setMessage(question);
  };

  const getMessageIcon = (type?: string) => {
    switch (type) {
      case 'insight':
        return <TrendingUp className="h-4 w-4 text-blue-500" />;
      case 'warning':
        return <Target className="h-4 w-4 text-orange-500" />;
      case 'suggestion':
        return <Sparkles className="h-4 w-4 text-purple-500" />;
      default:
        return <MessageSquare className="h-4 w-4 text-gray-500" />;
    }
  };

  const getMessageBadge = (type?: string) => {
    switch (type) {
      case 'insight':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800">💡 Insight</Badge>;
      case 'warning':
        return <Badge variant="secondary" className="bg-orange-100 text-orange-800">⚠️ Warning</Badge>;
      case 'suggestion':
        return <Badge variant="secondary" className="bg-purple-100 text-purple-800">💡 Suggestion</Badge>;
      default:
        return null;
    }
  };

  return (
    <PageTemplate title="AI Assistant">
      <div className="bg-white rounded-lg border border-finhive-border h-[calc(100vh-12rem)]">
        <div className="flex h-full">
          {/* Suggested questions sidebar */}
          <div className="w-80 border-r border-finhive-border h-full flex flex-col bg-gray-50">
            <div className="p-4 border-b border-finhive-border bg-white">
              <div className="flex items-center gap-2">
                <Bot className="w-5 h-5 text-finhive-primary" />
                <h3 className="font-medium text-finhive-text">Suggested Questions</h3>
              </div>
              <p className="text-xs text-finhive-muted mt-1">
                Click on any question to ask me
              </p>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {suggestedQuestions.map((question, index) => (
                <Card
                  key={index}
                  className="cursor-pointer hover:shadow-md transition-shadow border-l-4 border-l-finhive-primary"
                  onClick={() => handleSuggestedQuestion(question)}
                >
                  <CardContent className="p-3">
                    <p className="text-sm text-finhive-text">{question}</p>
                  </CardContent>
                </Card>
              ))}

              {suggestedQuestions.length === 0 && (
                <div className="text-center py-8">
                  <Sparkles className="w-8 h-8 text-finhive-muted mx-auto mb-2" />
                  <p className="text-sm text-finhive-muted">
                    Add some financial data to see personalized suggestions
                  </p>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-finhive-border bg-white">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs text-finhive-muted">
                  <Wallet className="w-4 h-4" />
                  <span>Connected to your FinHive account</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => setMessages([])}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  New Conversation
                </Button>
              </div>
            </div>
          </div>

          {/* Chat content */}
          <div className="flex-1 flex flex-col h-full">
            {/* Chat header */}
            <div className="p-4 border-b border-finhive-border bg-white flex items-center">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-finhive-primary to-finhive-accent flex items-center justify-center text-white font-medium mr-3">
                <Bot size={20} />
              </div>
              <div>
                <div className="font-medium text-finhive-text">FinHive AI Assistant</div>
                <div className="text-xs text-finhive-muted flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${isTyping ? 'bg-green-500 animate-pulse' : 'bg-green-500'}`}></div>
                  {isTyping ? 'Typing...' : 'Online'}
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.sender === 'bot' ? 'justify-start' : 'justify-end'}`}>
                  <div className={`max-w-[85%] ${msg.sender === 'bot' ? 'mr-auto' : 'ml-auto'}`}>
                    {msg.sender === 'bot' && getMessageBadge(msg.type) && (
                      <div className="mb-1 ml-1">
                        {getMessageBadge(msg.type)}
                      </div>
                    )}

                    <div className={`rounded-2xl px-4 py-3 shadow-sm ${
                      msg.sender === 'bot'
                        ? 'bg-white border border-gray-200 text-finhive-text'
                        : 'bg-finhive-primary text-white'
                    }`}>
                      <div className="text-sm whitespace-pre-line">{msg.text}</div>
                      <div className={`text-xs mt-2 flex items-center gap-1 ${
                        msg.sender === 'bot' ? 'text-finhive-muted' : 'text-white/70'
                      }`}>
                        {msg.sender === 'bot' && getMessageIcon(msg.type)}
                        <span>{msg.time}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Typing indicator */}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3 shadow-sm">
                    <div className="flex items-center gap-1">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                      <span className="text-xs text-finhive-muted ml-2">FinHive is thinking...</span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Message input */}
            <div className="p-4 border-t border-finhive-border bg-white">
              <form onSubmit={handleSendMessage} className="flex items-end gap-3">
                <div className="flex-1">
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage(e);
                      }
                    }}
                    placeholder="Ask me about your finances..."
                    className="w-full px-4 py-3 rounded-xl border border-finhive-border focus:outline-none focus:ring-2 focus:ring-finhive-primary/50 resize-none max-h-32"
                    rows={1}
                    style={{ minHeight: '48px' }}
                  />
                  <div className="text-xs text-finhive-muted mt-1 px-1">
                    Press Enter to send, Shift+Enter for new line
                  </div>
                </div>
                <Button
                  type="submit"
                  size="lg"
                  className="px-6"
                  disabled={!message.trim() || isTyping}
                >
                  <Send size={18} />
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </PageTemplate>
  );
};

export default Chat;
