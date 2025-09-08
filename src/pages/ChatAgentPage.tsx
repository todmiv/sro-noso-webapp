import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/ToastProvider';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

let supabase: SupabaseClient | undefined;
try {
  supabase = createClient(supabaseUrl, supabaseKey);
} catch (error) {
  console.warn('Supabase client initialization failed');
  supabase = undefined;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  sources?: Array<{
    id: string;
    title: string;
    url: string;
  }>;
}

const ChatAgentPage = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showHistoryMode, setShowHistoryMode] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const resetChat = () => {
    setMessages([]);
    setInputValue('');
    setShowHistoryMode(false);
  };

  const showChatHistory = () => {
    setShowHistoryMode(true);
  };

  const hideChatHistory = () => {
    setShowHistoryMode(false);
  };

  const sendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Получить JWT для авторизации
      let jwt: string | undefined;
      try {
        if (supabase?.auth) {
          const { data: { session } } = await supabase.auth.getSession();
          jwt = session?.access_token;
        }
      } catch (error) {
        console.warn('No Supabase session:', error);
      }

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://xibewgvrooyvbragtwxm.supabase.co';
      const apiUrl = `${supabaseUrl}/functions/v1/deepseek-agent`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': jwt ? `Bearer ${jwt}` : 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0',
        },
        body: JSON.stringify({ question: inputValue })
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.success ? data.result.answer : 'Извините, произошла ошибка при обработке запроса.',
        timestamp: new Date(),
        sources: data.success ? data.result.sources.map((source: any) => ({
          id: source.id,
          title: source.title,
          url: source.url
        })) : undefined
      };

      setMessages(prev => [...prev, assistantMessage]);

      if (!data.success) {
        showToast('error', 'Ошибка', data.error || 'Не удалось получить ответ');
      }

    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Произошла ошибка при подключении к ИИ-агенту. Попробуйте позже.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
      showToast('error', 'Ошибка соединения', 'Не удалось подключиться к ИИ-агенту');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="mx-auto bg-blue-100 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-4">
            <svg className="icon-xl text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-4l-4 4-4-4z"/>
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">ИИ-Консультант по документам СРО</h1>
          <p className="text-gray-600">Задайте вопрос по документам саморегулируемой организации</p>
        </div>

        {/* Welcome message */}
        {messages.length === 0 && (
          <div className="text-center py-12">
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-8 mb-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Как я могу помочь?</h2>
              <p className="text-gray-700 mb-6">
                Я могу ответить на вопросы по уставу СРО, требованиям к членству, квалификационным стандартам,
                положению о страховании, компенсационных фондах и многим другим документам.
              </p>
              <div className="flex flex-wrap gap-3 justify-center">
                <button
                  onClick={() => { setInputValue('Какие требования к членству в СРО?'); sendMessage(); }}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 text-sm font-medium border border-blue-500"
                >
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    Требования к членству
                  </div>
                </button>
                <button
                  onClick={() => { setInputValue('Что такое компенсационный фонд?'); sendMessage(); }}
                  className="px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 text-sm font-medium border border-green-500"
                >
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"/>
                    </svg>
                    Компенсационный фонд
                  </div>
                </button>
                <button
                  onClick={() => { setInputValue('Какие квалификационные требования к руководителю?'); sendMessage(); }}
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 text-sm font-medium border border-purple-500"
                >
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                    </svg>
                    Квалификация руководителя
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Chat container */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* History navigation */}
          {messages.length > 0 && (
            <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={showChatHistory}
                    className="text-sm text-gray-600 hover:text-blue-600 flex items-center"
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    История чата ({messages.length} сообщений)
                  </button>

                  {showHistoryMode && (
                    <button
                      onClick={hideChatHistory}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      Скрыть историю
                    </button>
                  )}
                </div>

                <span className="text-sm text-gray-500">
                  Сессия активна
                </span>
              </div>

              {showHistoryMode && (
                <div className="mt-2 flex space-x-2 text-sm">
                  <button
                    className="text-blue-600 hover:text-blue-800 underline"
                    onClick={() => document.querySelector('.h-96')?.scrollTo({ top: 0, behavior: 'smooth' })}
                  >
                    ↑ К началу
                  </button>
                  <button
                    className="text-blue-600 hover:text-blue-800 underline"
                    onClick={() => scrollToBottom()}
                  >
                    ↓ К концу
                  </button>
                </div>
              )}
            </div>
          )}
          {/* Messages */}
          <div className="h-96 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    message.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{message.content}</p>
                  {message.sources && message.sources.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <p className="text-xs text-gray-500 mb-2">Источники:</p>
                      <div className="space-y-1">
                        {message.sources.slice(0, 3).map((source) => (
                          <div key={source.id}>
                            <a
                              href={source.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-blue-600 hover:text-blue-800 underline block truncate"
                              title={source.title}
                            >
                              {source.title}
                            </a>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  <p className={`text-xs ${message.role === 'user' ? 'text-blue-100' : 'text-gray-500'} mt-2`}>
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-gray-200 p-4">
            <div className="flex space-x-4">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Задайте вопрос по документам СРО..."
                disabled={isLoading}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
              />
              <button
                onClick={sendMessage}
                disabled={!inputValue.trim() || isLoading}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <>
                    <svg className="icon-standard mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
                    </svg>
                    Отправить
                  </>
                )}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              ИИ отвечает на основе официальных документов СРО НОСО
            </p>
          </div>
        </div>

        {/* Back button - removed by request */}
      </div>
    </div>
  );
};

export default ChatAgentPage;
