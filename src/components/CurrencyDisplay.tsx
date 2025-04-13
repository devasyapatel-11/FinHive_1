
import React from 'react';
import { formatIndianCurrency } from '@/services/financeService';

interface CurrencyDisplayProps {
  currencies: {
    code: string;
    amount: number;
    value: string;
  }[];
}

const CurrencyDisplay: React.FC<CurrencyDisplayProps> = ({ currencies }) => {
  // Function to get appropriate currency symbol
  const getCurrencySymbol = (code: string): string => {
    switch (code.toUpperCase()) {
      case 'USD': return '$';
      case 'EUR': return '€';
      case 'GBP': return '£';
      case 'INR': return '₹';
      default: return code;
    }
  };

  // Function to convert any currency to INR (for display purposes)
  const convertToINR = (amount: number, code: string): number => {
    // In a real app, this would use real-time exchange rates
    // For now, using fixed rates as an example
    const exchangeRates: Record<string, number> = {
      'USD': 83.5, // 1 USD = 83.5 INR
      'EUR': 90.2, // 1 EUR = 90.2 INR
      'GBP': 106.8, // 1 GBP = 106.8 INR
      'INR': 1,     // 1 INR = 1 INR
    };
    
    const rate = exchangeRates[code.toUpperCase()] || 1;
    return amount * rate;
  };

  return (
    <div className="rounded-lg bg-white p-6 border border-finhive-border">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium">Currency</h3>
        <button className="p-1">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M13 5C13 4.44772 12.5523 4 12 4C11.4477 4 11 4.44772 11 5V11H5C4.44772 11 4 11.4477 4 12C4 12.5523 4.44772 13 5 13H11V19C11 19.5523 11.4477 20 12 20C12.5523 20 13 19.5523 13 19V13H19C19.5523 13 20 12.5523 20 12C20 11.4477 19.5523 11 19 11H13V5Z" fill="#666" />
          </svg>
        </button>
      </div>
      
      <div className="space-y-4">
        {currencies.map((currency) => {
          const inrValue = convertToINR(currency.amount, currency.code);
          return (
            <div key={currency.code} className="flex items-center py-2 border-b border-finhive-border last:border-0">
              <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-finhive-primary font-bold mr-3">
                {currency.code.substring(0, 1)}
              </div>
              <div className="flex-1">
                <div className="font-medium">{formatIndianCurrency(inrValue)}</div>
                <div className="text-xs text-finhive-muted flex justify-between">
                  <span>{currency.value || currency.code}</span>
                  {currency.code !== 'INR' && (
                    <span className="text-finhive-muted">
                      {getCurrencySymbol(currency.code)}{currency.amount.toLocaleString(undefined, {maximumFractionDigits: 2})}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CurrencyDisplay;
