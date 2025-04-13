
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatIndianCurrency } from '@/services/financeService';

interface BalanceChartProps {
  data: {
    name: string;
    income: number;
    expenses: number;
  }[];
  currentBalance: number;
  percentChange: number;
}

const BalanceChart: React.FC<BalanceChartProps> = ({ data, currentBalance, percentChange }) => {
  // Use the formatIndianCurrency function from our service
  const formatCurrency = (value: number) => {
    return formatIndianCurrency(value);
  };

  return (
    <div className="rounded-lg bg-white p-6 border border-finhive-border h-80">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium">Total Balance</h3>
        <div className="flex space-x-2">
          <button className="px-3 py-1 rounded-full text-sm bg-finhive-primary text-white">
            Day
          </button>
          <button className="px-3 py-1 rounded-full text-sm text-finhive-text">
            Week
          </button>
          <button className="px-3 py-1 rounded-full text-sm text-finhive-text">
            Month
          </button>
          <button className="px-3 py-1 rounded-full text-sm text-finhive-text">
            Year
          </button>
        </div>
      </div>

      <div className="flex items-baseline mb-6">
        <h2 className="text-3xl font-bold text-finhive-text">{formatCurrency(currentBalance)}</h2>
        <span className={`ml-2 text-sm font-medium ${percentChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
          {percentChange >= 0 ? '↑' : '↓'} {Math.abs(percentChange)}%
        </span>
      </div>

      <div className="flex items-center space-x-4 mb-4">
        <div className="flex items-center">
          <span className="w-3 h-3 rounded-full bg-finhive-primary mr-2"></span>
          <span className="text-sm text-finhive-text">Income</span>
        </div>
        <div className="flex items-center">
          <span className="w-3 h-3 rounded-full bg-gray-400 mr-2"></span>
          <span className="text-sm text-finhive-text">Expenses</span>
        </div>
      </div>

      <div className="h-40">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis dataKey="name" axisLine={false} tickLine={false} />
            <YAxis hide />
            <Tooltip 
              formatter={(value: number) => [formatCurrency(value)]}
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
            />
            <Line
              type="monotone"
              dataKey="income"
              stroke="#FF6634"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 6, fill: '#FF6634' }}
            />
            <Line
              type="monotone"
              dataKey="expenses"
              stroke="#999"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 6, fill: '#999' }}
              strokeDasharray="4 4"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default BalanceChart;
