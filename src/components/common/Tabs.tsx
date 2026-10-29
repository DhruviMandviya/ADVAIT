import React from 'react';

export interface TabItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  badge?: string | number;
}

interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (id: string) => void;
  variant?: 'pill' | 'underline' | 'boxed';
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeTab,
  onChange,
  variant = 'boxed',
  className = ''
}) => {
  if (variant === 'boxed') {
    return (
      <div className={`flex bg-[#EBF3EF] p-1.5 rounded-xl border border-[#D1DCD6] ${className}`}>
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3.5 text-xs sm:text-sm font-semibold rounded-lg transition-all cursor-pointer ${
                isActive
                  ? 'bg-[#14513A] text-white shadow-xs'
                  : 'text-[#4B5563] hover:text-[#14233F] hover:bg-black/5'
              }`}
            >
              {tab.icon && <span className="flex-shrink-0">{tab.icon}</span>}
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span
                  className={`text-[11px] px-1.5 py-0.2 rounded-full font-bold ${
                    isActive ? 'bg-[#1E9E5A] text-white' : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className={`flex border-b border-[#E3EAE6] gap-4 ${className}`}>
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`flex items-center gap-2 py-3 px-1 text-sm font-semibold border-b-2 transition-all cursor-pointer ${
              isActive
                ? 'border-[#14513A] text-[#14513A]'
                : 'border-transparent text-[#8A94A0] hover:text-[#14233F]'
            }`}
          >
            {tab.icon && <span>{tab.icon}</span>}
            <span>{tab.label}</span>
            {tab.badge !== undefined && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-[#EBF3EF] text-[#14513A]">
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};

