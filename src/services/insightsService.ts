import {
  getMonthlySummaries,
  getExpenseBreakdown,
  getBudgetStatus,
  getRecentTransactions,
  getSavingsGoals,
  getTotalBalance,
  getCurrentMonthSummary,
  formatIndianCurrency
} from './financeService';

export interface FinancialInsight {
  id: string;
  type: 'savings_opportunity' | 'spending_alert' | 'budget_warning' | 'goal_progress' | 'trend_analysis' | 'milestone_achievement';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  actionable: boolean;
  category?: string;
  amount?: number;
  percentage?: number;
  recommendation?: string;
  createdAt: Date;
}

export interface SpendingPattern {
  category: string;
  currentSpending: number;
  previousSpending: number;
  change: number;
  changePercentage: number;
  trend: 'increasing' | 'decreasing' | 'stable';
}

export interface FinancialPersona {
  type: 'disciplined_saver' | 'budget_conscious' | 'impulsive_spender' | 'goal_oriented' | 'financial_newbie';
  description: string;
  strengths: string[];
  improvementAreas: string[];
  score: number;
}

class InsightsEngine {
  async analyzeSpendingPatterns(userId: string): Promise<SpendingPattern[]> {
    try {
      // Get current month breakdown
      const currentBreakdown = await getExpenseBreakdown(userId);

      // Get previous month data (this would need historical data in a real app)
      // For now, we'll simulate some patterns
      const patterns: SpendingPattern[] = currentBreakdown.map(category => {
        // Simulate previous month data
        const previousSpending = category.value * (0.8 + Math.random() * 0.4); // ±20% variation
        const change = category.value - previousSpending;
        const changePercentage = (change / previousSpending) * 100;

        let trend: 'increasing' | 'decreasing' | 'stable';
        if (Math.abs(changePercentage) < 5) {
          trend = 'stable';
        } else if (changePercentage > 0) {
          trend = 'increasing';
        } else {
          trend = 'decreasing';
        }

        return {
          category: category.name,
          currentSpending: category.value,
          previousSpending,
          change,
          changePercentage,
          trend
        };
      });

      return patterns;
    } catch (error) {
      console.error('Error analyzing spending patterns:', error);
      return [];
    }
  }

