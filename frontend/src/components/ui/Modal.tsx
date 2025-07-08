import React, { ReactNode } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div
        className="bg-white dark:bg-zinc-900 rounded-lg shadow-xl max-w-lg w-full p-6 relative"
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-zinc-500 hover:text-zinc-900 dark:hover:text-white text-2xl font-bold focus:outline-none"
          aria-label="Close modal"
        >
          &times;
        </button>
        {title && <h2 className="text-xl font-semibold mb-4 text-zinc-900 dark:text-white">{title}</h2>}
        <div className="text-zinc-700 dark:text-zinc-200 text-base max-h-[60vh] overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal; 