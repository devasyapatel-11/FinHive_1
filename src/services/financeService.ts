import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

// Type definitions for our service
type Account = Database['public']['Tables']['accounts']['Row'];
type Transaction = Database['public']['Tables']['transactions']['Row'];
type MonthlySummary = Database['public']['Tables']['monthly_summaries']['Row'];
type SavingsGoal = Database['public']['Tables']['savings_goals']['Row'];
type CurrencyHolding = Database['public']['Tables']['currency_holdings']['Row'];
type Contact = Database['public']['Tables']['contacts']['Row'];

// Format currency in Indian Rupees
export const formatIndianCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2
  }).format(amount);
};

// Calculate percentage
export const calculatePercentage = (current: number, target: number): number => {
  if (target === 0) return 0;
  return Math.round((current / target) * 100);
};

// Get user profile - using localStorage for reliability
export const getUserProfile = async (userId: string) => {
  try {
    // First try to get from localStorage
    const profileJSON = localStorage.getItem('finhive_user_profile');
    if (profileJSON) {
      const profile = JSON.parse(profileJSON);
      if (profile.id === userId) {
        return profile;
      }
    }
    
    // Fallback to Supabase
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching profile from Supabase:', error);
      return null;
    }
    
    if (data) {
      // Store in localStorage for future use
      localStorage.setItem('finhive_user_profile', JSON.stringify(data));
      return data;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting user profile:', error);
    return null;
  }
};

// Get user accounts - using localStorage for reliability
export const getUserAccounts = async (userId: string): Promise<Account[]> => {
  try {
    // First try to get from localStorage
    const accountsJSON = localStorage.getItem('finhive_accounts');
    if (accountsJSON) {
      const allAccounts: Account[] = JSON.parse(accountsJSON);
      const userAccounts = allAccounts.filter(account => account.user_id === userId);
      
      if (userAccounts.length > 0) {
        console.log(`Retrieved ${userAccounts.length} accounts from localStorage`);
        return userAccounts;
      }
    }
    
    // Fallback to Supabase
    try {
      const { data, error } = await supabase
        .from('accounts')
        .select('*')
        .eq('user_id', userId);

      if (!error && data && data.length > 0) {
        // Store in localStorage for future use
        const existingAccountsJSON = localStorage.getItem('finhive_accounts');
        const existingAccounts: Account[] = existingAccountsJSON ? JSON.parse(existingAccountsJSON) : [];
        
        // Filter out any existing accounts for this user
        const otherAccounts = existingAccounts.filter(account => account.user_id !== userId);
        
        // Add the new accounts
        const updatedAccounts = [...otherAccounts, ...data];
        localStorage.setItem('finhive_accounts', JSON.stringify(updatedAccounts));
        
        return data;
      }
      
      return [];
    } catch (supabaseError) {
      console.log('Supabase error getting accounts (ignored):', supabaseError);
      return [];
    }
  } catch (error) {
    console.error('Error getting accounts:', error);
    return [];
  }
};

// Delete an account - using localStorage for reliability
export const deleteAccount = async (accountId: string, userId: string): Promise<boolean> => {
  try {
    // First remove from localStorage
    const accountsJSON = localStorage.getItem('finhive_accounts');
    if (accountsJSON) {
      const accounts: Account[] = JSON.parse(accountsJSON);
      const updatedAccounts = accounts.filter(account => account.id !== accountId);
      localStorage.setItem('finhive_accounts', JSON.stringify(updatedAccounts));
    }
    
    // Then try to remove from Supabase (but don't block on it)
    try {
      const { error } = await supabase
        .from('accounts')
        .delete()
        .eq('id', accountId)
        .eq('user_id', userId);
      
      if (error) {
        console.error('Error deleting account from Supabase:', error);
        // Continue anyway since we removed from localStorage
      }
    } catch (supabaseError) {
      console.error('Supabase error deleting account (ignored):', supabaseError);
    }
    
    return true;
  } catch (error) {
    console.error('Error deleting account:', error);
    return false;
  }
};

