
import React from 'react';
import { BarChart, Gift, FileText, ArrowDownRight, PieChart, Users } from 'lucide-react';

const QuickLinks = () => {
  return (
    <div className="rounded-lg bg-white p-6 border border-finhive-border">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium">Quick Links</h3>
        <button className="text-sm text-finhive-muted hover:text-finhive-primary">Customize</button>
      </div>
      
      <div className="grid grid-cols-6 gap-2">
        <div className="quick-link-item">
          <BarChart className="w-6 h-6 text-finhive-text mb-1" />
          <span className="text-xs text-finhive-text">Analytics</span>
        </div>
        
        <div className="quick-link-item">
          <Gift className="w-6 h-6 text-finhive-text mb-1" />
          <span className="text-xs text-finhive-text">Save Box</span>
        </div>
        
        <div className="quick-link-item active">
          <FileText className="w-6 h-6 text-finhive-primary mb-1" />
          <span className="text-xs text-finhive-primary">Invoicing</span>
        </div>
        
        <div className="quick-link-item">
          <ArrowDownRight className="w-6 h-6 text-finhive-text mb-1" />
          <span className="text-xs text-finhive-text">Withdraw</span>
        </div>
        
        <div className="quick-link-item">
          <PieChart className="w-6 h-6 text-finhive-text mb-1" />
          <span className="text-xs text-finhive-text">Insights</span>
        </div>
        
        <div className="quick-link-item">
          <Users className="w-6 h-6 text-finhive-text mb-1" />
          <span className="text-xs text-finhive-text">Contacts</span>
        </div>
      </div>
    </div>
  );
};

export default QuickLinks;
