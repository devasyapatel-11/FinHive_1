import {
  getTotalBalance,
  getCurrentMonthSummary,
  getExpenseBreakdown,
  getRecentTransactions,
  getSavingsGoals,
  getBudgetStatus,
  formatIndianCurrency
} from './financeService';

export interface RiskAlert {
  id: string;
  type: 'critical_risk' | 'high_risk' | 'medium_risk' | 'low_risk' | 'opportunity' | 'positive_trend';
  title: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  category: string;
  actionable: boolean;
  recommendation?: string;
  potentialSavings?: number;
  createdAt: Date;
  expiresAt?: Date;
}

export interface MarketInsight {
  id: string;
  type: 'investment_opportunity' | 'market_trend' | 'economic_indicator';
  title: string;
  description: string;
  confidence: number; // 0-100
  timeHorizon: 'short' | 'medium' | 'long';
  recommendation?: string;
  createdAt: Date;
}

class RiskAlertsEngine {
  async analyzeRisks(userId: string): Promise<RiskAlert[]> {
    const alerts: RiskAlert[] = [];

    try {
      // Get all necessary data
      const [balance, monthlySummary, breakdown, budgetStatus, goals, recentTransactions] = await Promise.all([
        getTotalBalance(userId),
        getCurrentMonthSummary(userId),
        getExpenseBreakdown(userId),
        getBudgetStatus(userId),
        getSavingsGoals(userId),
        getRecentTransactions(userId, 20)
      ]);

      // 1. Critical Balance Risk
      if (balance <= 0) {
        alerts.push({
          id: `balance_critical_${Date.now()}`,
          type: 'critical_risk',
          title: '🚨 Negative Balance Alert',
          description: 'Your account balance is negative. This can lead to overdraft fees and financial stress.',
          severity: 'critical',
          category: 'balance',
          actionable: true,
          recommendation: 'Immediately review your expenses and consider creating a strict budget. Contact your bank if you have overdraft protection.',
          createdAt: new Date(),
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // Expires in 24 hours
        });
      } else if (balance < 1000) {
        alerts.push({
          id: `balance_low_${Date.now()}`,
          type: 'high_risk',
          title: 'Low Balance Warning',
          description: `Your balance is only ${formatIndianCurrency(balance)}. You're at risk of insufficient funds.`,
          severity: 'high',
          category: 'balance',
          actionable: true,
          recommendation: 'Build an emergency fund and avoid large purchases until your balance improves.',
          potentialSavings: Math.max(0, 5000 - balance),
          createdAt: new Date(),
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // Expires in 7 days
        });
      }

      // 2. Overspending Risk
      if (monthlySummary.expenses > monthlySummary.income * 1.2) {
        const overspendPercent = ((monthlySummary.expenses - monthlySummary.income) / monthlySummary.income) * 100;
        alerts.push({
          id: `overspending_critical_${Date.now()}`,
          type: 'critical_risk',
          title: 'Critical Overspending',
          description: `You're spending ${Math.round(overspendPercent)}% more than you earn. This is financially unsustainable.`,
          severity: 'critical',
          category: 'spending',
          actionable: true,
          recommendation: 'Cut non-essential expenses immediately. Consider additional income sources or financial counseling.',
          createdAt: new Date()
        });
      } else if (monthlySummary.expenses > monthlySummary.income) {
        const overspendAmount = monthlySummary.expenses - monthlySummary.income;
        alerts.push({
          id: `overspending_high_${Date.now()}`,
          type: 'high_risk',
          title: 'Monthly Overspending',
          description: `You're spending ${formatIndianCurrency(overspendAmount)} more than you earn this month.`,
          severity: 'high',
          category: 'spending',
          actionable: true,
          recommendation: 'Review your expenses and identify areas to cut back. Create a realistic budget.',
          createdAt: new Date()
        });
      }

      // 3. Budget Breach Alerts
      const breachedBudgets = budgetStatus.filter(b => b.status === 'danger');
      breachedBudgets.forEach(budget => {
        alerts.push({
          id: `budget_breach_${budget.category}_${Date.now()}`,
          type: 'high_risk',
          title: `Budget Overrun: ${budget.category}`,
          description: `You've exceeded your ${budget.category} budget by ${Math.round(budget.percentage - 100)}%.`,
          severity: 'high',
          category: 'budget',
          actionable: true,
          recommendation: `Pause ${budget.category} spending for the rest of the month or adjust your budget limit.`,
          createdAt: new Date()
        });
      });

      // 4. Savings Goal Risks
      goals.forEach(goal => {
        const progress = goal.target_amount > 0 ? (goal.current_amount / goal.target_amount) * 100 : 0;
        const timeToGoal = goal.target_amount - goal.current_amount;

        if (progress < 25 && timeToGoal > monthlySummary.income * 3) {
          alerts.push({
            id: `goal_risk_${goal.id}_${Date.now()}`,
            type: 'medium_risk',
            title: `Savings Goal at Risk: ${goal.title}`,
            description: `You're far from reaching your ${goal.title} goal. At current savings rates, it will take a very long time.`,
            severity: 'medium',
            category: 'savings',
            actionable: true,
            recommendation: `Increase your monthly savings amount or extend your timeline for this goal.`,
            createdAt: new Date()
          });
        }
      });

      // 5. High-Risk Spending Patterns
      const highRiskCategories = ['Entertainment', 'Dining', 'Shopping', 'Travel'];
      const highRiskSpending = breakdown.filter(cat =>
        highRiskCategories.includes(cat.name) &&
        cat.value > monthlySummary.expenses * 0.15
      );

      highRiskSpending.forEach(category => {
        const percentOfExpenses = (category.value / monthlySummary.expenses) * 100;
        alerts.push({
          id: `high_risk_spending_${category.name.toLowerCase()}_${Date.now()}`,
          type: 'medium_risk',
          title: `High ${category.name} Spending`,
          description: `${category.name} represents ${Math.round(percentOfExpenses)}% of your expenses, which is quite high.`,
          severity: 'medium',
          category: 'spending',
          actionable: true,
          recommendation: `Consider setting a budget limit for ${category.name} and finding more cost-effective alternatives.`,
          potentialSavings: category.value * 0.2, // Suggest 20% reduction
          createdAt: new Date()
        });
      });

      // 6. Recurring Large Transactions
      const largeTransactions = recentTransactions.filter(t =>
        t.type === 'expense' && t.amount > monthlySummary.expenses * 0.1
      );

      if (largeTransactions.length > 0) {
        alerts.push({
          id: `large_transactions_${Date.now()}`,
          type: 'low_risk',
          title: 'Large Transaction Pattern',
          description: `You've made ${largeTransactions.length} large transactions recently. Ensure these are necessary purchases.`,
          severity: 'low',
          category: 'spending',
          actionable: true,
          recommendation: 'Review large purchases to ensure they align with your financial goals.',
          createdAt: new Date()
        });
      }

      // 7. Positive Opportunities
      const savingsRate = monthlySummary.income > 0 ? ((monthlySummary.income - monthlySummary.expenses) / monthlySummary.income) * 100 : 0;

      if (savingsRate > 20) {
        alerts.push({
          id: `high_savings_opportunity_${Date.now()}`,
          type: 'opportunity',
          title: 'Excellent Savings Rate!',
          description: `You're saving ${Math.round(savingsRate)}% of your income - that's better than most people!`,
          severity: 'info',
          category: 'savings',
          actionable: true,
          recommendation: `Consider investing your surplus savings or accelerating your savings goals.`,
          createdAt: new Date()
        });
      }

      // 8. Emergency Fund Opportunity
      const emergencyFundTarget = monthlySummary.expenses * 6; // 6 months of expenses
      if (balance < emergencyFundTarget && balance > emergencyFundTarget * 0.5) {
        const gap = emergencyFundTarget - balance;
        alerts.push({
          id: `emergency_fund_opportunity_${Date.now()}`,
          type: 'opportunity',
          title: 'Build Emergency Fund',
          description: `You're close to having a solid emergency fund. Just ${formatIndianCurrency(gap)} more to reach 6 months of expenses.`,
          severity: 'info',
          category: 'savings',
          actionable: true,
          recommendation: 'Prioritize building your emergency fund to protect against unexpected expenses.',
          potentialSavings: gap,
          createdAt: new Date()
        });
      }

      // Sort alerts by severity
      alerts.sort((a, b) => {
        const severityOrder = { critical: 5, high: 4, medium: 3, low: 2, info: 1 };
        return severityOrder[b.severity] - severityOrder[a.severity];
      });

      return alerts;

    } catch (error) {
      console.error('Error analyzing risks:', error);
      return [];
    }
  }