// Delete a transaction - using localStorage for reliability
export const deleteTransaction = async (transactionId: string, userId: string): Promise<boolean> => {
  try {
    // First remove from localStorage
    const transactionsJSON = localStorage.getItem('finhive_transactions');
    if (transactionsJSON) {
      const transactions = JSON.parse(transactionsJSON);
      const updatedTransactions = transactions.filter(transaction => transaction.id !== transactionId);
      localStorage.setItem('finhive_transactions', JSON.stringify(updatedTransactions));
    }
    
    // Then try to remove from Supabase (but don't block on it)
    try {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', transactionId)
        .eq('user_id', userId);
      
      if (error) {
        console.error('Error deleting transaction from Supabase:', error);
        // Continue anyway since we removed from localStorage
      }
    } catch (supabaseError) {
      console.error('Supabase error deleting transaction (ignored):', supabaseError);
    }
    
    return true;
  } catch (error) {
    console.error('Error deleting transaction:', error);
    return false;
  }
};

// Save a receipt - using localStorage for reliability
export const saveReceipt = async (
  userId: string,
  receipt: {
    title: string;
    amount: number;
    date: string;
    category: string;
    notes: string;
    file: File;
  }
): Promise<any> => {
  try {
    // Convert file to base64 for localStorage storage
    const fileBase64 = await fileToBase64(receipt.file);
    
    // Create a new receipt object
    const newReceipt = {
      id: `receipt_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      user_id: userId,
      title: receipt.title,
      amount: receipt.amount,
      date: receipt.date,
      category: receipt.category || '',
      notes: receipt.notes || '',
      fileName: receipt.file.name,
      fileType: receipt.file.type,
      fileSize: receipt.file.size,
      fileUrl: fileBase64, // Store base64 in localStorage
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    // First save to localStorage
    const receiptsJSON = localStorage.getItem('finhive_receipts');
    const existingReceipts = receiptsJSON ? JSON.parse(receiptsJSON) : [];
    existingReceipts.unshift(newReceipt); // Add to beginning of array
    localStorage.setItem('finhive_receipts', JSON.stringify(existingReceipts));
    
    // Then try to save to Supabase (but don't block on it)
    // In a real app, you would upload the file to storage and save metadata to database
    try {
      // For demo purposes, we'll just save metadata to Supabase
      // In a real app, you'd upload the file to storage first
      const { error } = await supabase
        .from('receipts')
        .insert([{
          user_id: userId,
          title: receipt.title,
          amount: receipt.amount,
          date: receipt.date,
          category: receipt.category || '',
          notes: receipt.notes || '',
          file_name: receipt.file.name,
          file_type: receipt.file.type,
          file_size: receipt.file.size,
          // In a real app, this would be the storage URL
          file_url: `https://example.com/receipts/${userId}/${Date.now()}_${receipt.file.name}`
        }]);
      
      if (error) {
        console.error('Error saving receipt to Supabase:', error);
        // Continue anyway since we saved to localStorage
      }
    } catch (supabaseError) {
      console.error('Supabase error saving receipt (ignored):', supabaseError);
    }
    
    return newReceipt;
  } catch (error) {
    console.error('Error saving receipt:', error);
    throw new Error('Failed to save receipt');
  }
};

