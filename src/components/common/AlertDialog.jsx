import React, { useEffect } from 'react';

const AlertDialog = ({ 
  isOpen, 
  onClose,
  onConfirm,
  title, 
  message, 
  confirmText = 'ตกลง',
  cancelText = 'ยกเลิก',
  type = 'info', // 'success', 'error', 'warning', 'info', 'confirm'
  autoClose = false,
  autoCloseDelay = 3000
}) => {
  useEffect(() => {
    if (isOpen && autoClose && type !== 'confirm') {
      const timer = setTimeout(() => {
        onClose();
      }, autoCloseDelay);

      return () => clearTimeout(timer);
    }
  }, [isOpen, autoClose, autoCloseDelay, onClose, type]);

  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && type !== 'confirm') {
      onClose();
    }
  };

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
    onClose();
  };

  const getIconAndColor = () => {
    switch(type) {
      case 'success':
        return {
          icon: (
            <svg className="w-16 h-16 sm:w-20 sm:h-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
          color: 'text-green-500',
          bgColor: 'from-green-50 to-emerald-50',
          buttonColor: 'from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700'
        };
      case 'error':
        return {
          icon: (
            <svg className="w-16 h-16 sm:w-20 sm:h-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
          color: 'text-red-500',
          bgColor: 'from-red-50 to-rose-50',
          buttonColor: 'from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700'
        };
      case 'warning':
        return {
          icon: (
            <svg className="w-16 h-16 sm:w-20 sm:h-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          ),
          color: 'text-yellow-500',
          bgColor: 'from-yellow-50 to-amber-50',
          buttonColor: 'from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700'
        };
      case 'confirm':
        return {
          icon: (
            <svg className="w-16 h-16 sm:w-20 sm:h-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
          color: 'text-purple-500',
          bgColor: 'from-purple-50 to-pink-50',
          buttonColor: 'from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700'
        };
      default: // info
        return {
          icon: (
            <svg className="w-16 h-16 sm:w-20 sm:h-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
          color: 'text-blue-500',
          bgColor: 'from-blue-50 to-cyan-50',
          buttonColor: 'from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700'
        };
    }
  };

  const { icon, color, bgColor, buttonColor } = getIconAndColor();

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm font-prompt animate-fadeIn"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-sm sm:max-w-md transform animate-slideUp">
        {/* Icon */}
        <div className={`bg-gradient-to-br ${bgColor} p-6 sm:p-8 rounded-t-2xl sm:rounded-t-3xl flex justify-center`}>
          <div className={color}>
            {icon}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 sm:p-8 text-center">
          <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-3">
            {title}
          </h3>
          <p className="text-sm sm:text-base text-gray-600 leading-relaxed whitespace-pre-line">
            {message}
          </p>
        </div>

        {/* Buttons */}
        <div className="p-4 sm:p-6 pt-0">
          {type === 'confirm' ? (
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-3 sm:py-4 rounded-xl sm:rounded-2xl transition-all duration-200 transform hover:scale-[1.02]"
              >
                {cancelText}
              </button>
              <button
                onClick={handleConfirm}
                className={`flex-1 bg-gradient-to-r ${buttonColor} text-white font-bold py-3 sm:py-4 rounded-xl sm:rounded-2xl shadow-lg transition-all duration-200 transform hover:scale-[1.02]`}
              >
                {confirmText}
              </button>
            </div>
          ) : (
            <button
              onClick={onClose}
              className={`w-full bg-gradient-to-r ${buttonColor} text-white font-bold py-3 sm:py-4 rounded-xl sm:rounded-2xl shadow-lg transition-all duration-200 transform hover:scale-[1.02]`}
            >
              {confirmText}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AlertDialog;
