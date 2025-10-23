import React from 'react';
import { ChatMessage as ChatMessageType } from '../types';
import Icon from './Icon';
import MarkdownWithMath from './MarkdownWithMath';

const ChatMessage: React.FC<{ message: ChatMessageType }> = ({ message }) => {
  const isUser = message.sender === 'user';

  return (
    <div className={`flex items-start gap-3 my-4 ${isUser ? 'justify-end' : 'justify-start'} min-w-0`}>
      {!isUser && (
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center text-white">
          <Icon name="bot" className="w-6 h-6" />
        </div>
      )}
      <div
        className={`min-w-0 max-w-[min(85%,48rem)] p-4 rounded-2xl shadow-md break-words whitespace-pre-wrap ${
          isUser
            ? 'bg-blue-500 text-white rounded-br-none'
            : 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-none'
        }`}
        style={{ overflowAnchor: 'none' }}
      >
        {message.imageUrl && (
            <figure>
                <img 
                    src={message.imageUrl} 
                    alt="Illustration" 
                    className="rounded-lg mb-2 max-w-full h-auto block"
                    style={{ aspectRatio: '16 / 9', background: 'transparent' }}
                />
                {message.imagePrompt && (
                    <figcaption className="text-xs text-center italic opacity-70 mt-1">
                        {message.imagePrompt}
                    </figcaption>
                )}
            </figure>
        )}
        {message.text && (
             <div className="message-content text-base leading-relaxed">
                <MarkdownWithMath source={message.text} />
             </div>
        )}
      </div>
      {isUser && (
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white">
          <Icon name="user" className="w-6 h-6" />
        </div>
      )}
    </div>
  );
};

export default ChatMessage;