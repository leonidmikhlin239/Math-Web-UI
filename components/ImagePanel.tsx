import React, { useState, useRef, useEffect } from 'react';
import Icon from './Icon';

interface ImagePanelProps {
  imageUrl: string | null;
  onClose: () => void;
}

const ImagePanel: React.FC<ImagePanelProps> = ({ imageUrl, onClose }) => {
  const panelRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartOffset = useRef({ x: 0, y: 0 });

  // Reset position when a new image is shown
  useEffect(() => {
    if (imageUrl) {
      setPosition({ x: 0, y: 0 });
    }
  }, [imageUrl]);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsDragging(true);
    dragStartOffset.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };
    e.preventDefault();
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragStartOffset.current.x,
        y: e.clientY - dragStartOffset.current.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = 'none';
    } else {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = '';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = '';
    };
  }, [isDragging]);

  return (
    <div
      ref={panelRef}
      className={`fixed z-40 flex flex-col transition-all duration-300 ease-in-out bg-white/80 dark:bg-gray-800/80 backdrop-blur-md shadow-2xl rounded-lg border border-gray-200 dark:border-gray-700`}
      style={{
        top: '2rem',
        left: '50%',
        width: 'min(90vw, 800px)',
        transform: `translate(calc(-50% + ${position.x}px), ${position.y}px)`,
        opacity: imageUrl ? 1 : 0,
        pointerEvents: imageUrl ? 'auto' : 'none',
        visibility: imageUrl ? 'visible' : 'hidden',
      }}
    >
      {/* Draggable Header */}
      <div
        onMouseDown={handleMouseDown}
        className={`w-full h-10 p-2 flex items-center justify-between ${
          isDragging ? 'cursor-grabbing' : 'cursor-grab'
        } rounded-t-lg`}
      >
        <span className="text-sm font-medium text-gray-600 dark:text-gray-400 pl-2">
          Изображение
        </span>
        <button
          onClick={onClose}
          className="z-10 w-8 h-8 flex items-center justify-center bg-gray-600/20 text-gray-800 dark:text-white rounded-full hover:bg-gray-600/40 focus:outline-none focus:ring-2 focus:ring-purple-500"
          aria-label="Close image viewer"
        >
          <Icon name="close" className="w-5 h-5" />
        </button>
      </div>

      {/* Image Content */}
      <div className="relative px-4 pb-4 flex-1">
        <div className="h-[40vh] flex items-center justify-center bg-black/5 dark:bg-black/20 rounded-md overflow-hidden">
          {imageUrl && (
            <img
              src={imageUrl}
              alt="Task illustration"
              className="object-contain w-full h-full max-w-full max-h-full"
              draggable="false"
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ImagePanel;
