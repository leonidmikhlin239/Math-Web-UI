import React, { useState } from 'react';
import Icon from './Icon';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  loading: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, loading }) => {
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input.trim()) return;
    onSendMessage(input);
    setInput('');
  };

  const handleTestPrompt = () => {
    const testPrompt = "Покажи задачу 1 из раздела '7 класс - Делимость и остатки', а потом покажи ее решение";
    onSendMessage(testPrompt);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  return (
    <div className="w-4/5 flex-shrink-0 bg-white/70 dark:bg-gray-800/70 backdrop-blur-md rounded-2xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-700">
      <div className="p-4">
        <div className="flex justify-center mb-3">
          <button
            onClick={handleTestPrompt}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-purple-600 bg-purple-100 dark:bg-purple-900 dark:text-purple-200 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-800 focus:outline-none focus:ring-2 focus:ring-purple-500 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Тестовый вопрос
          </button>
        </div>
        <div className="flex items-center space-x-4">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Задай вопрос по математике..."
            disabled={loading}
            className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500 transition duration-300 disabled:opacity-50"
          />
          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="w-12 h-12 flex items-center justify-center bg-purple-600 text-white rounded-full hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-transform duration-200 active:scale-90 disabled:bg-gray-400 disabled:dark:bg-gray-600 disabled:cursor-not-allowed"
          >
            <Icon name="send" className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInput;