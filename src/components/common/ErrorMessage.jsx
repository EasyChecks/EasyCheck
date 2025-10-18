import React, { memo } from 'react';

/**
 * ErrorMessage - Optimized error display component
 * ใช้ React.memo เพราะ error messages ไม่เปลี่ยนบ่อย
 */
const ErrorMessage = memo(function ErrorMessage({ 
  title = 'เกิดข้อผิดพลาด',
  message,
  onRetry,
  icon = '⚠️'
}) {
  return (
    <div className="flex items-center justify-center min-h-[200px] p-6">
      <div className="text-center max-w-md">
        <div className="text-6xl mb-4">{icon}</div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">{title}</h3>
        <p className="text-gray-600 mb-6">{message}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors duration-200 font-medium"
          >
            ลองอีกครั้ง
          </button>
        )}
      </div>
    </div>
  );
});

ErrorMessage.displayName = 'ErrorMessage';

export default ErrorMessage;