  async generateInsights(userId: string): Promise<FinancialInsight[]> {
    const insights: FinancialInsight[] = [];

    try {
      // Get all necessary data
      const [balance, monthlySummary, budgetStatus, spendingPatterns, goals, recentTransactions] = await Promise.all([
        getTotalBalance(userId),
        getCurrentMonthSummary(userId),
        getBudgetStatus(userId),
        this.analyzeSpendingPatterns(userId),
        getSavingsGoals(userId),
        getRecentTransactions(userId, 10)
      ]);

      // 1. Budget Warnings
      const dangerBudgets = budgetStatus.filter(b => b.status === 'danger');
      dangerBudgets.forEach(budget => {
        insights.push({
          id: `budget_${budget.category}_${Date.now()}`,
          type: 'budget_warning',
          title: `Budget Alert: ${budget.category}`,
          description: `You're ${Math.round(budget.percentage)}% through your ${budget.category} budget. Consider reducing spending in this category.`,
          impact: 'high',
          actionable: true,
          category: budget.category,
          amount: budget.spent,
          percentage: budget.percentage,
          recommendation: `Try to keep ${budget.category} spending under ${formatIndianCurrency(budget.limit)} this month.`,
          createdAt: new Date()
        });
      });

      // 2. Savings Opportunities
      const largestSpendingCategory = spendingPatterns.reduce((max, pattern) =>
        pattern.currentSpending > max.currentSpending ? pattern : max,
        spendingPatterns[0]
      );

      if (largestSpendingCategory && largestSpendingCategory.currentSpending > monthlySummary.expenses * 0.3) {
        insights.push({
          id: `savings_${largestSpendingCategory.category}_${Date.now()}`,
          type: 'savings_opportunity',
          title: `Save on ${largestSpendingCategory.category}`,
          description: `${largestSpendingCategory.category} is ${Math.round((largestSpendingCategory.currentSpending / monthlySummary.expenses) * 100)}% of your spending. Small changes here could save you big!`,
          impact: 'medium',
          actionable: true,
          category: largestSpendingCategory.category,
          amount: largestSpendingCategory.currentSpending,
          recommendation: `Look for ways to reduce ${largestSpendingCategory.category} expenses by 10-20%.`,
          createdAt: new Date()
        });
      }

      // 3. Spending Alerts
      const increasingCategories = spendingPatterns.filter(p => p.trend === 'increasing' && p.changePercentage > 15);
      increasingCategories.forEach(pattern => {
        insights.push({
          id: `spending_${pattern.category}_${Date.now()}`,
          type: 'spending_alert',
          title: `${pattern.category} Spending Increased`,
          description: `Your ${pattern.category} spending increased by ${Math.round(pattern.changePercentage)}% compared to last month.`,
          impact: 'medium',
          actionable: true,
          category: pattern.category,
          amount: pattern.change,
          percentage: pattern.changePercentage,
          recommendation: `Review your recent ${pattern.category} purchases to identify areas for potential savings.`,
          createdAt: new Date()
        });
      });

      // 4. Goal Progress Updates
      goals.forEach(goal => {
        const progress = goal.target_amount > 0 ? (goal.current_amount / goal.target_amount) * 100 : 0;

        if (progress >= 100) {
          insights.push({
            id: `goal_achievement_${goal.id}_${Date.now()}`,
            type: 'milestone_achievement',
            title: `🎉 Goal Achieved: ${goal.title}`,
            description: `Congratulations! You've reached your savings goal of ${formatIndianCurrency(goal.target_amount)}.`,
            impact: 'high',
            actionable: false,
            amount: goal.target_amount,
            createdAt: new Date()
          });
        } else if (progress >= 75) {
          insights.push({
            id: `goal_progress_${goal.id}_${Date.now()}`,
            type: 'goal_progress',
            title: `Almost There: ${goal.title}`,
            description: `You're ${Math.round(progress)}% towards your ${goal.title} goal. Just ${formatIndianCurrency(goal.target_amount - goal.current_amount)} to go!`,
            impact: 'medium',
            actionable: true,
            amount: goal.target_amount - goal.current_amount,
            percentage: progress,
            recommendation: `Consider increasing your monthly savings to reach this goal faster.`,
            createdAt: new Date()
          });
        }
      });

      // 5. Trend Analysis
      const totalSpendingChange = spendingPatterns.reduce((sum, pattern) => sum + pattern.change, 0);
      if (Math.abs(totalSpendingChange) > monthlySummary.expenses * 0.1) {
        const trend = totalSpendingChange > 0 ? 'increased' : 'decreased';
        const changePercent = Math.abs((totalSpendingChange / (monthlySummary.expenses - totalSpendingChange)) * 100);

        insights.push({
          id: `trend_analysis_${Date.now()}`,
          type: 'trend_analysis',
          title: `Spending Trend Analysis`,
          description: `Your total spending has ${trend} by ${Math.round(changePercent)}% compared to last month.`,
          impact: totalSpendingChange > 0 ? 'medium' : 'low',
          actionable: true,
          amount: Math.abs(totalSpendingChange),
          percentage: changePercent,
          recommendation: totalSpendingChange > 0
            ? 'Review your recent purchases and consider creating budgets for high-spending categories.'
            : 'Great job on reducing expenses! Keep up the good work.',
          createdAt: new Date()
        });
      }

      // 6. Low Balance Warning
      if (balance < 5000 && balance > 0) {
        insights.push({
          id: `low_balance_${Date.now()}`,
          type: 'spending_alert',
          title: 'Low Balance Warning',
          description: `Your account balance is ${formatIndianCurrency(balance)}. Consider building an emergency fund.`,
          impact: 'high',
          actionable: true,
          amount: balance,
          recommendation: 'Aim to save 3-6 months of expenses as an emergency fund.',
          createdAt: new Date()
        });
      }

      // 7. Overspending Warning
      if (monthlySummary.expenses > monthlySummary.income) {
        const overspendAmount = monthlySummary.expenses - monthlySummary.income;
        insights.push({
          id: `overspending_${Date.now()}`,
          type: 'budget_warning',
          title: 'Overspending Alert',
          description: `You're spending ${formatIndianCurrency(overspendAmount)} more than you're earning this month.`,
          impact: 'high',
          actionable: true,
          amount: overspendAmount,
          recommendation: 'Create a budget to track expenses and consider ways to increase income or reduce spending.',
          createdAt: new Date()
        });
      }

      // Sort insights by impact and recency
      insights.sort((a, b) => {
        const impactOrder = { high: 3, medium: 2, low: 1 };
        const impactDiff = impactOrder[b.impact] - impactOrder[a.impact];
        if (impactDiff !== 0) return impactDiff;
        return b.createdAt.getTime() - a.createdAt.getTime();
      });

      return insights.slice(0, 10); // Return top 10 insights

    } catch (error) {
      console.error('Error generating insights:', error);
      return [];
    }
  }