// Get receipts - using localStorage for reliability
export const getReceipts = async (userId: string): Promise<any[]> => {
  try {
    // First try to get from localStorage
    const receiptsJSON = localStorage.getItem('finhive_receipts');
    if (receiptsJSON) {
      const allReceipts = JSON.parse(receiptsJSON);
      const userReceipts = allReceipts.filter(receipt => receipt.user_id === userId);
      
      if (userReceipts.length > 0) {
        console.log(`Retrieved ${userReceipts.length} receipts from localStorage`);
        return userReceipts;
      }
    }
    
    // Fallback to Supabase
    try {
      const { data, error } = await supabase
        .from('receipts')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        // Store in localStorage for future use
        const existingReceiptsJSON = localStorage.getItem('finhive_receipts');
        const existingReceipts = existingReceiptsJSON ? JSON.parse(existingReceiptsJSON) : [];
        
        // Filter out any existing receipts for this user
        const otherReceipts = existingReceipts.filter(receipt => receipt.user_id !== userId);
        
        // Add the new receipts
        const updatedReceipts = [...otherReceipts, ...data];
        localStorage.setItem('finhive_receipts', JSON.stringify(updatedReceipts));
        
        return data;
      }
      
      return [];
    } catch (supabaseError) {
      console.log('Supabase error getting receipts (ignored):', supabaseError);
      return [];
    }
  } catch (error) {
    console.error('Error getting receipts:', error);
    return [];
  }
};

// Delete a receipt - using localStorage for reliability
export const deleteReceipt = async (receiptId: string, userId: string): Promise<boolean> => {
  try {
    // First remove from localStorage
    const receiptsJSON = localStorage.getItem('finhive_receipts');
    if (receiptsJSON) {
      const receipts = JSON.parse(receiptsJSON);
      const updatedReceipts = receipts.filter(receipt => receipt.id !== receiptId);
      localStorage.setItem('finhive_receipts', JSON.stringify(updatedReceipts));
    }
    
    // Then try to remove from Supabase (but don't block on it)
    try {
      const { error } = await supabase
        .from('receipts')
        .delete()
        .eq('id', receiptId)
        .eq('user_id', userId);
      
      if (error) {
        console.error('Error deleting receipt from Supabase:', error);
        // Continue anyway since we removed from localStorage
      }
    } catch (supabaseError) {
      console.error('Supabase error deleting receipt (ignored):', supabaseError);
    }
    
    return true;
  } catch (error) {
    console.error('Error deleting receipt:', error);
    return false;
  }
};

// Helper function to convert File to base64
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

