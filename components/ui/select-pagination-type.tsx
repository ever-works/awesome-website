'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';

// Types
type PaginationType = 'standard' | 'infinite';

interface SelectPaginationTypeProps {
  value?: PaginationType;
  onChange?: (type: PaginationType) => void;
  className?: string;
  disabled?: boolean;
}

// Icons as constants for better maintainability
const UpArrowIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
  </svg>
);

const InfiniteScrollIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
  </svg>
);

const ConfigIcon = () => (
  <svg className="w-4 h-4 text-theme-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
  </svg>
);

// Pagination options configuration
const PAGINATION_OPTIONS = [
  {
    id: 'standard' as PaginationType,
    label: 'Standard',
    icon: UpArrowIcon,
    description: 'Navigate through pages with traditional pagination controls'
  },
  {
    id: 'infinite' as PaginationType,
    label: 'Infinite Scroll',
    icon: InfiniteScrollIcon,
    description: 'Continuously load content as you scroll down'
  }
] as const;

const SelectPaginationType: React.FC<SelectPaginationTypeProps> = ({
  value,
  onChange,
  className,
  disabled = false
}) => {
  const [localPaginationType, setLocalPaginationType] = useState<PaginationType>('standard');
  
  const isControlled = value !== undefined;
  const paginationType = isControlled ? value : localPaginationType;
  
  const handlePaginationChange = (type: PaginationType) => {
    if (disabled) return;
    
    if (isControlled && onChange) {
      onChange(type);
    } else {
      setLocalPaginationType(type);
    }
  };

  return (
    <div 
      className={cn(
        "space-y-3 p-4 bg-gray-50/50 dark:bg-gray-800/30 rounded-xl",
        "border border-gray-200/30 dark:border-gray-700/30",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
    >
      <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
        <ConfigIcon />
        Pagination Style
      </h4>
      
      <div className="grid grid-cols-2 gap-3">
        {PAGINATION_OPTIONS.map((option) => {
          const Icon = option.icon;
          const isActive = paginationType === option.id;
          
          return (
            <button
              key={option.id}
              onClick={() => handlePaginationChange(option.id)}
              disabled={disabled}
              className={cn(
                "px-4 py-3 rounded-xl font-medium text-sm transition-all duration-300",
                "flex items-center justify-center gap-2",
                isActive
                  ? "bg-gradient-to-br from-theme-primary-500 to-theme-primary-600 text-white shadow-lg shadow-theme-primary-500/25 ring-2 ring-theme-primary-400/50"
                  : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700",
                disabled && "cursor-not-allowed hover:bg-white dark:hover:bg-gray-800"
              )}
              aria-pressed={isActive}
              aria-label={`Select ${option.label} pagination`}
            >
              <Icon />
              {option.label}
            </button>
          );
        })}
      </div>
      
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
        {PAGINATION_OPTIONS.find(opt => opt.id === paginationType)?.description}
      </p>
    </div>
  );
};

export default SelectPaginationType;