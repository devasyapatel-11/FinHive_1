
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';
import { formatIndianCurrency } from '@/services/financeService';

interface ExpensesBreakdownProps {
  total: number;
  data: {
    name: string;
    value: number;
    color: string;
  }[];
  percentage: number;
  month: string;
  onMonthChange?: (month: string) => void;
}

const ExpensesBreakdown: React.FC<ExpensesBreakdownProps> = ({ total, data, percentage, month, onMonthChange }) => {
  const formatCurrency = (value: number) => {
    return formatIndianCurrency(value);
  };

  return (
    <div className="rounded-lg bg-white p-6 border border-finhive-border">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium">Expenses breakdown</h3>
      </div>

      <div className="flex items-baseline mb-6">
        <h2 className="text-3xl font-bold text-finhive-text">{formatCurrency(total)}</h2>
      </div>

      <div className="h-56 relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Legend 
              layout="vertical" 
              verticalAlign="middle" 
              align="right"
              payload={
                data.map(item => ({
                  value: `${item.name} (${((item.value / total) * 100).toFixed(0)}%)`,
                  color: item.color,
                  type: 'circle'
                }))
              }
            />
          </PieChart>
        </ResponsiveContainer>
        
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
          <div className="text-2xl font-bold">{percentage}%</div>
          <div className="text-xs text-finhive-muted">spent for {month}</div>
        </div>
      </div>
      
      <div className="mt-2">
        <div className="relative">
          <select 
            className="w-full px-3 py-2 rounded-md border border-finhive-border appearance-none text-center text-sm focus:outline-none focus:ring-2 focus:ring-finhive-primary/50"
            value={month}
            onChange={(e) => {
              if (onMonthChange) {
                onMonthChange(e.target.value);
              }
            }}
          >
            {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
            <svg className="h-4 w-4 text-finhive-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpensesBreakdown;
