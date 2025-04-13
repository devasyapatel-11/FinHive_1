
import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import UserGreeting from '@/components/UserGreeting';
import ConnectedCard from '@/components/ConnectedCard';
import BalanceChart from '@/components/BalanceChart';
import QuickLinks from '@/components/QuickLinks';
import SavingsGoal from '@/components/SavingsGoal';
import ExpensesBreakdown from '@/components/ExpensesBreakdown';
import CurrencyDisplay from '@/components/CurrencyDisplay';
import QuickTransaction from '@/components/QuickTransaction';
import { Car, Plane } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import {
  getUserProfile,
  getUserAccounts,
  getMonthlySummaries,
  getSavingsGoals,
  getCurrencyHoldings,
  getContacts,
  getExpenseBreakdown,
  getTotalBalance,
  getBalancePercentChange,
  calculatePercentage,
  formatIndianCurrency
} from '@/services/financeService';

const Index = () => {
  const { user, loading } = useAuth();
  
  // State for user data
  const [profile, setProfile] = useState<any>(null);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [balanceData, setBalanceData] = useState<any[]>([]);
  const [expensesData, setExpensesData] = useState<any[]>([]);
  const [currencies, setCurrencies] = useState<any[]>([]);
  const [contacts, setContacts] = useState<any[]>([]);
  const [savingsGoals, setSavingsGoals] = useState<any[]>([]);
  const [totalBalance, setTotalBalance] = useState<number>(0);
  const [percentChange, setPercentChange] = useState<number>(0);
  const [totalSavings, setTotalSavings] = useState<number>(0);
  const [savingsPercentChange, setSavingsPercentChange] = useState<number>(0);
  const [dataLoading, setDataLoading] = useState<boolean>(true);
  const [currentMonth, setCurrentMonth] = useState<string>(new Date().toLocaleString('en-US', { month: 'short' }));
  const [currentMonthData, setCurrentMonthData] = useState<any | null>(null);
  const [expensePercentage, setExpensePercentage] = useState<number>(0);
  const [totalExpenses, setTotalExpenses] = useState<number>(0);

  // Function to load user data
  const loadUserData = async () => {
    if (!user) return;
    
    try {
      setDataLoading(true);
      console.log('Loading dashboard data for user:', user.id);
        
      // Load user profile
      const userProfile = await getUserProfile(user.id);
      setProfile(userProfile);
      
      // Load accounts
      const userAccounts = await getUserAccounts(user.id);
      setAccounts(userAccounts);
      
      // Load monthly summaries for balance chart
      const monthlySummaries = await getMonthlySummaries(user.id);
      setBalanceData(monthlySummaries.length > 0 ? monthlySummaries : [
        // Fallback data if no summaries exist yet
        { month: 'Jan', year: new Date().getFullYear(), income: 0, expenses: 0 },
        { month: 'Feb', year: new Date().getFullYear(), income: 0, expenses: 0 },
        { month: 'Mar', year: new Date().getFullYear(), income: 0, expenses: 0 },
        { month: 'Apr', year: new Date().getFullYear(), income: 0, expenses: 0 },
        { month: 'May', year: new Date().getFullYear(), income: 0, expenses: 0 },
        { month: 'Jun', year: new Date().getFullYear(), income: 0, expenses: 0 },
        { month: 'Jul', year: new Date().getFullYear(), income: 0, expenses: 0 },
        { month: 'Aug', year: new Date().getFullYear(), income: 0, expenses: 0 },
        { month: 'Sep', year: new Date().getFullYear(), income: 0, expenses: 0 },
        { month: 'Oct', year: new Date().getFullYear(), income: 0, expenses: 0 },
        { month: 'Nov', year: new Date().getFullYear(), income: 0, expenses: 0 },
        { month: 'Dec', year: new Date().getFullYear(), income: 0, expenses: 0 },
      ]);
      
      // Load expense breakdown
      const expenses = await getExpenseBreakdown(user.id);
      setExpensesData(expenses.length > 0 ? expenses : [
        // Fallback data if no expenses exist yet
        { name: 'No expenses yet', value: 0, color: '#888888' }
      ]);
      
      // Calculate total expenses
      const total = expenses.reduce((sum, expense) => sum + expense.value, 0);
      setTotalExpenses(total);
      
      // Set current month data
      const monthData = monthlySummaries.find(item => item.month === currentMonth);
      setCurrentMonthData(monthData || null);
      
      // Calculate expense percentage
      if (monthData && monthData.income > 0) {
        setExpensePercentage(Math.round((total / monthData.income) * 100));
      } else {
        setExpensePercentage(0);
      }
        
      // Load currency holdings
      const currencyHoldings = await getCurrencyHoldings(user.id);
      setCurrencies(currencyHoldings.length > 0 ? currencyHoldings : [
        // Fallback data if no currencies exist yet
        { code: 'INR', amount: 0, value: 'Indian Rupee' }
      ]);
      
      // Load contacts
      const userContacts = await getContacts(user.id);
      setContacts(userContacts.length > 0 ? userContacts : [
        // Fallback data if no contacts exist yet
        { id: '1', name: 'Add contacts', avatar: null }
      ]);
      
      // Load savings goals
      const goals = await getSavingsGoals(user.id);
      setSavingsGoals(goals);
      
      // Calculate total balance
      const balance = await getTotalBalance(user.id);
      setTotalBalance(balance);
      
      // Calculate balance percent change
      const balanceChange = await getBalancePercentChange(user.id);
      setPercentChange(balanceChange);
      
      // Calculate total savings and percent change
      const totalSavingsAmount = goals.reduce((sum, goal) => sum + goal.current_amount, 0);
      setTotalSavings(totalSavingsAmount);
      setSavingsPercentChange(goals.length > 0 ? 10 : 0); // Placeholder, would need historical data
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setDataLoading(false);
    }
  };
    
  // Load user data when authenticated
  useEffect(() => {
    if (!loading) {
      loadUserData();
    }
    
    // Set up a refresh interval to update dashboard data
    if (user && !loading) {
      const intervalId = setInterval(() => {
        loadUserData();
      }, 10000); // Refresh every 10 seconds
      
      return () => clearInterval(intervalId);
    }
  }, [user, loading]);
  
  // Add a focus event listener to reload data when the user returns to this page
  // This ensures profile changes made in the Settings page are reflected here
  useEffect(() => {
    const handleFocus = () => {
      if (user) {
        loadUserData();
      }
    };
    
    window.addEventListener('focus', handleFocus);
    
    // Also reload when component mounts or when navigated to
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && user) {
        loadUserData();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [user]);

  // Function to update expense data based on selected month
  const handleMonthChange = async (month: string) => {
    if (!user) return;
    setCurrentMonth(month);
    
    try {
      // Find the data for the selected month
      const monthData = balanceData.find(item => item.month === month);
      setCurrentMonthData(monthData || null);
      
      // Get expense breakdown for the selected month
      // In a real app, we would fetch this from the database based on the month
      // For now, we'll just use the existing data or empty data if none exists
      const expenses = await getExpenseBreakdown(user.id);
      setExpensesData(expenses);
      
      // Calculate total expenses
      const total = expenses.reduce((sum, expense) => sum + expense.value, 0);
      setTotalExpenses(total);
      
      // Calculate percentage of income
      if (monthData && monthData.income > 0) {
        setExpensePercentage(Math.round((total / monthData.income) * 100));
      } else {
        setExpensePercentage(0);
      }
    } catch (error) {
      console.error('Error updating month data:', error);
    }
  };

  if (loading || dataLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-finhive-primary mx-auto"></div>
          <p className="mt-4 text-finhive-text">Loading your financial data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto p-6">
          <UserGreeting 
            name={profile?.first_name ? `${profile.first_name} ${profile.last_name || ''}` : 'User'} 
            isPremium={profile?.is_premium || false} 
          />
          
          <div className="grid grid-cols-12 gap-6 mt-4">
            {/* Left column */}
            <div className="col-span-12 md:col-span-8 space-y-6">
              {/* Connected Cards */}
              <div className="grid grid-cols-12 gap-6">
                <div className="col-span-12 md:col-span-6">
                  <h3 className="text-lg font-medium mb-3">Your Cards</h3>
                  {accounts.length > 0 ? (
                    <ConnectedCard 
                      cardType={accounts[0].card_type || "visa"} 
                      lastFour={accounts[0].last_four || "****"} 
                      linkedAccount={accounts[0].name} 
                      monthlyFee={accounts[0].monthly_fee || 0} 
                    />
                  ) : (
                    <div className="bg-white p-6 rounded-lg border border-finhive-border h-40 flex items-center justify-center">
                      <p className="text-finhive-muted">No cards added yet</p>
                    </div>
                  )}
                </div>
                
                <div className="col-span-12 md:col-span-6 flex flex-col">
                  <h3 className="text-lg font-medium mb-3">Save Boxes</h3>
                  <div className="bg-white p-6 rounded-lg border border-finhive-border flex-1">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-semibold text-finhive-text">
                        {formatIndianCurrency(totalSavings)}
                      </h3>
                      <span className={`text-${savingsPercentChange >= 0 ? 'green' : 'red'}-500 text-sm`}>
                        {savingsPercentChange >= 0 ? '↑' : '↓'} {Math.abs(savingsPercentChange)}%
                      </span>
                    </div>
                    
                    <div className="space-y-4 mt-6">
                      {savingsGoals.length > 0 ? (
                        savingsGoals.slice(0, 2).map((goal) => (
                          <SavingsGoal 
                            key={goal.id}
                            title={goal.title} 
                            currentAmount={goal.current_amount} 
                            targetAmount={goal.target_amount} 
                            percentComplete={calculatePercentage(goal.current_amount, goal.target_amount)} 
                            icon={goal.icon === 'car' ? <Car className="text-finhive-primary" /> : 
                                  goal.icon === 'plane' ? <Plane className="text-finhive-primary" /> : 
                                  <div className="w-8 h-8 rounded-full bg-finhive-primary flex items-center justify-center text-white">
                                    {goal.title.charAt(0)}
                                  </div>} 
                          />
                        ))
                      ) : (
                        <div className="text-center py-4 text-finhive-muted">
                          <p>No savings goals yet</p>
                        </div>
                      )}
                      
                      <button className="w-full mt-4 text-center text-finhive-primary font-medium">
                        + New Box
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Quick Links */}
              <QuickLinks />
              
              {/* Balance Chart */}
              <BalanceChart 
                data={balanceData.map(item => ({
                  name: item.month,
                  income: item.income,
                  expenses: item.expenses
                }))} 
                currentBalance={totalBalance} 
                percentChange={percentChange} 
              />
            </div>
            
            {/* Right column */}
            <div className="col-span-12 md:col-span-4 space-y-6">
              {/* Expenses Breakdown */}
              <ExpensesBreakdown 
                total={totalExpenses} 
                data={expensesData} 
                percentage={expensePercentage} 
                month={currentMonth}
                onMonthChange={handleMonthChange}
              />
              
              {/* Currency Display */}
              <CurrencyDisplay currencies={currencies} />
              
              {/* Quick Transaction */}
              <QuickTransaction contacts={contacts} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
