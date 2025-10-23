import React from 'react';
import { LoadingProgress } from '../types';

interface LoadingModalProps {
  progress: LoadingProgress;
}

const LoadingModal: React.FC<LoadingModalProps> = ({ progress }) => {
  const percentage = progress.totalFiles > 0 ? (progress.filesProcessed / progress.totalFiles) * 100 : 0;
  const sizeKB = (progress.fileSizeBytes / 1024).toFixed(1);

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
        `}</style>
        <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-200">Загрузка библиотеки...</h2>
        
        <p className="text-gray-600 dark:text-gray-400 mb-2">
          Файл: <span className="font-mono bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">{progress.currentFile || '...'}</span>
        </p>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Статус: <span className="font-semibold">{progress.status || '...'}</span>
        </p>
        
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 mb-4 overflow-hidden">
          <div
            className="bg-purple-600 h-4 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
        
        <div className="text-sm text-gray-500 dark:text-gray-300 grid grid-cols-2 gap-x-4 text-left">
          <span>Прогресс по файлам:</span> <span className="text-right font-medium">{progress.filesProcessed} / {progress.totalFiles}</span>
          <span>Всего задач:</span> <span className="text-right font-medium">{progress.totalProblems}</span>
          {progress.fileSizeBytes > 0 && <>
            <span>Размер файла:</span> <span className="text-right font-medium">{sizeKB} KB</span>
          </>}
          {progress.fileLineCount > 0 && <>
            <span>Строк в файле:</span> <span className="text-right font-medium">{progress.fileLineCount}</span>
          </>}
        </div>

      </div>
    </div>
  );
};

export default LoadingModal;