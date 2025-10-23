import React from 'react';
import { LoadingProgress } from '../types';

interface LoadingModalProps {
  progress: LoadingProgress;
}

const LoadingModal: React.FC<LoadingModalProps> = ({ progress }) => {
  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-80 backdrop-blur-sm flex items-center justify-center z-50 transition-opacity duration-300">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-2xl w-full max-w-md text-center transform transition-all duration-300 scale-95 opacity-0 animate-fade-in-scale">
        <style>{`
          @keyframes fade-in-scale {
            0% { transform: scale(0.95); opacity: 0; }
            100% { transform: scale(1); opacity: 1; }
          }
          .animate-fade-in-scale {
            animation: fade-in-scale 0.3s forwards;
          }
          @keyframes pulse-opacity {
            0% { opacity: 0.7; }
            50% { opacity: 1; }
            100% { opacity: 0.7; }
          }
        `}</style>
        <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-200">Подготовка ассистента...</h2>
        
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Статус: <span className="font-semibold">{progress.status || '...'}</span>
        </p>
        
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mb-4 overflow-hidden">
          <div
            className="bg-purple-600 h-2.5 rounded-full"
            style={{ width: '100%', animation: 'pulse-opacity 2s infinite' }}
          ></div>
        </div>
        
        <div className="text-sm text-gray-500 dark:text-gray-300 min-h-[20px]">
          {(typeof progress.booksLoaded === 'number' || typeof progress.chaptersLoaded === 'number' || typeof progress.tasksLoaded === 'number') && (
            <div>
              {typeof progress.booksLoaded === 'number' && (
                <span className="inline-block mr-2">Книг: <span className="font-medium">{progress.booksLoaded}</span></span>
              )}
              {typeof progress.chaptersLoaded === 'number' && (
                <span className="inline-block mr-2">Глав: <span className="font-medium">{progress.chaptersLoaded}</span></span>
              )}
              {typeof progress.tasksLoaded === 'number' && (
                <span className="inline-block">Задач: <span className="font-medium">{progress.tasksLoaded}</span></span>
              )}
            </div>
          )}
          {progress.status === 'Индекс загружен.' && typeof progress.totalTasks === 'number' && (
             <span>Всего задач в библиотеке: <span className="font-medium">{progress.totalTasks}</span></span>
          )}
        </div>

      </div>
    </div>
  );
};

export default LoadingModal;