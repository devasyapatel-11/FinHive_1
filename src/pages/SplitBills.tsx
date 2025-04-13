import React from 'react';
import PageTemplate from './PageTemplate';
import { formatIndianCurrency } from '@/services/financeService';
import { Users, Receipt, Plus, UserPlus } from 'lucide-react';

const SplitBills = () => {
  // Sample data for demonstration
  const groups = [
    { id: 1, name: 'Roommates', members: 4, totalDue: 2500, lastActivity: '2025-04-10' },
    { id: 2, name: 'College Trip', members: 6, totalDue: 4200, lastActivity: '2025-04-05' },
  ];

  return (
    <PageTemplate title="Split Bills">
      <div className="space-y-6">
        {/* Groups section */}
        <div className="bg-white p-6 rounded-lg border border-finhive-border">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-medium">Your Groups</h2>
            <button className="px-4 py-2 bg-finhive-primary text-white rounded-md text-sm flex items-center gap-2">
              <Plus size={16} />
              <span>Create Group</span>
            </button>
          </div>
          
          {groups.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {groups.map((group) => (
                <div key={group.id} className="p-4 rounded-lg border border-finhive-border hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Users className="text-finhive-primary" size={20} />
                        <span className="font-medium">{group.name}</span>
                      </div>
                      <div className="text-sm text-finhive-muted mb-2">{group.members} members</div>
                      <div className="text-sm text-finhive-muted mb-4">Last activity: {new Date(group.lastActivity).toLocaleDateString('en-IN')}</div>
                      <div className="text-lg font-bold text-finhive-text">
                        You owe: {formatIndianCurrency(group.totalDue)}
                      </div>
                    </div>
                    <button className="px-3 py-1 bg-finhive-accent/20 text-finhive-primary rounded text-sm">
                      View
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-full bg-finhive-accent/30 flex items-center justify-center mx-auto mb-4">
                <Users className="text-finhive-primary" size={24} />
              </div>
              <h2 className="text-xl font-medium text-finhive-text mb-2">No Groups Yet</h2>
              <p className="text-finhive-muted max-w-md mx-auto mb-6">
                Create a group to split bills with friends, roommates, or classmates.
              </p>
              <button className="px-4 py-2 bg-finhive-primary text-white rounded-md text-sm flex items-center gap-2 mx-auto">
                <Plus size={16} />
                <span>Create Group</span>
              </button>
            </div>
          )}
        </div>

        {/* Recent Expenses */}
        <div className="bg-white p-6 rounded-lg border border-finhive-border">
          <h2 className="text-lg font-medium mb-6">Recent Expenses</h2>
          
          <div className="space-y-4">
            <div className="p-4 rounded-lg border border-finhive-border">
              <div className="flex justify-between items-start">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-finhive-accent/30 flex items-center justify-center">
                    <Receipt className="text-finhive-primary" size={20} />
                  </div>
                  <div>
                    <div className="font-medium">Dinner at Taj Hotel</div>
                    <div className="text-sm text-finhive-muted">Paid by Rahul • 10 Apr 2025</div>
                    <div className="mt-2">
                      <span className="px-2 py-1 rounded-full text-xs bg-finhive-primary/10 text-finhive-primary">
                        Roommates
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-finhive-text">{formatIndianCurrency(1200)}</div>
                  <div className="text-sm text-red-500">You owe {formatIndianCurrency(300)}</div>
                </div>
              </div>
            </div>
            
            <div className="p-4 rounded-lg border border-finhive-border">
              <div className="flex justify-between items-start">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-finhive-accent/30 flex items-center justify-center">
                    <Receipt className="text-finhive-primary" size={20} />
                  </div>
                  <div>
                    <div className="font-medium">Bus Tickets</div>
                    <div className="text-sm text-finhive-muted">Paid by you • 5 Apr 2025</div>
                    <div className="mt-2">
                      <span className="px-2 py-1 rounded-full text-xs bg-finhive-primary/10 text-finhive-primary">
                        College Trip
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-finhive-text">{formatIndianCurrency(3000)}</div>
                  <div className="text-sm text-green-500">You are owed {formatIndianCurrency(2500)}</div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-6 text-center">
            <button className="px-4 py-2 text-finhive-primary font-medium">
              View All Expenses
            </button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white p-6 rounded-lg border border-finhive-border">
          <h2 className="text-lg font-medium mb-6">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <button className="p-4 rounded-lg border border-finhive-border hover:bg-finhive-accent/10 transition-colors text-center">
              <div className="w-10 h-10 rounded-full bg-finhive-accent/30 flex items-center justify-center mx-auto mb-2">
                <Receipt className="text-finhive-primary" size={20} />
              </div>
              <div className="font-medium">Add Expense</div>
            </button>
            <button className="p-4 rounded-lg border border-finhive-border hover:bg-finhive-accent/10 transition-colors text-center">
              <div className="w-10 h-10 rounded-full bg-finhive-accent/30 flex items-center justify-center mx-auto mb-2">
                <UserPlus className="text-finhive-primary" size={20} />
              </div>
              <div className="font-medium">Add Friend</div>
            </button>
            <button className="p-4 rounded-lg border border-finhive-border hover:bg-finhive-accent/10 transition-colors text-center">
              <div className="w-10 h-10 rounded-full bg-finhive-accent/30 flex items-center justify-center mx-auto mb-2">
                <Users className="text-finhive-primary" size={20} />
              </div>
              <div className="font-medium">Create Group</div>
            </button>
          </div>
        </div>
      </div>
    </PageTemplate>
  );
};

export default SplitBills;