  async getMarketInsights(): Promise<MarketInsight[]> {
    // In a real app, this would connect to financial APIs
    // For now, we'll provide simulated market insights
    const insights: MarketInsight[] = [
      {
        id: 'market_1',
        type: 'investment_opportunity',
        title: 'High-Yield Savings Accounts',
        description: 'Current interest rates for savings accounts are at historic highs. Consider moving cash to high-yield accounts.',
        confidence: 85,
        timeHorizon: 'short',
        recommendation: 'Compare rates from banks like HDFC, ICICI, and digital banks.',
        createdAt: new Date()
      },
      {
        id: 'market_2',
        type: 'economic_indicator',
        title: 'Inflation Trends',
        description: 'Inflation has been moderating. This could be a good time to lock in fixed deposits.',
        confidence: 70,
        timeHorizon: 'medium',
        recommendation: 'Consider laddering your fixed deposits for better flexibility.',
        createdAt: new Date()
      },
      {
        id: 'market_3',
        type: 'market_trend',
        title: 'Index Fund Performance',
        description: 'Broad market index funds have shown consistent long-term growth despite short-term volatility.',
        confidence: 90,
        timeHorizon: 'long',
        recommendation: 'Consider systematic investment plans (SIPs) for long-term wealth creation.',
        createdAt: new Date()
      }
    ];

    return insights;
  }

  async getAllAlerts(userId: string): Promise<{
    riskAlerts: RiskAlert[];
    marketInsights: MarketInsight[];
  }> {
    try {
      const [riskAlerts, marketInsights] = await Promise.all([
        this.analyzeRisks(userId),
        this.getMarketInsights()
      ]);

      return {
        riskAlerts,
        marketInsights
      };
    } catch (error) {
      console.error('Error getting all alerts:', error);
      return {
        riskAlerts: [],
        marketInsights: []
      };
    }
  }
}

// Export singleton instance
export const riskAlertsEngine = new RiskAlertsEngine();
export default riskAlertsEngine;
