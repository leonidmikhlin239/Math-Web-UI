import React, { useRef, useEffect } from 'react';
import { ChatMessage as ChatMessageType } from '../types';
import ChatMessage from './ChatMessage';

interface ChatHistoryProps {
  messages: ChatMessageType[];
  loading: boolean;
}

const ChatHistory: React.FC<ChatHistoryProps> = ({ messages, loading }) => {
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (scrollRef.current) {
      requestAnimationFrame(() => {
        const el = scrollRef.current!;
        el.scrollTop = el.scrollHeight;
      });
    }
  }, [messages, loading]);

  return (
    <div className="w-4/5 flex-1 min-h-0 flex flex-col bg-white/70 dark:bg-gray-800/70 backdrop-blur-md rounded-2xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-700">
      <div
        ref={scrollRef}
        className="flex-1 min-h-0 p-6 overflow-y-auto custom-scrollbar"
        style={{ overflowAnchor: 'none' }}
      >
        {messages.filter(msg => !msg.hidden).map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}
        {loading && messages[messages.length - 1]?.sender === 'user' && (
          <ChatMessage key="loading" message={{ id: 'loading', text: "Думаю...", sender: 'bot' }} />
        )}
      </div>
    </div>
  );
};

export default ChatHistory;