// Add a new account - using localStorage for reliability
export const addAccount = async (
  userId: string,
  account: {
    name: string;
    type: string;
    balance: number;
    card_type?: string;
    last_four?: string;
    monthly_fee?: number;
  }
): Promise<Account> => {
  try {
    // Create a new account object
    const newAccount: Account = {
      id: `account_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      user_id: userId,
      name: account.name,
      type: account.type,
      balance: account.balance,
      card_type: account.card_type || null,
      last_four: account.last_four || null,
      monthly_fee: account.monthly_fee || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    // First save to localStorage
    const accountsJSON = localStorage.getItem('finhive_accounts');
    const existingAccounts: Account[] = accountsJSON ? JSON.parse(accountsJSON) : [];
    existingAccounts.push(newAccount);
    localStorage.setItem('finhive_accounts', JSON.stringify(existingAccounts));
    
    // Then try to save to Supabase (but don't block on it)
    try {
      const { error } = await supabase
        .from('accounts')
        .insert([{
          ...newAccount,
          id: undefined // Let Supabase generate the ID
        }]);
      
      if (error) {
        console.error('Error saving account to Supabase:', error);
        // Continue anyway since we saved to localStorage
      }
    } catch (supabaseError) {
      console.error('Supabase error adding account (ignored):', supabaseError);
    }
    
    return newAccount;
  } catch (error) {
    console.error('Error adding account:', error);
    throw new Error('Failed to add account');
  }
};

// Get user's primary account - using localStorage for reliability
export const getPrimaryAccount = async (userId: string): Promise<Account | null> => {
  try {
    // First try to get from localStorage
    const accountsJSON = localStorage.getItem('finhive_accounts');
    if (accountsJSON) {
      const allAccounts: Account[] = JSON.parse(accountsJSON);
      // Find the first checking account for this user
      const primaryAccount = allAccounts.find(account => 
        account.user_id === userId && account.type === 'checking'
      );
      
      if (primaryAccount) {
        console.log('Retrieved primary account from localStorage');
        return primaryAccount;
      }
    }
    
    // Fallback to Supabase
    try {
      const { data, error } = await supabase
        .from('accounts')
        .select('*')
        .eq('user_id', userId)
        .eq('type', 'checking')
        .limit(1)
        .single();

      if (!error && data) {
        // Store in localStorage (if not already there)
        const existingAccountsJSON = localStorage.getItem('finhive_accounts');
        const existingAccounts: Account[] = existingAccountsJSON ? JSON.parse(existingAccountsJSON) : [];
        
        // Check if this account already exists in localStorage
        const accountExists = existingAccounts.some(account => account.id === data.id);
        
        if (!accountExists) {
          // Add the new account
          existingAccounts.push(data);
          localStorage.setItem('finhive_accounts', JSON.stringify(existingAccounts));
        }
        
        return data;
      }
    } catch (supabaseError) {
      if (supabaseError.code !== 'PGRST116') { // PGRST116 is the error code for no rows returned
        console.log('Supabase error getting primary account (ignored):', supabaseError);
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error getting primary account:', error);
    return null;
  }
};

// Get monthly summaries for balance chart - using localStorage for reliability
export const getMonthlySummaries = async (userId: string): Promise<MonthlySummary[]> => {
  try {
    // First, try to calculate summaries from localStorage transactions
    const transactionsJSON = localStorage.getItem('finhive_transactions') || '[]';
    const allTransactions: Array<{
      id: string;
      user_id: string;
      amount: number;
      type: string;
      category: string;
      description: string;
      date: string;
    }> = JSON.parse(transactionsJSON);
    
    // Filter by user ID
    const userTransactions = allTransactions.filter(t => t.user_id === userId);
    
    if (userTransactions.length > 0) {
      console.log(`Calculating monthly summaries from ${userTransactions.length} local transactions`);
      
      // Group transactions by month and year
      const summariesByMonth = {};
      
      userTransactions.forEach(transaction => {
        // Extract month and year from the date
        const date = new Date(transaction.date);
        const month = date.toLocaleString('en-US', { month: 'short' });
        const year = date.getFullYear();
        const key = `${month}-${year}`;
        
        // Initialize if not exists
        if (!summariesByMonth[key]) {
          summariesByMonth[key] = {
            id: `summary_${month}_${year}_${userId}`,
            user_id: userId,
            month,
            year,
            income: 0,
            expenses: 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
        }
        
        // Add to the appropriate total
        if (transaction.type === 'income') {
          summariesByMonth[key].income += Number(transaction.amount);
        } else if (transaction.type === 'expense') {
          summariesByMonth[key].expenses += Number(transaction.amount);
        }
      });
      
      // Convert to array with proper typing
      const summaries: MonthlySummary[] = Object.values(summariesByMonth);
      
      // If we have summaries, return them
      if (summaries.length > 0) {
        return summaries;
      }
    }
    
    // Fallback to Supabase if no local transactions
    try {
      const { data, error } = await supabase
        .from('monthly_summaries')
        .select('*')
        .eq('user_id', userId)
        .order('year', { ascending: true })
        .order('month', { ascending: true });
    
      if (!error && data && data.length > 0) {
        return data;
      }
    } catch (supabaseError) {
      console.log('Supabase error getting monthly summaries (ignored):', supabaseError);
    }
    
    // Return empty array if nothing found
    return [];
  } catch (error) {
    console.error('Error getting monthly summaries:', error);
    return [];
  }
};

// Get savings goals
export const getSavingsGoals = async (userId: string): Promise<SavingsGoal[]> => {
  const { data, error } = await supabase
    .from('savings_goals')
    .select('*')
    .eq('user_id', userId);

  if (error) throw error;
  return data || [];
};

// Get currency holdings
export const getCurrencyHoldings = async (userId: string): Promise<CurrencyHolding[]> => {
  const { data, error } = await supabase
    .from('currency_holdings')
    .select('*')
    .eq('user_id', userId);

  if (error) throw error;
  return data || [];
};

// Get recent transactions - using localStorage for reliability
export const getRecentTransactions = async (userId: string, limit = 5): Promise<any[]> => {
  try {
    // First try to get from localStorage
    const transactionsJSON = localStorage.getItem('finhive_transactions') || '[]';
    const allTransactions = JSON.parse(transactionsJSON);
    
    // Filter by user ID
    const userTransactions = allTransactions.filter(t => t.user_id === userId);
    
    // Sort by created_at (newest first)
    userTransactions.sort((a, b) => {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
    
    // Apply limit
    const limitedTransactions = userTransactions.slice(0, limit);
    
    console.log(`Found ${limitedTransactions.length} transactions in localStorage for user ${userId}`);
    
    // If we have transactions in localStorage, return them
    if (limitedTransactions.length > 0) {
      return limitedTransactions;
    }
    
    // As a fallback, try to get from Supabase
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (!error && data && data.length > 0) {
        console.log('Retrieved transactions from Supabase:', data.length);
        
        // Save to localStorage for future use
        localStorage.setItem('finhive_transactions', JSON.stringify(data));
        
        return data;
      }
    } catch (supabaseError) {
      console.log('Supabase error (ignored):', supabaseError);
    }
    
    return [];
  } catch (error) {
    console.error('Exception in getRecentTransactions:', error);
    return [];
  }
};

// Add a new transaction - using localStorage instead of Supabase for reliability
export const addTransaction = async (
  userId: string,
  transaction: {
    type: string;
    amount: number;
    description: string;
    category: string;
    date: string;
  }
): Promise<any> => {
  try {
    // Create a new transaction object with all required fields
    const newTransaction = {
      id: `trans_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      user_id: userId,
      amount: Number(transaction.amount),
      type: transaction.type,
      category: transaction.category || 'Uncategorized',
      description: transaction.description || '',
      date: transaction.date || new Date().toISOString().split('T')[0],
      created_at: new Date().toISOString()
    };
    
    // Get existing transactions from localStorage
    const existingTransactionsJSON = localStorage.getItem('finhive_transactions') || '[]';
    const existingTransactions = JSON.parse(existingTransactionsJSON);
    
    // Add new transaction to the array
    const updatedTransactions = [newTransaction, ...existingTransactions];
    
    // Save back to localStorage
    localStorage.setItem('finhive_transactions', JSON.stringify(updatedTransactions));
    
    console.log('Transaction saved to localStorage:', newTransaction);
    
    // Also try to save to Supabase if possible (but don't fail if it doesn't work)
    try {
      const { error } = await supabase.from('transactions').insert(newTransaction);
      if (error) {
        console.log('Could not save to Supabase, but transaction is saved locally:', error);
      } else {
        console.log('Transaction also saved to Supabase');
      }
    } catch (supabaseError) {
      console.log('Supabase error (ignored):', supabaseError);
    }
    
    // Update monthly summary
    try {
      await updateMonthlySummary(
        userId,
        transaction.date || new Date().toISOString(),
        transaction.type,
        Number(transaction.amount)
      );
    } catch (summaryError) {
      console.log('Monthly summary update failed (ignored):', summaryError);
    }
    
    return newTransaction;
  } catch (error) {
    console.error('Transaction creation failed:', error);
    throw new Error('Failed to create transaction');
  }
};

