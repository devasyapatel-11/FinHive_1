
import React from 'react';

interface FinHiveLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const FinHiveLogo: React.FC<FinHiveLogoProps> = ({ className = '', size = 'md' }) => {
  const sizeMap = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
  };

  return (
    <div className={`flex items-center ${className}`}>
      <div className={`relative ${sizeMap[size]} rounded-lg bg-finhive-primary flex items-center justify-center text-white font-bold`}>
        <div className="absolute inset-0 flex items-center justify-center">
          <svg viewBox="0 0 24 24" width="60%" height="60%" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 8h-5.612l1.123-3.367A1 1 0 0 0 14.613 3H7.387a1 1 0 0 0-.949.684L4.796 8H4a1 1 0 0 0-1 1v11a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V9a1 1 0 0 0-1-1zM12 18a3 3 0 1 1 0-6 3 3 0 0 1 0 6z" 
              fill="currentColor"/>
          </svg>
        </div>
      </div>
      <span className="ml-2 text-xl font-bold text-gray-800">FinHive</span>
    </div>
  );
};

export default FinHiveLogo;
