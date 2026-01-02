// src/components/common/Modal.jsx
import React from 'react';
import { X } from 'lucide-react'; // Sử dụng thư viện icon lucide-react

const Modal = ({ isOpen, onClose, title, children, actions }) => {
  if (!isOpen) return null;

  return (
    // Lớp nền mờ (Overlay)
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      {/* Card nội dung chính */}
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 overflow-hidden animate-fadeInScale">
        
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <h3 className="text-lg font-bold text-gray-800">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {children}
        </div>

        {/* Footer (Actions buttons) */}
        <div className="flex justify-end gap-3 p-4 border-t border-gray-200 bg-gray-50">
            {actions}
        </div>
      </div>
    </div>
  );
};

export default Modal;