// Update monthly summary after adding a transaction
export const updateMonthlySummary = async (
  userId: string,
  transactionDate: string,
  transactionType: string,
  amount: number
): Promise<void> => {
  const date = new Date(transactionDate);
  const month = date.toLocaleString('en-US', { month: 'short' });
  const year = date.getFullYear();
  
  // Check if a summary for this month/year exists
  const { data: existingSummary, error: fetchError } = await supabase
    .from('monthly_summaries')
    .select('*')
    .eq('user_id', userId)
    .eq('month', month)
    .eq('year', year)
    .single();
    
  if (fetchError && fetchError.code !== 'PGRST116') throw fetchError;
  
  if (existingSummary) {
    // Update existing summary
    const updates = {
      income: transactionType === 'income' ? existingSummary.income + amount : existingSummary.income,
      expenses: transactionType === 'expense' ? existingSummary.expenses + amount : existingSummary.expenses,
      updated_at: new Date().toISOString()
    };
    
    const { error: updateError } = await supabase
      .from('monthly_summaries')
      .update(updates)
      .eq('id', existingSummary.id);
      
    if (updateError) throw updateError;
  } else {
    // Create new summary
    const newSummary = {
      user_id: userId,
      month,
      year,
      income: transactionType === 'income' ? amount : 0,
      expenses: transactionType === 'expense' ? amount : 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    const { error: insertError } = await supabase
      .from('monthly_summaries')
      .insert([newSummary]);
      
    if (insertError) throw insertError;
  }
  
  // If it's an expense, update the expense breakdown categories
  if (transactionType === 'expense') {
    await updateExpenseCategory(userId, transactionDate, amount);
  }
};

// Update expense category data
export const updateExpenseCategory = async (
  userId: string,
  transactionDate: string,
  amount: number
): Promise<void> => {
  // In a real app, this would update a categories table
  // For now, we'll just log it
  console.log(`Updated expense category for user ${userId} on ${transactionDate} with amount ${amount}`);
};

// Get expense breakdown - using localStorage for reliability
export const getExpenseBreakdown = async (userId: string): Promise<{ name: string; value: number; color: string }[]> => {
  try {
    // Define colors for common categories
    const categoryColors: Record<string, string> = {
      'Rent': '#FF6634',
      'Food': '#FFAA33',
      'Transport': '#33AAFF',
      'Utilities': '#33DDAA',
      'Entertainment': '#7744FF',
      'Shopping': '#FF44AA',
      'Healthcare': '#44EEFF',
      'Education': '#AABB33',
      'Travel': '#FF88CC',
      'Other': '#888888'
    };
    
    // First, try to get from localStorage
    const transactionsJSON = localStorage.getItem('finhive_transactions') || '[]';
    const allTransactions = JSON.parse(transactionsJSON);
    
    // Filter by user ID and expense type, and only include current month
    const currentDate = new Date();
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    
    const userExpenses = allTransactions.filter(t => {
      const transDate = new Date(t.date);
      return t.user_id === userId && 
             t.type === 'expense' && 
             transDate >= startOfMonth && 
             transDate <= currentDate;
    });
    
    if (userExpenses.length > 0) {
      console.log(`Calculating expense breakdown from ${userExpenses.length} local transactions`);
      
      // Group by category and sum amounts
      const categoryMap = new Map<string, number>();
      userExpenses.forEach((transaction) => {
        const category = transaction.category || 'Other';
        const currentAmount = categoryMap.get(category) || 0;
        categoryMap.set(category, currentAmount + Number(transaction.amount));
      });
      
      // Convert to array format needed by the component
      const result = Array.from(categoryMap.entries()).map(([name, value]) => ({
        name,
        value,
        color: categoryColors[name] || '#888888' // Default to gray if no color defined
      }));
      
      if (result.length > 0) {
        return result;
      }
    }
    
    // Fallback to Supabase if no local transactions
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('category, amount')
        .eq('user_id', userId)
        .eq('type', 'expense')
        .gte('date', startOfMonth.toISOString()) // From the start of current month
        .lte('date', currentDate.toISOString()); // To now
    
      if (!error && data && data.length > 0) {
        // Group by category and sum amounts
        const categoryMap = new Map<string, number>();
        data.forEach((transaction) => {
          const category = transaction.category || 'Other';
          const currentAmount = categoryMap.get(category) || 0;
          categoryMap.set(category, currentAmount + transaction.amount);
        });
        
        // Convert to array format needed by the component
        return Array.from(categoryMap.entries()).map(([name, value]) => ({
          name,
          value,
          color: categoryColors[name] || '#888888' // Default to gray if no color defined
        }));
      }
    } catch (supabaseError) {
      console.log('Supabase error getting expense breakdown (ignored):', supabaseError);
    }
    
    // Return empty array if nothing found
    return [];
  } catch (error) {
    console.error('Error getting expense breakdown:', error);
    return [];
  }
};