  async analyzeFinancialPersona(userId: string): Promise<FinancialPersona> {
    try {
      const [monthlySummary, budgetStatus, goals, balance] = await Promise.all([
        getCurrentMonthSummary(userId),
        getBudgetStatus(userId),
        getSavingsGoals(userId),
        getTotalBalance(userId)
      ]);

      // Calculate scores based on various factors
      let disciplineScore = 0;
      let savingsScore = 0;
      let budgetAdherenceScore = 0;

      // Budget adherence
      if (budgetStatus.length > 0) {
        const onTrackBudgets = budgetStatus.filter(b => b.status === 'good').length;
        budgetAdherenceScore = (onTrackBudgets / budgetStatus.length) * 100;
      }

      // Savings goals
      if (goals.length > 0) {
        const completedGoals = goals.filter(g => g.current_amount >= g.target_amount).length;
        savingsScore = (completedGoals / goals.length) * 100;
      }

      // Balance management
      const balanceScore = balance > 10000 ? 100 : (balance / 10000) * 100;

      // Overall discipline
      disciplineScore = (budgetAdherenceScore + savingsScore + balanceScore) / 3;

      // Determine persona based on scores
      let persona: FinancialPersona;

      if (disciplineScore >= 80) {
        persona = {
          type: 'disciplined_saver',
          description: 'You\'re a financial role model! You consistently stick to budgets and build savings.',
          strengths: ['Excellent budget discipline', 'Strong savings habits', 'Good financial planning'],
          improvementAreas: ['Could explore investment opportunities'],
          score: disciplineScore
        };
      } else if (disciplineScore >= 60) {
        persona = {
          type: 'budget_conscious',
          description: 'You\'re mindful about money and generally stick to your financial plans.',
          strengths: ['Good budget awareness', 'Consistent saving efforts'],
          improvementAreas: ['Could improve budget adherence', 'Consider more aggressive savings goals'],
          score: disciplineScore
        };
      } else if (disciplineScore >= 40) {
        persona = {
          type: 'goal_oriented',
          description: 'You set financial goals but sometimes struggle with execution.',
          strengths: ['Goal setting', 'Future planning'],
          improvementAreas: ['Budget tracking', 'Expense monitoring', 'Savings discipline'],
          score: disciplineScore
        };
      } else if (disciplineScore >= 20) {
        persona = {
          type: 'impulsive_spender',
          description: 'You enjoy spending but could benefit from more financial structure.',
          strengths: ['Life enjoyment', 'Experience with money'],
          improvementAreas: ['Budget creation', 'Expense tracking', 'Savings building'],
          score: disciplineScore
        };
      } else {
        persona = {
          type: 'financial_newbie',
          description: 'You\'re just starting your financial journey. That\'s great!',
          strengths: ['Fresh perspective', 'Open to learning'],
          improvementAreas: ['Budget basics', 'Saving fundamentals', 'Expense tracking'],
          score: disciplineScore
        };
      }

      return persona;

    } catch (error) {
      console.error('Error analyzing financial persona:', error);
      return {
        type: 'financial_newbie',
        description: 'We\'re still learning about your financial habits.',
        strengths: ['Open to improvement'],
        improvementAreas: ['Start tracking expenses', 'Set financial goals'],
        score: 0
      };
    }
  }

  async getQuickStats(userId: string): Promise<{
    totalBalance: number;
    monthlyIncome: number;
    monthlyExpenses: number;
    savingsRate: number;
    topCategory: string;
    budgetHealth: number;
  }> {
    try {
      const [balance, monthlySummary, breakdown, budgetStatus] = await Promise.all([
        getTotalBalance(userId),
        getCurrentMonthSummary(userId),
        getExpenseBreakdown(userId),
        getBudgetStatus(userId)
      ]);

      const savingsRate = monthlySummary.income > 0
        ? ((monthlySummary.income - monthlySummary.expenses) / monthlySummary.income) * 100
        : 0;

      const topCategory = breakdown.length > 0 ? breakdown[0].name : 'No expenses yet';

      const budgetHealth = budgetStatus.length > 0
        ? (budgetStatus.filter(b => b.status === 'good').length / budgetStatus.length) * 100
        : 0;

      return {
        totalBalance: balance,
        monthlyIncome: monthlySummary.income,
        monthlyExpenses: monthlySummary.expenses,
        savingsRate,
        topCategory,
        budgetHealth
      };
    } catch (error) {
      console.error('Error getting quick stats:', error);
      return {
        totalBalance: 0,
        monthlyIncome: 0,
        monthlyExpenses: 0,
        savingsRate: 0,
        topCategory: 'Unknown',
        budgetHealth: 0
      };
    }
  }
}

// Export singleton instance
export const insightsEngine = new InsightsEngine();
export default insightsEngine;
