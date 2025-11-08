import React from 'react';
import { cn } from '@/lib/utils';

interface NotificationBadgeProps {
  count: number;
  className?: string;
}

export const NotificationBadge: React.FC<NotificationBadgeProps> = ({ count, className }) => {
  if (count === 0) {
    return null;
  }

  const badgeColor = count > 10 ? 'bg-red-500' : 'bg-amber-500';

  return (
    <span
      className={cn(
        'inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-semibold text-white rounded-full',
        badgeColor,
        className
      )}
    >
      {count > 99 ? '99+' : count}
    </span>
  );
};