// Get contacts for quick transactions
export const getContacts = async (userId: string): Promise<Contact[]> => {
  const { data, error } = await supabase
    .from('contacts')
    .select('*')
    .eq('user_id', userId);

  if (error) throw error;
  return data || [];
};

// Calculate total balance from all accounts - using localStorage for reliability
export const getTotalBalance = async (userId: string): Promise<number> => {
  try {
    // First try to calculate from localStorage transactions
    const transactionsJSON = localStorage.getItem('finhive_transactions') || '[]';
    const allTransactions = JSON.parse(transactionsJSON);
    
    // Filter by user ID
    const userTransactions = allTransactions.filter(t => t.user_id === userId);
    
    if (userTransactions.length > 0) {
      console.log(`Calculating total balance from ${userTransactions.length} local transactions`);
      
      // Calculate balance from transactions
      let balance = 0;
      userTransactions.forEach(transaction => {
        if (transaction.type === 'income') {
          balance += Number(transaction.amount);
        } else if (transaction.type === 'expense') {
          balance -= Number(transaction.amount);
        }
      });
      
      return balance;
    }
    
    // Fallback to Supabase accounts
    try {
      const accounts = await getUserAccounts(userId);
      if (accounts && accounts.length > 0) {
        return accounts.reduce((total, account) => total + account.balance, 0);
      }
    } catch (supabaseError) {
      console.log('Supabase error getting total balance (ignored):', supabaseError);
    }
    
    return 0;
  } catch (error) {
    console.error('Error calculating total balance:', error);
    return 0;
  }
};

