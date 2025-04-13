
import React from 'react';
import { User } from 'lucide-react';

interface UserGreetingProps {
  name: string;
  isPremium: boolean;
}

const UserGreeting: React.FC<UserGreetingProps> = ({ name, isPremium }) => {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <div className="flex items-center justify-between py-2">
      <div className="flex items-center space-x-2">
        <h2 className="text-lg font-medium text-finhive-text">{getGreeting()},</h2>
        <h2 className="text-lg font-semibold text-finhive-text">{name}</h2>
        {isPremium && (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-finhive-primary text-white">
            Pro
          </span>
        )}
      </div>
    </div>
  );
};

export default UserGreeting;
