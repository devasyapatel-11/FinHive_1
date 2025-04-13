import React from 'react';
import PageTemplate from './PageTemplate';
import { useAuth } from '@/hooks/useAuth';
import { formatIndianCurrency, getMonthlySummaries, getExpenseBreakdown } from '@/services/financeService';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const Analytics = () => {
  const { user } = useAuth();
  const [loading, setLoading] = React.useState(true);
  const [monthlyData, setMonthlyData] = React.useState([]);
  const [categoryData, setCategoryData] = React.useState([]);
  
  // Default colors for categories
  const categoryColors = {
    'Food': '#FF6634',
    'Rent': '#FFAA33',
    'Transport': '#33AAFF',
    'Entertainment': '#33DDAA',
    'Shopping': '#7744FF',
    'Utilities': '#FF5588',
    'Healthcare': '#44BBFF',
    'Education': '#FFCC44',
    'Travel': '#66DDBB',
    'Others': '#888888'
  };

  React.useEffect(() => {
    const loadAnalyticsData = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        
        // Load monthly summaries for the chart
        const monthlySummaries = await getMonthlySummaries(user.id);
        
        // If we have real data, use it; otherwise, create empty data for the last 6 months
        if (monthlySummaries.length > 0) {
          setMonthlyData(monthlySummaries.slice(-6)); // Get last 6 months
        } else {
          // Create empty data for the last 6 months
          const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
          const currentMonth = new Date().getMonth();
          const last6Months = [];
          
          for (let i = 5; i >= 0; i--) {
            const monthIndex = (currentMonth - i + 12) % 12; // Handle wrapping around to previous year
            last6Months.push({
              name: months[monthIndex],
              income: 0,
              expenses: 0
            });
          }
          
          setMonthlyData(last6Months);
        }
        
        // Load expense breakdown for the pie chart
        const expenses = await getExpenseBreakdown(user.id);
        
        if (expenses.length > 0) {
          setCategoryData(expenses);
        } else {
          // Empty state for categories
          setCategoryData([
            { name: 'No expenses yet', value: 0, color: '#888888' }
          ]);
        }
      } catch (error) {
        console.error('Error loading analytics data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadAnalyticsData();
  }, [user]);

  return (
    <PageTemplate title="Analytics">
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-finhive-primary mx-auto"></div>
          <p className="mt-2 text-finhive-muted">Loading analytics data...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Income vs Expenses Chart */}
          <div className="bg-white p-6 rounded-lg border border-finhive-border">
            <h2 className="text-lg font-medium mb-4">Income vs Expenses</h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={monthlyData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" />
                  <YAxis 
                    tickFormatter={(value) => `₹${value/1000}k`}
                  />
                  <Tooltip 
                    formatter={(value: number) => [formatIndianCurrency(value), value === monthlyData[0].income ? 'Income' : 'Expenses']}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                  <Legend />
                  <Bar dataKey="income" name="Income" fill="#FF6634" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="expenses" name="Expenses" fill="#33AAFF" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Expense Categories */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg border border-finhive-border">
              <h2 className="text-lg font-medium mb-4">Expense Categories</h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value) => [`${value}%`, 'Percentage']}
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg border border-finhive-border">
              <h2 className="text-lg font-medium mb-4">Financial Summary</h2>
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-green-50 border border-green-100">
                  <div className="text-sm text-green-600 mb-1">Total Income (Last 6 Months)</div>
                  <div className="text-2xl font-bold text-green-700">
                    {formatIndianCurrency(monthlyData.reduce((sum, item) => sum + item.income, 0))}
                  </div>
                </div>
                
                <div className="p-4 rounded-lg bg-red-50 border border-red-100">
                  <div className="text-sm text-red-600 mb-1">Total Expenses (Last 6 Months)</div>
                  <div className="text-2xl font-bold text-red-700">
                    {formatIndianCurrency(monthlyData.reduce((sum, item) => sum + item.expenses, 0))}
                  </div>
                </div>
                
                <div className="p-4 rounded-lg bg-blue-50 border border-blue-100">
                  <div className="text-sm text-blue-600 mb-1">Net Savings (Last 6 Months)</div>
                  <div className="text-2xl font-bold text-blue-700">
                    {formatIndianCurrency(
                      monthlyData.reduce((sum, item) => sum + item.income, 0) - 
                      monthlyData.reduce((sum, item) => sum + item.expenses, 0)
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </PageTemplate>
  );
};

export default Analytics;