// Calculate monthly income and expenses - using localStorage for reliability
export const getCurrentMonthSummary = async (userId: string): Promise<{ income: number; expenses: number }> => {
  try {
    // First try to calculate from localStorage transactions
    const transactionsJSON = localStorage.getItem('finhive_transactions') || '[]';
    const allTransactions = JSON.parse(transactionsJSON);
    
    // Set date range for current month
    const currentDate = new Date();
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    
    // Filter by user ID and date range
    const userTransactions = allTransactions.filter(t => {
      const transDate = new Date(t.date);
      return t.user_id === userId && 
             transDate >= startOfMonth && 
             transDate <= currentDate;
    });
    
    if (userTransactions.length > 0) {
      console.log(`Calculating month summary from ${userTransactions.length} local transactions`);
      
      // Calculate income and expenses
      let income = 0;
      let expenses = 0;
      
      userTransactions.forEach(transaction => {
        if (transaction.type === 'income') {
          income += Number(transaction.amount);
        } else if (transaction.type === 'expense') {
          expenses += Number(transaction.amount);
        }
      });
      
      return { income, expenses };
    }
    
    // Fallback to Supabase if no local transactions
    try {
      const startOfMonthISO = startOfMonth.toISOString();
      const nowISO = currentDate.toISOString();
      
      // Get income transactions
      const { data: incomeData, error: incomeError } = await supabase
        .from('transactions')
        .select('amount')
        .eq('user_id', userId)
        .eq('type', 'income')
        .gte('date', startOfMonthISO)
        .lte('date', nowISO);
    
      // Get expense transactions
      const { data: expenseData, error: expenseError } = await supabase
        .from('transactions')
        .select('amount')
        .eq('user_id', userId)
        .eq('type', 'expense')
        .gte('date', startOfMonthISO)
        .lte('date', nowISO);
    
      if (!incomeError && !expenseError) {
        const income = incomeData?.reduce((sum, transaction) => sum + transaction.amount, 0) || 0;
        const expenses = expenseData?.reduce((sum, transaction) => sum + transaction.amount, 0) || 0;
        
        return { income, expenses };
      }
    } catch (supabaseError) {
      console.log('Supabase error getting month summary (ignored):', supabaseError);
    }
    
    // Return zeros if nothing found
    return { income: 0, expenses: 0 };
  } catch (error) {
    console.error('Error calculating month summary:', error);
    return { income: 0, expenses: 0 };
  }
};

