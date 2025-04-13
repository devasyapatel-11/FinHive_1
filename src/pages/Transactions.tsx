import React, { useState, useEffect } from 'react';
import PageTemplate from './PageTemplate';
import { useAuth } from '@/hooks/useAuth';
import { formatIndianCurrency } from '@/services/financeService';
import { getRecentTransactions, addTransaction, deleteTransaction } from '@/services/financeService';
import { X, Plus, ArrowUp, ArrowDown, Trash2, AlertCircle } from 'lucide-react';
import { useLocation } from 'react-router-dom';

const Transactions = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTransaction, setNewTransaction] = useState({
    type: 'expense',
    amount: '',
    description: '',
    category: '',
    date: new Date().toISOString().split('T')[0]
  });
  const [transactionToDelete, setTransactionToDelete] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [deleteSuccess, setDeleteSuccess] = useState('');
  
  // Check for state passed from Wallet page
  useEffect(() => {
    if (location.state) {
      const { openAddTransaction, defaultType, defaultCategory } = location.state as any;
      
      if (openAddTransaction) {
        // Pre-fill transaction form with defaults from Wallet page
        setNewTransaction(prev => ({
          ...prev,
          type: defaultType || prev.type,
          category: defaultCategory || prev.category,
          description: defaultCategory ? `${defaultCategory} payment` : prev.description
        }));
        
        // Open the modal
        setIsModalOpen(true);
      }
    }
  }, [location.state]);

  // Handle delete transaction
  const handleDeleteTransaction = async () => {
    if (!user || !transactionToDelete) return;
    
    try {
      setIsDeleting(true);
      setDeleteError('');
      setDeleteSuccess('');
      
      const success = await deleteTransaction(transactionToDelete, user.id);
      
      if (success) {
        // Remove the transaction from the local state
        setTransactions(prev => prev.filter(transaction => transaction.id !== transactionToDelete));
        setDeleteSuccess('Transaction deleted successfully');
        
        // Close the modal after a delay
        setTimeout(() => {
          setShowDeleteConfirm(false);
          setTransactionToDelete(null);
          setDeleteSuccess('');
        }, 2000);
      } else {
        setDeleteError('Failed to delete transaction. Please try again.');
      }
    } catch (error) {
      console.error('Error deleting transaction:', error);
      setDeleteError('An unexpected error occurred. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const loadTransactions = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      console.log('Loading transactions for user:', user.id);
      
      // Add a small delay to ensure the database has time to update
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Get transactions with a larger limit to ensure we get all
      const data = await getRecentTransactions(user.id, 50);
      console.log('Loaded transactions:', data);
      
      if (data && Array.isArray(data)) {
        setTransactions(data);
      } else {
        console.error('Unexpected data format:', data);
        setTransactions([]);
      }
    } catch (error) {
      console.error('Error loading transactions:', error);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };
  
  // Load transactions when component mounts or user changes
  React.useEffect(() => {
    if (user) {
      loadTransactions();
    }
  }, [user]);
  
  // Set up a refresh interval to check for new transactions
  React.useEffect(() => {
    if (!user) return;
    
    // Refresh transactions every 5 seconds
    const intervalId = setInterval(() => {
      loadTransactions();
    }, 5000);
    
    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, [user]);

  return (
    <PageTemplate title="Transactions">
      <div className="bg-white p-6 rounded-lg border border-finhive-border">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-medium">Recent Transactions</h2>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-finhive-primary text-white rounded-md text-sm flex items-center gap-2"
          >
            <Plus size={16} />
            <span>Add Transaction</span>
          </button>
        </div>
        
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-finhive-primary mx-auto"></div>
            <p className="mt-2 text-finhive-muted">Loading transactions...</p>
          </div>
        ) : transactions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-finhive-border">
                  <th className="text-left py-3 px-4 font-medium text-finhive-muted">Date</th>
                  <th className="text-left py-3 px-4 font-medium text-finhive-muted">Description</th>
                  <th className="text-left py-3 px-4 font-medium text-finhive-muted">Category</th>
                  <th className="text-right py-3 px-4 font-medium text-finhive-muted">Amount</th>
                  <th className="text-right py-3 px-4 font-medium text-finhive-muted">Actions</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((transaction) => (
                  <tr key={transaction.id} className="border-b border-finhive-border hover:bg-gray-50">
                    <td className="py-3 px-4">
                      {new Date(transaction.date).toLocaleDateString('en-IN', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </td>
                    <td className="py-3 px-4">{transaction.description || '-'}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-1 rounded-full text-xs bg-gray-100">
                        {transaction.category || 'Uncategorized'}
                      </span>
                    </td>
                    <td className={`py-3 px-4 text-right font-medium ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                      {transaction.type === 'income' ? '+' : '-'} {formatIndianCurrency(transaction.amount)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => {
                          setTransactionToDelete(transaction.id);
                          setShowDeleteConfirm(true);
                        }}
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                        title="Delete Transaction"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-full bg-finhive-accent/30 flex items-center justify-center mx-auto mb-4">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM19 19H5V5H19V19Z" fill="#FF6634"/>
                <path d="M12 17H14V7H10V9H12V17Z" fill="#FF6634"/>
              </svg>
            </div>
            <h2 className="text-xl font-medium text-finhive-text mb-2">No Transactions Yet</h2>
            <p className="text-finhive-muted max-w-md mx-auto mb-6">
              Start tracking your finances by adding your first transaction.
            </p>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 bg-finhive-primary text-white rounded-md text-sm flex items-center gap-2 mx-auto"
            >
              <Plus size={16} />
              <span>Add Transaction</span>
            </button>
          </div>
        )}
      </div>

      {/* Delete Transaction Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-md p-6 relative">
            <button 
              onClick={() => {
                setShowDeleteConfirm(false);
                setTransactionToDelete(null);
                setDeleteSuccess('');
                setDeleteError('');
              }}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
              disabled={isDeleting}
            >
              <X size={20} />
            </button>
            
            <h2 className="text-xl font-semibold mb-2">Delete Transaction</h2>
            
            {deleteSuccess ? (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
                <p className="text-green-700 text-sm">{deleteSuccess}</p>
              </div>
            ) : (
              <>
                <p className="text-gray-600 mb-6">
                  Are you sure you want to delete this transaction? This action cannot be undone.
                </p>
                
                {deleteError && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-start gap-2">
                    <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={16} />
                    <p className="text-red-700 text-sm">{deleteError}</p>
                  </div>
                )}
                
                <div className="flex space-x-3">
                  <button
                    onClick={() => {
                      setShowDeleteConfirm(false);
                      setTransactionToDelete(null);
                    }}
                    className="flex-1 py-2 px-4 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-md transition-colors"
                    disabled={isDeleting}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteTransaction}
                    className="flex-1 py-2 px-4 bg-red-500 hover:bg-red-600 text-white rounded-md transition-colors flex justify-center items-center"
                    disabled={isDeleting}
                  >
                    {isDeleting ? (
                      <>
                        <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                        Deleting...
                      </>
                    ) : (
                      'Delete Transaction'
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Add Transaction Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-md p-6 relative">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              <X size={20} />
            </button>
            
            <h2 className="text-xl font-bold mb-6">Add New Transaction</h2>
            
            <form onSubmit={async (e) => {
              e.preventDefault();
              
              if (!user) return;
              
              try {
                setLoading(true);
                
                // Validate form data
                const amountNum = parseFloat(newTransaction.amount);
                if (isNaN(amountNum)) {
                  alert('Please enter a valid amount');
                  setLoading(false);
                  return;
                }
                
                if (!newTransaction.category) {
                  alert('Please select a category');
                  setLoading(false);
                  return;
                }
                
                if (!newTransaction.description) {
                  alert('Please enter a description');
                  setLoading(false);
                  return;
                }
                
                console.log('Adding transaction with data:', {
                  ...newTransaction,
                  amount: amountNum
                });
                
                // Add transaction to database with simplified approach
                try {
                  await addTransaction(user.id, {
                    ...newTransaction,
                    amount: amountNum
                  });
                  
                  console.log('Transaction added successfully');
                  
                  // Reset form
                  setNewTransaction({
                    type: 'expense',
                    amount: '',
                    description: '',
                    category: '',
                    date: new Date().toISOString().split('T')[0]
                  });
                  
                  // Reload transactions to show the new one
                  await loadTransactions();
                  
                  alert('Transaction added successfully!');
                  setIsModalOpen(false);
                } catch (addError) {
                  console.error('Error in addTransaction:', addError);
                  alert(`Failed to add transaction: ${addError.message || 'Unknown error'}`);
                }
              } catch (error) {
                console.error('Error adding transaction:', error);
                alert(`Failed to add transaction: ${error.message || 'Please try again'}`);
              } finally {
                setLoading(false);
              }
            }}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Transaction Type</label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    className={`flex items-center justify-center gap-2 p-3 rounded-md border ${
                      newTransaction.type === 'income' 
                        ? 'border-green-500 bg-green-50 text-green-700' 
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                    onClick={() => setNewTransaction({...newTransaction, type: 'income'})}
                  >
                    <ArrowDown className={`${newTransaction.type === 'income' ? 'text-green-500' : 'text-gray-400'}`} size={18} />
                    <span>Income</span>
                  </button>
                  
                  <button
                    type="button"
                    className={`flex items-center justify-center gap-2 p-3 rounded-md border ${
                      newTransaction.type === 'expense' 
                        ? 'border-red-500 bg-red-50 text-red-700' 
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                    onClick={() => setNewTransaction({...newTransaction, type: 'expense'})}
                  >
                    <ArrowUp className={`${newTransaction.type === 'expense' ? 'text-red-500' : 'text-gray-400'}`} size={18} />
                    <span>Expense</span>
                  </button>
                </div>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₹)</label>
                <input
                  type="number"
                  value={newTransaction.amount}
                  onChange={(e) => setNewTransaction({...newTransaction, amount: e.target.value})}
                  placeholder="0.00"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-finhive-primary/50"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <input
                  type="text"
                  value={newTransaction.description}
                  onChange={(e) => setNewTransaction({...newTransaction, description: e.target.value})}
                  placeholder="e.g. Grocery shopping"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-finhive-primary/50"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={newTransaction.category}
                  onChange={(e) => setNewTransaction({...newTransaction, category: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-finhive-primary/50"
                  required
                >
                  <option value="">Select a category</option>
                  {newTransaction.type === 'income' ? (
                    <>
                      <option value="Salary">Salary</option>
                      <option value="Freelance">Freelance</option>
                      <option value="Investment">Investment</option>
                      <option value="Gift">Gift</option>
                      <option value="Other">Other</option>
                    </>
                  ) : (
                    <>
                      <option value="Food">Food</option>
                      <option value="Transport">Transport</option>
                      <option value="Rent">Rent</option>
                      <option value="Utilities">Utilities</option>
                      <option value="Entertainment">Entertainment</option>
                      <option value="Shopping">Shopping</option>
                      <option value="Healthcare">Healthcare</option>
                      <option value="Education">Education</option>
                      <option value="Travel">Travel</option>
                      <option value="Other">Other</option>
                    </>
                  )}
                </select>
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input
                  type="date"
                  value={newTransaction.date}
                  onChange={(e) => setNewTransaction({...newTransaction, date: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-finhive-primary/50"
                  required
                />
              </div>
              
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-finhive-primary text-white rounded-md hover:bg-finhive-accent"
                >
                  Add Transaction
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PageTemplate>
  );
};

export default Transactions;
