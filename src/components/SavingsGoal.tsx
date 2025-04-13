
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { formatIndianCurrency } from '@/services/financeService';

interface SavingsGoalProps {
  title: string;
  currentAmount: number;
  targetAmount: number;
  percentComplete: number;
  icon: React.ReactNode;
}

const SavingsGoal: React.FC<SavingsGoalProps> = ({
  title,
  currentAmount,
  targetAmount,
  percentComplete,
  icon
}) => {
  const formatCurrency = (value: number) => {
    return formatIndianCurrency(value);
  };

  return (
    <div className="p-4 rounded-lg bg-white border border-finhive-border">
      <div className="flex items-center mb-2">
        <div className="mr-3 bg-finhive-accent/30 p-2 rounded">
          {icon}
        </div>
        <div>
          <h3 className="font-medium">{title}</h3>
          <div className="text-finhive-primary font-medium">{formatCurrency(currentAmount)}</div>
        </div>
      </div>
      
      <Progress value={percentComplete} className="h-2 mb-2" />
      
      <div className="flex justify-between text-xs text-finhive-muted">
        <span>Target: {percentComplete}% achieved</span>
        <span>Goal: {formatCurrency(targetAmount)}</span>
      </div>
    </div>
  );
};

export default SavingsGoal;
