import React, { useState, useEffect } from 'react';
import { Chat } from '@google/genai';
import { startChat, generateIllustration } from './services/geminiService';
import { ChatMessage as ChatMessageType, ProblemLibrary, LoadingProgress } from './types';
import { loadProblemLibrary } from './services/texParser';
import ChatHistory from './components/ChatHistory';
import ChatInput from './components/ChatInput';
import LoadingModal from './components/LoadingModal';

function App() {
  const [chat, setChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [loading, setLoading] = useState(false);
  const [library, setLibrary] = useState<ProblemLibrary | null>(null);
  const [sections, setSections] = useState<string[]>([]);
  
  // New state for library loading
  const [isLoadingLibrary, setIsLoadingLibrary] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState<LoadingProgress>({
    currentFile: '',
    filesProcessed: 0,
    totalFiles: 0,
    totalProblems: 0,
    status: 'Инициализация...',
    fileSizeBytes: 0,
    fileLineCount: 0,
  });

  // Load library on startup
  useEffect(() => {
    const loadData = async () => {
      try {
        const { library: lib, sections: loadedSections } = await loadProblemLibrary(setLoadingProgress);
        setLibrary(lib);
        setSections(loadedSections);
      } catch (error) {
        console.error("Failed to load problem library:", error);
        setLoadingProgress(prev => ({ ...prev, status: `Ошибка: Не удалось загрузить задачи. Проверьте консоль.` }));
        setMessages([{ id: 'error-lib-load', text: "Ой, не получилось загрузить библиотеку задач. Пожалуйста, проверь подключение к сети и перезагрузи страницу.", sender: 'bot' }]);
        // Keep the modal open on error
        return;
      }
      setIsLoadingLibrary(false);
    };
    loadData();
  }, []);

  // Initialize chat after library is loaded
  useEffect(() => {
    if (isLoadingLibrary || sections.length === 0) return;

    try {
        const newChat = startChat(sections);
        setChat(newChat);
        setLoading(true);
        const fetchWelcomeMessage = async () => {
            try {
                const stream = await newChat.sendMessageStream({ message: "Привет! Библиотека задач загружена. Чем могу помочь?" });
                let botResponse = "";
                const botMessageId = `bot-${Date.now()}`;
                setMessages([{ id: botMessageId, text: '...', sender: 'bot' }]);

                for await (const chunk of stream) {
                    botResponse += chunk.text;
                    setMessages(prev => prev.map(msg => msg.id === botMessageId ? {...msg, text: botResponse} : msg));
                }
            } catch (error) {
                console.error("Failed to get welcome message:", error);
                setMessages(prev => [...prev, { id: 'error-welcome', text: "Извини, не получилось начать наш чат. Пожалуйста, проверь настройки.", sender: 'bot' }]);
            } finally {
                setLoading(false);
            }
        };
        fetchWelcomeMessage();
    } catch (error) {
        console.error("Chat initialization failed:", error);
        setMessages(prev => [...prev, { id: 'error-init', text: "Ой! Кажется, я не могу подключиться прямо сейчас. Пожалуйста, убедись, что API-ключ настроен.", sender: 'bot' }]);
    }
  }, [sections, isLoadingLibrary]);

  const handleFunctionCalls = async (functionCalls: any[], currentChat: Chat) => {
    for (const func of functionCalls) {
      let functionResponseResult: { result: string };
      
      if (func.name === 'generate_illustration') {
        const { description } = func.args;
        const drawingMessageId = `bot-drawing-${Date.now()}`;
        setMessages(prev => [...prev, { id: drawingMessageId, text: "Хорошо, сейчас нарисую объяснение...", sender: 'bot' }]);
        const imageUrl = await generateIllustration(description);
        setMessages(prev => prev.filter(msg => msg.id !== drawingMessageId));
        if (imageUrl) {
          setMessages(prev => [...prev, { id: `bot-image-${Date.now()}`, text: '', imageUrl, imagePrompt: description, sender: 'bot' }]);
          functionResponseResult = { result: "Картинка была показана пользователю." };
        } else {
          setMessages(prev => [...prev, { id: `bot-image-error-${Date.now()}`, text: "Ой, не получилось нарисовать картинку. Попробую объяснить словами.", sender: 'bot' }]);
          functionResponseResult = { result: "Не удалось создать картинку." };
        }
      } else if (func.name === 'show_problem') {
        const { section, number } = func.args;
        const source = library?.tasks;
        const title = 'Задача';
        let found = false;
        let content = `Не удалось найти задачу в разделе "${section}" под номером ${number}. Попробуй другой раздел или номер.`;

        if (source) {
          const sectionKey = Object.keys(source).find(key => key.toLowerCase().includes(section.toLowerCase()));
          if (sectionKey && source[sectionKey][number]) {
            content = `**${title} ${number} из раздела "${sectionKey}"**\n\n${source[sectionKey][number]}`;
            found = true;
          }
        }
        setMessages(prev => [...prev, { id: `bot-lib-${Date.now()}`, text: content, sender: 'bot' }]);
        functionResponseResult = { result: found ? `${title} была показана пользователю.` : "Не найдено." };
      } else if (func.name === 'show_solution') {
        const { section, number } = func.args;
        const source = library?.solutions;
        const title = 'Решение';
        let found = false;
        let content = `Не удалось найти решение для задачи в разделе "${section}" под номером ${number}. Возможно, для этой задачи решения нет.`;

        if (source) {
          const sectionKey = Object.keys(source).find(key => key.toLowerCase().includes(section.toLowerCase()));
          if (sectionKey && source[sectionKey][number]) {
            content = `**${title} к задаче ${number} из раздела "${sectionKey}"**\n\n${source[sectionKey][number]}`;
            found = true;
          }
        }
        setMessages(prev => [...prev, { id: `bot-lib-${Date.now()}`, text: content, sender: 'bot' }]);
        functionResponseResult = { result: found ? `${title} было показано пользователю.` : "Не найдено." };
      } else {
        continue;
      }

      const toolResponseStream = await currentChat.sendMessageStream({
        message: [{ functionResponse: { name: func.name, id: func.id, response: functionResponseResult } }],
      });
      
      let finalBotResponseText = "";
      const finalBotMessageId = `bot-final-${Date.now()}`;
      let hasAddedFinalMessage = false;

      for await (const chunk of toolResponseStream) {
        if(chunk.text){
          if(!hasAddedFinalMessage){
             setMessages(prev => [...prev, { id: finalBotMessageId, text: '', sender: 'bot' }]);
             hasAddedFinalMessage = true;
          }
          finalBotResponseText += chunk.text;
          setMessages(prev => prev.map(msg => msg.id === finalBotMessageId ? { ...msg, text: finalBotResponseText } : msg));
        }
      }
    }
  };

  const sendMessage = async (messageText: string) => {
    if (!messageText.trim() || loading || !chat) return;

    const userMessage: ChatMessageType = { id: `user-${Date.now()}`, text: messageText, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    setLoading(true);

    try {
      let stream = await chat.sendMessageStream({ message: messageText });
      let botResponseText = "";
      let functionCalls: any[] = [];
      
      const botTextStreamId = `bot-text-${Date.now()}`;
      let hasAddedTextStreamMessage = false;

      for await (const chunk of stream) {
        if (chunk.text) {
          if (!hasAddedTextStreamMessage) {
            setMessages(prev => [...prev, { id: botTextStreamId, text: '', sender: 'bot' }]);
            hasAddedTextStreamMessage = true;
          }
          botResponseText += chunk.text;
          setMessages(prev => prev.map(msg => msg.id === botTextStreamId ? { ...msg, text: botResponseText } : msg));
        }
        if (chunk.functionCalls) {
          functionCalls.push(...chunk.functionCalls);
        }
      }

      if (functionCalls.length > 0) {
        await handleFunctionCalls(functionCalls, chat);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage = "У меня небольшие трудности с размышлениями. Пожалуйста, попробуй еще раз через мгновение.";
      setMessages(prev => [...prev, { id: `bot-error-${Date.now()}`, text: errorMessage, sender: 'bot' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {isLoadingLibrary && <LoadingModal progress={loadingProgress} />}
      <div className="h-screen p-4 sm:p-6 text-gray-800 dark:text-gray-200">
          <div className="h-full flex flex-col items-center gap-4">
              <ChatHistory messages={messages} loading={loading} />
              <ChatInput onSendMessage={sendMessage} loading={loading || isLoadingLibrary} />
          </div>
      </div>
    </>
  );
}

export default App;