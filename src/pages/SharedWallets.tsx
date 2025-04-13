import React from 'react';
import PageTemplate from './PageTemplate';
import { formatIndianCurrency } from '@/services/financeService';
import { Wallet, Users, Plus, ArrowUpRight, ArrowDownLeft } from 'lucide-react';

const SharedWallets = () => {
  // Sample data for demonstration
  const wallets = [
    { id: 1, name: 'Apartment Fund', members: 3, balance: 15000, lastActivity: '2025-04-08' },
    { id: 2, name: 'Trip Savings', members: 5, balance: 25000, lastActivity: '2025-04-01' },
  ];

  // Sample transactions
  const transactions = [
    { id: 1, walletId: 1, type: 'deposit', amount: 5000, by: 'You', date: '2025-04-08', description: 'Monthly contribution' },
    { id: 2, walletId: 1, type: 'withdraw', amount: 2000, by: 'Rahul', date: '2025-04-06', description: 'Electricity bill' },
    { id: 3, walletId: 2, type: 'deposit', amount: 10000, by: 'Priya', date: '2025-04-01', description: 'Initial deposit' },
  ];

  return (
    <PageTemplate title="Shared Wallets">
      <div className="space-y-6">
        {/* Wallets section */}
        <div className="bg-white p-6 rounded-lg border border-finhive-border">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-medium">Your Shared Wallets</h2>
            <button className="px-4 py-2 bg-finhive-primary text-white rounded-md text-sm flex items-center gap-2">
              <Plus size={16} />
              <span>Create Wallet</span>
            </button>
          </div>
          
          {wallets.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {wallets.map((wallet) => (
                <div key={wallet.id} className="p-4 rounded-lg border border-finhive-border hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Wallet className="text-finhive-primary" size={20} />
                        <span className="font-medium">{wallet.name}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-finhive-muted mb-2">
                        <Users size={16} />
                        <span>{wallet.members} members</span>
                      </div>
                      <div className="text-sm text-finhive-muted mb-4">Last activity: {new Date(wallet.lastActivity).toLocaleDateString('en-IN')}</div>
                      <div className="text-lg font-bold text-finhive-text">
                        Balance: {formatIndianCurrency(wallet.balance)}
                      </div>
                    </div>
                    <button className="px-3 py-1 bg-finhive-accent/20 text-finhive-primary rounded text-sm">
                      Manage
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-full bg-finhive-accent/30 flex items-center justify-center mx-auto mb-4">
                <Wallet className="text-finhive-primary" size={24} />
              </div>
              <h2 className="text-xl font-medium text-finhive-text mb-2">No Shared Wallets Yet</h2>
              <p className="text-finhive-muted max-w-md mx-auto mb-6">
                Create a shared wallet to manage funds with friends, roommates, or family.
              </p>
              <button className="px-4 py-2 bg-finhive-primary text-white rounded-md text-sm flex items-center gap-2 mx-auto">
                <Plus size={16} />
                <span>Create Wallet</span>
              </button>
            </div>
          )}
        </div>

        {/* Recent Transactions */}
        <div className="bg-white p-6 rounded-lg border border-finhive-border">
          <h2 className="text-lg font-medium mb-6">Recent Transactions</h2>
          
          <div className="space-y-4">
            {transactions.map(transaction => {
              const wallet = wallets.find(w => w.id === transaction.walletId);
              return (
                <div key={transaction.id} className="p-4 rounded-lg border border-finhive-border">
                  <div className="flex justify-between items-start">
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-full ${transaction.type === 'deposit' ? 'bg-green-100' : 'bg-red-100'} flex items-center justify-center`}>
                        {transaction.type === 'deposit' ? 
                          <ArrowDownLeft className="text-green-600" size={20} /> : 
                          <ArrowUpRight className="text-red-600" size={20} />
                        }
                      </div>
                      <div>
                        <div className="font-medium">{transaction.description}</div>
                        <div className="text-sm text-finhive-muted">By {transaction.by} u2022 {new Date(transaction.date).toLocaleDateString('en-IN')}</div>
                        <div className="mt-2">
                          <span className="px-2 py-1 rounded-full text-xs bg-finhive-primary/10 text-finhive-primary">
                            {wallet?.name}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-lg font-bold ${transaction.type === 'deposit' ? 'text-green-600' : 'text-red-600'}`}>
                        {transaction.type === 'deposit' ? '+' : '-'} {formatIndianCurrency(transaction.amount)}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="mt-6 text-center">
            <button className="px-4 py-2 text-finhive-primary font-medium">
              View All Transactions
            </button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white p-6 rounded-lg border border-finhive-border">
          <h2 className="text-lg font-medium mb-6">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button className="p-4 rounded-lg border border-finhive-border hover:bg-finhive-accent/10 transition-colors text-center">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-2">
                <ArrowDownLeft className="text-green-600" size={20} />
              </div>
              <div className="font-medium">Add Funds</div>
            </button>
            <button className="p-4 rounded-lg border border-finhive-border hover:bg-finhive-accent/10 transition-colors text-center">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-2">
                <ArrowUpRight className="text-red-600" size={20} />
              </div>
              <div className="font-medium">Withdraw</div>
            </button>
            <button className="p-4 rounded-lg border border-finhive-border hover:bg-finhive-accent/10 transition-colors text-center">
              <div className="w-10 h-10 rounded-full bg-finhive-accent/30 flex items-center justify-center mx-auto mb-2">
                <Users className="text-finhive-primary" size={20} />
              </div>
              <div className="font-medium">Invite Member</div>
            </button>
            <button className="p-4 rounded-lg border border-finhive-border hover:bg-finhive-accent/10 transition-colors text-center">
              <div className="w-10 h-10 rounded-full bg-finhive-accent/30 flex items-center justify-center mx-auto mb-2">
                <Wallet className="text-finhive-primary" size={20} />
              </div>
              <div className="font-medium">New Wallet</div>
            </button>
          </div>
        </div>
      </div>
    </PageTemplate>
  );
};

export default SharedWallets;
