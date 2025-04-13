
import React from 'react';
import { CreditCard } from 'lucide-react';

interface ConnectedCardProps {
  cardType: 'visa' | 'mastercard' | 'rupay' | 'amex';
  lastFour: string;
  linkedAccount: string;
  monthlyFee: number;
}

const ConnectedCard: React.FC<ConnectedCardProps> = ({ cardType, lastFour, linkedAccount, monthlyFee }) => {
  return (
    <div className="rounded-lg bg-white p-5 border border-finhive-border">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center">
          {cardType === 'visa' && (
            <div className="w-12 h-8 bg-blue-600 rounded flex items-center justify-center text-white font-bold">
              VISA
            </div>
          )}
          {cardType === 'mastercard' && (
            <div className="w-12 h-8 bg-red-600 rounded flex items-center justify-center text-white font-bold">
              MC
            </div>
          )}
          {cardType === 'rupay' && (
            <div className="w-12 h-8 bg-green-600 rounded flex items-center justify-center text-white font-bold">
              RUPAY
            </div>
          )}
          {cardType === 'amex' && (
            <div className="w-12 h-8 bg-blue-800 rounded flex items-center justify-center text-white font-bold">
              AMEX
            </div>
          )}
        </div>
        <button className="text-xs text-finhive-muted hover:text-finhive-primary">Direct Debit</button>
      </div>
      
      <div className="mb-4">
        <p className="text-xs text-finhive-muted mb-1">Linked to main account</p>
        <div className="flex items-center">
          <p className="text-sm">**** {lastFour}</p>
        </div>
      </div>
      
      <div className="flex justify-between gap-2 mb-4">
        <button className="flex-1 px-3 py-2 rounded bg-finhive-primary text-white text-sm font-medium">
          Recharge
        </button>
        <button className="flex-1 px-3 py-2 rounded border border-finhive-border text-finhive-text text-sm font-medium">
          Send
        </button>
      </div>
      
      <div className="border-t border-finhive-border pt-2">
        <p className="text-xs text-finhive-muted mb-1">Monthly regular fee</p>
        <div className="flex items-center justify-between">
          <p className="font-medium text-finhive-primary">₹ {monthlyFee.toFixed(2)}</p>
          <div className="flex items-center">
            <span className="text-xs text-finhive-muted mr-1">Edit</span>
            <span className="text-xs text-finhive-muted">Card details</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConnectedCard;
