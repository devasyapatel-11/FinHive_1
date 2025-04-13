import React, { useState, useEffect } from 'react';
import PageTemplate from './PageTemplate';
import { useAuth } from '@/hooks/useAuth';
import { formatIndianCurrency, getUserAccounts, addAccount, deleteAccount } from '@/services/financeService';
import { CreditCard, Plus, X, ArrowRight, AlertCircle, Trash2, MoreVertical } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Wallet = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newAccount, setNewAccount] = useState({
    name: '',
    type: 'checking',
    balance: 0,
    card_type: '',
    last_four: '',
    monthly_fee: 0
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [accountToDelete, setAccountToDelete] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState('');

  useEffect(() => {
    const loadAccounts = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        const data = await getUserAccounts(user.id);
        setAccounts(data);
      } catch (error) {
        console.error('Error loading accounts:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadAccounts();
  }, [user]);
  
  const handleAddAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    
    if (!user) {
      setError('You must be logged in to add an account');
      return;
    }
    
    if (!newAccount.name) {
      setError('Account name is required');
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Convert balance to number
      const accountData = {
        ...newAccount,
        balance: Number(newAccount.balance),
        monthly_fee: newAccount.monthly_fee ? Number(newAccount.monthly_fee) : undefined
      };
      
      const createdAccount = await addAccount(user.id, accountData);
      
      // Add the new account to the list
      setAccounts(prev => [...prev, createdAccount]);
      
      // Reset form and show success message
      setNewAccount({
        name: '',
        type: 'checking',
        balance: 0,
        card_type: '',
        last_four: '',
        monthly_fee: 0
      });
      
      setSuccessMessage('Account added successfully!');
      
      // Close modal after a delay
      setTimeout(() => {
        setShowAddModal(false);
        setSuccessMessage('');
      }, 2000);
    } catch (error) {
      console.error('Error adding account:', error);
      setError('Failed to add account. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewAccount(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleDeleteAccount = async () => {
    if (!user || !accountToDelete) return;
    
    try {
      setIsDeleting(true);
      setDeleteSuccess('');
      
      const success = await deleteAccount(accountToDelete, user.id);
      
      if (success) {
        // Remove the account from the local state
        setAccounts(prev => prev.filter(account => account.id !== accountToDelete));
        setDeleteSuccess('Account deleted successfully');
        
        // Close the modal after a delay
        setTimeout(() => {
          setShowDeleteConfirm(false);
          setAccountToDelete(null);
          setDeleteSuccess('');
        }, 2000);
      } else {
        setError('Failed to delete account. Please try again.');
      }
    } catch (error) {
      console.error('Error deleting account:', error);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <PageTemplate title="My Wallet">
      <div className="space-y-6">
        {/* Cards section */}
        <div className="bg-white p-6 rounded-lg border border-finhive-border">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-medium">Your Cards & Accounts</h2>
            <button 
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-finhive-primary text-white rounded-md text-sm flex items-center gap-2 hover:bg-finhive-primary/90 transition-colors"
            >
              <Plus size={16} />
              <span>Add New</span>
            </button>
          </div>
          
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-finhive-primary mx-auto"></div>
              <p className="mt-2 text-finhive-muted">Loading your accounts...</p>
            </div>
          ) : accounts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {accounts.map((account) => (
                <div key={account.id} className="p-4 rounded-lg border border-finhive-border hover:shadow-md transition-shadow relative">
                  <button 
                    onClick={() => {
                      setAccountToDelete(account.id);
                      setShowDeleteConfirm(true);
                    }}
                    className="absolute top-3 right-3 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                    title="Delete Account"
                  >
                    <Trash2 size={16} />
                  </button>
                  <div className="flex items-start justify-between pr-8">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <CreditCard className="text-finhive-primary" size={20} />
                        <span className="font-medium">{account.name}</span>
                      </div>
                      <div className="text-sm text-finhive-muted mb-4">{account.type.charAt(0).toUpperCase() + account.type.slice(1)}</div>
                      <div className="text-2xl font-bold text-finhive-text">{formatIndianCurrency(account.balance)}</div>
                    </div>
                    {account.card_type && (
                      <div className="bg-gradient-to-r from-finhive-primary to-finhive-accent p-2 rounded-md text-white text-xs font-bold">
                        {account.card_type.toUpperCase()}
                      </div>
                    )}
                  </div>
                  {account.last_four && (
                    <div className="mt-4 text-sm text-finhive-muted">
                      Card ending in {account.last_four}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-full bg-finhive-accent/30 flex items-center justify-center mx-auto mb-4">
                <CreditCard className="text-finhive-primary" size={24} />
              </div>
              <h2 className="text-xl font-medium text-finhive-text mb-2">No Accounts Yet</h2>
              <p className="text-finhive-muted max-w-md mx-auto mb-6">
                Add your bank accounts and cards to track your finances in one place.
              </p>
              <button 
                onClick={() => setShowAddModal(true)}
                className="px-4 py-2 bg-finhive-primary text-white rounded-md text-sm flex items-center gap-2 mx-auto hover:bg-finhive-primary/90 transition-colors"
              >
                <Plus size={16} />
                <span>Add Account</span>
              </button>
            </div>
          )}
        </div>
        
        {/* Add Account Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg w-full max-w-md p-6 relative max-h-[90vh] overflow-y-auto">
              <button 
                onClick={() => {
                  setShowAddModal(false);
                  setError('');
                  setSuccessMessage('');
                }}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
              
              <h2 className="text-xl font-semibold mb-6">Add New Account</h2>
              
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-start gap-2">
                  <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={16} />
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}
              
              {successMessage && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
                  <p className="text-green-700 text-sm">{successMessage}</p>
                </div>
              )}
              
              <form onSubmit={handleAddAccount} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Account Name</label>
                  <input
                    type="text"
                    name="name"
                    value={newAccount.name}
                    onChange={handleInputChange}
                    placeholder="e.g. Primary Checking"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-finhive-primary/50"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Account Type</label>
                  <select
                    name="type"
                    value={newAccount.type}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-finhive-primary/50"
                  >
                    <option value="checking">Checking</option>
                    <option value="savings">Savings</option>
                    <option value="credit">Credit Card</option>
                    <option value="investment">Investment</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Current Balance</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500">₹</span>
                    </div>
                    <input
                      type="number"
                      name="balance"
                      value={newAccount.balance}
                      onChange={handleInputChange}
                      placeholder="0.00"
                      className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-finhive-primary/50"
                    />
                  </div>
                </div>
                
                {newAccount.type === 'credit' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Card Type</label>
                      <select
                        name="card_type"
                        value={newAccount.card_type}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-finhive-primary/50"
                      >
                        <option value="">Select Card Type</option>
                        <option value="visa">Visa</option>
                        <option value="mastercard">Mastercard</option>
                        <option value="rupay">RuPay</option>
                        <option value="amex">American Express</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Last 4 Digits</label>
                      <input
                        type="text"
                        name="last_four"
                        value={newAccount.last_four}
                        onChange={handleInputChange}
                        placeholder="1234"
                        maxLength={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-finhive-primary/50"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Fee (if any)</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <span className="text-gray-500">₹</span>
                        </div>
                        <input
                          type="number"
                          name="monthly_fee"
                          value={newAccount.monthly_fee}
                          onChange={handleInputChange}
                          placeholder="0.00"
                          className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-finhive-primary/50"
                        />
                      </div>
                    </div>
                  </>
                )}
                
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-2 px-4 bg-finhive-primary text-white rounded-md hover:bg-finhive-primary/90 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Adding...' : 'Add Account'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        

        {/* Quick Actions */}
        <div className="bg-white p-6 rounded-lg border border-finhive-border">
          <h2 className="text-lg font-medium mb-6">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button 
              onClick={() => setShowAddModal(true)}
              className="p-4 rounded-lg border border-finhive-border hover:bg-finhive-accent/10 transition-colors text-center"
            >
              <div className="w-10 h-10 rounded-full bg-finhive-accent/30 flex items-center justify-center mx-auto mb-2">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M19 14V6C19 4.9 18.1 4 17 4H3C1.9 4 1 4.9 1 6V14C1 15.1 1.9 16 3 16H17C18.1 16 19 15.1 19 14ZM17 14H3V6H17V14ZM10 7C8.34 7 7 8.34 7 10C7 11.66 8.34 13 10 13C11.66 13 13 11.66 13 10C13 8.34 11.66 7 10 7ZM23 7V18C23 19.1 22.1 20 21 20H4C4 19 4 19 4 18H21V7C22.1 7 22.1 7 23 7Z" fill="#FF6634"/>
                </svg>
              </div>
              <div className="font-medium">Add Money</div>
            </button>
            <button 
              onClick={() => navigate('/transactions', { state: { openAddTransaction: true, defaultType: 'expense', defaultCategory: 'Bills' } })}
              className="p-4 rounded-lg border border-finhive-border hover:bg-finhive-accent/10 transition-colors text-center"
            >
              <div className="w-10 h-10 rounded-full bg-finhive-accent/30 flex items-center justify-center mx-auto mb-2">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9.5 19H8V17H9.5V19ZM13 19H11.5V17H13V19ZM16.5 19H15V17H16.5V19ZM19 9.5V3H3V9.5H19ZM19 14.5V11H3V14.5H19ZM19 19.5V16H3V19.5H19ZM21 1.5C21.83 1.5 22.5 2.17 22.5 3V21C22.5 21.83 21.83 22.5 21 22.5H3C2.17 22.5 1.5 21.83 1.5 21V3C1.5 2.17 2.17 1.5 3 1.5H21Z" fill="#FF6634"/>
                </svg>
              </div>
              <div className="font-medium">Pay Bills</div>
            </button>
            <button 
              onClick={() => navigate('/transactions', { state: { openAddTransaction: true, defaultType: 'expense', defaultCategory: 'Transfer' } })}
              className="p-4 rounded-lg border border-finhive-border hover:bg-finhive-accent/10 transition-colors text-center"
            >
              <div className="w-10 h-10 rounded-full bg-finhive-accent/30 flex items-center justify-center mx-auto mb-2">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17 12H7V14H17V12ZM19 3H5C3.89 3 3 3.9 3 5V19C3 20.1 3.89 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM19 19H5V5H19V19ZM14 7H7V9H14V7Z" fill="#FF6634"/>
                </svg>
              </div>
              <div className="font-medium">Send Money</div>
            </button>
            <button 
              onClick={() => navigate('/transactions', { state: { openAddTransaction: true, defaultType: 'income', defaultCategory: 'Transfer' } })}
              className="p-4 rounded-lg border border-finhive-border hover:bg-finhive-accent/10 transition-colors text-center"
            >
              <div className="w-10 h-10 rounded-full bg-finhive-accent/30 flex items-center justify-center mx-auto mb-2">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M21 18V19C21 20.1 20.1 21 19 21H5C3.89 21 3 20.1 3 19V5C3 3.9 3.89 3 5 3H19C20.1 3 21 3.9 21 5V6H12C10.89 6 10 6.9 10 8V16C10 17.1 10.89 18 12 18H21ZM12 16H22V8H12V16ZM16 13.5C15.17 13.5 14.5 12.83 14.5 12C14.5 11.17 15.17 10.5 16 10.5C16.83 10.5 17.5 11.17 17.5 12C17.5 12.83 16.83 13.5 16 13.5Z" fill="#FF6634"/>
                </svg>
              </div>
              <div className="font-medium">Request Money</div>
            </button>
          </div>
        </div>

        {/* Delete Account Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg w-full max-w-md p-6 relative">
              <button 
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setAccountToDelete(null);
                  setDeleteSuccess('');
                }}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
                disabled={isDeleting}
              >
                <X size={20} />
              </button>
              
              <h2 className="text-xl font-semibold mb-2">Delete Account</h2>
              
              {deleteSuccess ? (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
                  <p className="text-green-700 text-sm">{deleteSuccess}</p>
                </div>
              ) : (
                <>
                  <p className="text-gray-600 mb-6">
                    Are you sure you want to delete this account? This action cannot be undone.
                  </p>
                  
                  {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-start gap-2">
                      <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={16} />
                      <p className="text-red-700 text-sm">{error}</p>
                    </div>
                  )}
                  
                  <div className="flex space-x-3">
                    <button
                      onClick={() => {
                        setShowDeleteConfirm(false);
                        setAccountToDelete(null);
                      }}
                      className="flex-1 py-2 px-4 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-md transition-colors"
                      disabled={isDeleting}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleDeleteAccount}
                      className="flex-1 py-2 px-4 bg-red-500 hover:bg-red-600 text-white rounded-md transition-colors flex justify-center items-center"
                      disabled={isDeleting}
                    >
                      {isDeleting ? (
                        <>
                          <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                          Deleting...
                        </>
                      ) : (
                        'Delete Account'
                      )}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </PageTemplate>
  );
};

export default Wallet;
