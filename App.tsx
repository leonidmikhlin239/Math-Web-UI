import React, { useState, useEffect } from 'react';
import { Chat } from '@google/genai';
import { ChatMessage, Task, IndexManifest, LoadingProgress } from './types';
import { startChat, generateIllustration } from './services/geminiService';
import { loadIndexManifest, loadChapterTasks } from './services/texParser';
import ChatHistory from './components/ChatHistory';
import ChatInput from './components/ChatInput';
import LoadingModal from './components/LoadingModal';
import ImagePanel from './components/ImagePanel';

const IMAGE_BASE_URL = 'https://endearing-bubblegum-26ba72.netlify.app/';

function App() {
  // State for app initialization and data loading
  const [isInitializing, setIsInitializing] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState<LoadingProgress>({ status: 'Инициализация...' });
  const [indexManifest, setIndexManifest] = useState<IndexManifest | null>(null);
  
  // State for book/chapter selection and tasks
  const [availableBooks, setAvailableBooks] = useState<string[]>([]);
  const [selectedBookTitle, setSelectedBookTitle] = useState<string | null>(null);
  const [selectedChapterTitle, setSelectedChapterTitle] = useState<string | null>(null);
  const [currentChapterTasks, setCurrentChapterTasks] = useState<Task[] | null>(null);

  // State for chat
  const [chat, setChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isBotTyping, setIsBotTyping] = useState(false);

  // State for the image panel
  const [imagePanelUrl, setImagePanelUrl] = useState<string | null>(null);
  const [lastImageUrl, setLastImageUrl] = useState<string | null>(null);


  // --- Initialization Effect ---
  useEffect(() => {
    const initializeApp = async () => {
      try {
        const { manifest, bookTitles } = await loadIndexManifest(setLoadingProgress);
        setIndexManifest(manifest);
        setAvailableBooks(bookTitles);
        
        // Initialize chat here once after loading books
        const newChat = startChat(bookTitles);
        setChat(newChat);
        setMessages([{
          id: 'init',
          text: "Привет! Я MathBot, твой AI-помощник по математике. Чем могу помочь сегодня?",
          sender: 'bot'
        }]);

        setIsInitializing(false);
      } catch (error) {
        console.error("Failed to initialize app:", error);
        setLoadingProgress({ status: `Критическая ошибка: ${error instanceof Error ? error.message : String(error)}` });
      }
    };
    initializeApp();
  }, []);

  // --- Chapter Selection Handler ---
  const handleChapterSelect = async (bookTitle: string, chapterTitle: string) => {
    if (!indexManifest) return;

    const book = indexManifest.books.find(b => b.title === bookTitle);
    const chapter = book?.chapters.find(c => c.title === chapterTitle);

    if (!chapter) return;

    setLoadingProgress({ status: `Загрузка задач для главы "${chapterTitle}"...` });
    setIsBotTyping(true); // Show loading indicator in chat
    setImagePanelUrl(null); // Close image panel on chapter change
    setLastImageUrl(null); // Reset last image as well

    try {
        const tasks = await loadChapterTasks(chapter.path);
        setCurrentChapterTasks(tasks);
        console.log(`Loaded ${tasks.length} tasks for chapter "${chapterTitle}"`);

        // Re-initialize the chat with the new chapter context
        const newChat = startChat(availableBooks, { bookTitle, chapterTitle, tasks });
        setChat(newChat);

        // Inform the user that the context has changed
        const userFriendlyMessage: ChatMessage = {
            id: `context-${Date.now()}`,
            sender: 'bot',
            text: `Отлично! Мы работаем с главой "${chapterTitle}" из книги "${bookTitle}". Спрашивай, если что-то непонятно!`
        };
        setMessages(prev => [...prev, userFriendlyMessage]);
    } catch (error) {
        console.error("Failed to load chapter tasks:", error);
         const errorMessage: ChatMessage = {
            id: `error-${Date.now()}`,
            sender: 'bot',
            text: `К сожалению, не удалось загрузить задачи для главы "${chapterTitle}". Попробуйте выбрать другую.`
        };
        setMessages(prev => [...prev, errorMessage]);
    } finally {
        setIsBotTyping(false);
        setLoadingProgress({ status: 'Готов к работе.' });
    }
  };

  /**
   * Processes a string to find and extract a PIC tag, returning the cleaned text and the image URL.
   */
  const processTextForImages = (text: string): { processedText: string; imageUrl: string | null } => {
    const picRegex = /{{\s*PIC\s*:\s*([^}\s]+)\s*}}/g;
    let imageUrl: string | null = null;
    let match;
    // Find the last match to handle multiple tags, though we only show one image panel at a time.
    while ((match = picRegex.exec(text)) !== null) {
        const filename = match[1];
        if (filename) {
            imageUrl = `${IMAGE_BASE_URL}${filename.trim()}`;
        }
    }
    const processedText = text.replace(picRegex, '').trim();
    return { processedText, imageUrl };
  };

  // --- Main Message Sending Logic ---
  const handleSendMessage = async (messageText: string) => {
    if (!chat || isBotTyping) return;

    setIsBotTyping(true);
    setImagePanelUrl(null); // Close any open image panel on new message
    setLastImageUrl(null); // Clear last image on new message
    const newUserMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      text: messageText,
      sender: 'user',
    };
    setMessages((prevMessages) => [...prevMessages, newUserMessage]);

    let botResponseText = '';
    const botMessageId = `bot-${Date.now()}`;
    let hasAddedBotMessage = false;

    try {
      const result = await chat.sendMessageStream({ message: messageText });

      for await (const chunk of result) {
        // @ts-ignore - functionCalls is a valid property on the chunk
        const functionCalls = chunk.functionCalls;
        if (functionCalls) {
            // Handle function calls
            for (const fc of functionCalls) {
                // @ts-ignore
                await handleFunctionCall(fc);
            }
        } else {
            // Append the raw chunk text to the full response
            botResponseText += chunk.text;

            // Process the entire accumulated text for images
            const { processedText, imageUrl } = processTextForImages(botResponseText);

            if (imageUrl) {
                setImagePanelUrl(imageUrl);
                setLastImageUrl(imageUrl);
            }
            
            // Update the UI with the cleaned text
            setMessages((prev) => {
                if (hasAddedBotMessage) {
                    const newMessages = [...prev];
                    const msgIndex = newMessages.findIndex(m => m.id === botMessageId);
                    if (msgIndex !== -1) {
                      newMessages[msgIndex] = { ...newMessages[msgIndex], text: processedText };
                    }
                    return newMessages;
                } else {
                    hasAddedBotMessage = true;
                    return [...prev, { id: botMessageId, text: processedText, sender: 'bot' }];
                }
            });
        }
      }
    } catch (error) {
      console.error('Gemini API Error:', error);
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        sender: 'bot',
        text: 'Произошла ошибка при обращении к AI. Пожалуйста, попробуйте еще раз.',
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsBotTyping(false);
    }
  };

  const findTaskByIdOrNumber = (taskIdOrNumber: string): Task | undefined => {
      if (!currentChapterTasks) return undefined;
      // First, try matching by full ID (e.g., "kvant_1970_1")
      let task = currentChapterTasks.find(t => t.id === taskIdOrNumber);
      if (task) return task;

      // If not found, try matching just the task number
      const taskNumber = parseInt(taskIdOrNumber.split('_').pop() || taskIdOrNumber, 10);
      if (!isNaN(taskNumber)) {
          task = currentChapterTasks.find(t => t.taskNumber === taskNumber);
      }
      return task;
  };
  
  // --- Function Call Handler ---
  async function handleFunctionCall(fc: { name: string; args: any; id?: string }) {
      console.log('Handling function call:', fc.name, fc.args);

      if (fc.name === 'generate_illustration') {
          const { description } = fc.args;
          const imageMessageId = `bot-image-${Date.now()}`;
          // Add a placeholder message
          setMessages(prev => [...prev, { 
              id: imageMessageId, 
              sender: 'bot', 
              text: `Рисую: *${description}*`, 
              imageUrl: undefined,
              imagePrompt: description
          }]);

          const imageUrl = await generateIllustration(description);

          if (imageUrl) {
               setMessages(prev => prev.map(m => m.id === imageMessageId ? {...m, text: '', imageUrl: imageUrl} : m));
          } else {
              setMessages(prev => prev.map(m => m.id === imageMessageId ? {...m, text: 'Не удалось создать иллюстрацию.'} : m));
          }
      } else if (fc.name === 'show_problem' || fc.name === 'show_solution') {
          const { taskId } = fc.args;
          const task = findTaskByIdOrNumber(taskId);
          
          if (task) {
              const textToShow = fc.name === 'show_problem' ? task.problem : task.solution;
              const title = fc.name === 'show_problem' ? `Задача №${task.taskNumber}` : `Решение задачи №${task.taskNumber}`;
              const rawContent = `**${title}**\n\n${textToShow}`;

              // Process the content for images
              const { processedText, imageUrl } = processTextForImages(rawContent);

              if (imageUrl) {
                  setImagePanelUrl(imageUrl);
                  setLastImageUrl(imageUrl);
              }

              const taskMessage: ChatMessage = {
                  id: `task-${fc.name}-${task.id}-${Date.now()}`,
                  sender: 'bot',
                  text: processedText // Use the processed text
              };
              setMessages(prev => [...prev, taskMessage]);
          } else {
              const content = `Задача с ID или номером "${taskId}" не найдена в текущей главе. Попроси пользователя уточнить номер.`;
              const errorMessage: ChatMessage = {
                  id: `task-error-${Date.now()}`,
                  sender: 'bot',
                  text: content
              };
              setMessages(prev => [...prev, errorMessage]);
          }
      }
  }

  return (
    <div className="font-sans antialiased text-gray-800 dark:text-gray-200 bg-gray-100 dark:bg-gray-900">
      <ImagePanel imageUrl={imagePanelUrl} onClose={() => setImagePanelUrl(null)} />
      {/* Re-open button */}
      {lastImageUrl && !imagePanelUrl && (
        <div className="fixed top-0 left-1/2 -translate-x-1/2 z-30">
          <button
            onClick={() => setImagePanelUrl(lastImageUrl)}
            className="px-5 py-2 bg-purple-600/80 backdrop-blur-sm text-white rounded-b-xl shadow-lg hover:bg-purple-700/90 focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all duration-200"
            aria-label="Показать последнее изображение"
          >
            Показать картинку
          </button>
        </div>
      )}
      <main className="flex flex-col items-center justify-center w-full h-screen p-4 sm:p-6 lg:p-8 space-y-4">
        {isInitializing && <LoadingModal progress={loadingProgress} />}
        <ChatHistory messages={messages} loading={isBotTyping} />
        <ChatInput 
          onSendMessage={handleSendMessage} 
          loading={isBotTyping}
          indexManifest={indexManifest}
          selectedBookTitle={selectedBookTitle}
          setSelectedBookTitle={setSelectedBookTitle}
          selectedChapterTitle={selectedChapterTitle}
          setSelectedChapterTitle={setSelectedChapterTitle}
          onChapterSelect={handleChapterSelect}
        />
      </main>
    </div>
  );
}

export default App;