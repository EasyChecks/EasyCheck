import React, { memo } from 'react';

/**
 * EmptyState - Optimized empty state component
 * ใช้สำหรับแสดงเมื่อไม่มีข้อมูล
 */
const EmptyState = memo(function EmptyState({ 
  icon = '📭',
  title = 'ไม่พบข้อมูล',
  message = 'ยังไม่มีข้อมูลในขณะนี้',
  actionLabel,
  onAction
}) {
  return (
    <div className="flex items-center justify-center min-h-[300px] p-6">
      <div className="text-center max-w-md">
        <div className="text-7xl mb-4">{icon}</div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">{title}</h3>
        <p className="text-gray-600 mb-6">{message}</p>
        {actionLabel && onAction && (
          <button
            onClick={onAction}
            className="px-6 py-2 bg-gradient-to-r from-sky-500 to-cyan-600 hover:from-sky-600 hover:to-cyan-700 text-white rounded-lg transition-all duration-200 font-medium shadow-md hover:shadow-lg transform hover:scale-105"
          >
            {actionLabel}
          </button>
        )}
      </div>
    </div>
  );
});

EmptyState.displayName = 'EmptyState';

export default EmptyState;