// Calculate percentage change in balance - using localStorage for reliability
export const getBalancePercentChange = async (userId: string): Promise<number> => {
  try {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const currentYear = currentDate.getFullYear();
    const previousYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    
    // Define date ranges
    const currentMonthStart = new Date(currentYear, currentMonth, 1);
    const currentMonthEnd = new Date(currentYear, currentMonth + 1, 0);
    const previousMonthStart = new Date(previousYear, previousMonth, 1);
    const previousMonthEnd = new Date(previousYear, previousMonth + 1, 0);
    
    // First try to calculate from localStorage transactions
    const transactionsJSON = localStorage.getItem('finhive_transactions') || '[]';
    const allTransactions = JSON.parse(transactionsJSON);
    
    // Filter by user ID
    const userTransactions = allTransactions.filter(t => t.user_id === userId);
    
    if (userTransactions.length > 0) {
      console.log(`Calculating balance percent change from ${userTransactions.length} local transactions`);
      
      // Filter transactions for current and previous months
      const currentMonthTransactions = userTransactions.filter(t => {
        const transDate = new Date(t.date);
        return transDate >= currentMonthStart && transDate <= currentMonthEnd;
      });
      
      const previousMonthTransactions = userTransactions.filter(t => {
        const transDate = new Date(t.date);
        return transDate >= previousMonthStart && transDate <= previousMonthEnd;
      });
      
      // Calculate current month balance
      let currentIncome = 0;
      let currentExpenses = 0;
      currentMonthTransactions.forEach(transaction => {
        if (transaction.type === 'income') {
          currentIncome += Number(transaction.amount);
        } else if (transaction.type === 'expense') {
          currentExpenses += Number(transaction.amount);
        }
      });
      
      // Calculate previous month balance
      let previousIncome = 0;
      let previousExpenses = 0;
      previousMonthTransactions.forEach(transaction => {
        if (transaction.type === 'income') {
          previousIncome += Number(transaction.amount);
        } else if (transaction.type === 'expense') {
          previousExpenses += Number(transaction.amount);
        }
      });
      
      const currentBalance = currentIncome - currentExpenses;
      const previousBalance = previousIncome - previousExpenses;
      
      // Calculate percentage change
      if (previousBalance === 0) return currentBalance > 0 ? 100 : 0;
      return Math.round(((currentBalance - previousBalance) / Math.abs(previousBalance)) * 100);
    }
    
    // Fallback to Supabase if no local transactions
    try {
      // Get current month summary
      const { data: currentData, error: currentError } = await supabase
        .from('monthly_summaries')
        .select('income, expenses')
        .eq('user_id', userId)
        .eq('month', new Date(currentYear, currentMonth).toLocaleString('en-US', { month: 'short' }))
        .eq('year', currentYear)
        .single();
    
      // Get previous month summary
      const { data: previousData, error: previousError } = await supabase
        .from('monthly_summaries')
        .select('income, expenses')
        .eq('user_id', userId)
        .eq('month', new Date(previousYear, previousMonth).toLocaleString('en-US', { month: 'short' }))
        .eq('year', previousYear)
        .single();
    
      if ((!currentError || currentError.code === 'PGRST116') && (!previousError || previousError.code === 'PGRST116')) {
        // Calculate current and previous balances
        const currentBalance = currentData ? currentData.income - currentData.expenses : 0;
        const previousBalance = previousData ? previousData.income - previousData.expenses : 0;
        
        // Calculate percentage change
        if (previousBalance === 0) return currentBalance > 0 ? 100 : 0;
        return Math.round(((currentBalance - previousBalance) / Math.abs(previousBalance)) * 100);
      }
    } catch (supabaseError) {
      console.log('Supabase error getting balance percent change (ignored):', supabaseError);
    }
    
    return 0;
  } catch (error) {
    console.error('Error calculating balance percent change:', error);
    return 0;
  }
};
