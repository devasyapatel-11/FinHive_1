
import React from 'react';

interface QuickTransactionProps {
  contacts: {
    id: string;
    name: string;
    avatar: string;
  }[];
}

const QuickTransaction: React.FC<QuickTransactionProps> = ({ contacts }) => {
  return (
    <div className="rounded-lg bg-white p-6 border border-finhive-border">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium">Quick Transaction</h3>
        <button>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M5 12H19M19 12L13 6M19 12L13 18" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
      
      <div className="flex justify-between">
        {contacts.map((contact) => (
          <div key={contact.id} className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-full overflow-hidden mb-2">
              <img src={contact.avatar} alt={contact.name} className="w-full h-full object-cover" />
            </div>
            <span className="text-xs">{contact.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default QuickTransaction;
