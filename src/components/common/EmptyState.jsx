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
            className="px-6 py-2 bg-primary dark:bg-primary hover:bg-primary/90 dark:hover:bg-primary/80 text-white rounded-lg transition-colors font-medium shadow-md hover:shadow-lg "
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
