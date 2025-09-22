import {
  getCurrentMonthSummary,
  getExpenseBreakdown,
  getRecentTransactions,
  getBudgetStatus,
  getSavingsGoals,
  getTotalBalance
} from './financeService';

export interface FinancialPersona {
  id: string;
  name: string;
  description: string;
  emoji: string;
  traits: string[];
  strengths: string[];
  challenges: string[];
  riskTolerance: 'low' | 'medium' | 'high';
  recommendedStrategies: string[];
  spendingProfile: {
    topCategories: string[];
    averageTransactionSize: number;
    transactionFrequency: 'low' | 'medium' | 'high';
    budgetingStyle: 'strict' | 'flexible' | 'minimal';
  };
  confidence: number; // 0-100
  lastUpdated: Date;
}

export interface PersonaInsights {
  persona: FinancialPersona;
  personalizedTips: string[];
  nextSteps: string[];
  similarUsersStats: {
    savingsRate: number;
    emergencyFundRatio: number;
    investmentRatio: number;
  };
}

class PersonaAnalysisEngine {
  async analyzeUserPersona(userId: string): Promise<PersonaInsights> {
    try {
      // Gather comprehensive user data
      const [balance, monthlySummary, breakdown, budgetStatus, goals, recentTransactions] = await Promise.all([
        getTotalBalance(userId),
        getCurrentMonthSummary(userId),
        getExpenseBreakdown(userId),
        getBudgetStatus(userId),
        getSavingsGoals(userId),
        getRecentTransactions(userId, 50)
      ]);

      // Calculate key metrics
      const savingsRate = monthlySummary.income > 0 ? ((monthlySummary.income - monthlySummary.expenses) / monthlySummary.income) * 100 : 0;
      const emergencyFundRatio = monthlySummary.expenses > 0 ? balance / (monthlySummary.expenses * 6) : 0; // Target: 6 months
      const budgetCompliance = budgetStatus.length > 0 ? budgetStatus.filter(b => b.status !== 'danger').length / budgetStatus.length : 0;
      const goalProgress = goals.length > 0 ? goals.filter(g => g.current_amount >= g.target_amount).length / goals.length : 0;

      // Analyze spending patterns
      const spendingPatterns = this.analyzeSpendingPatterns(recentTransactions, breakdown, monthlySummary);

      // Determine primary persona
      const persona = this.determinePersona({
        savingsRate,
        emergencyFundRatio,
        budgetCompliance,
        goalProgress,
        spendingPatterns,
        transactionCount: recentTransactions.length
      });

      // Generate personalized insights
      const personalizedTips = this.generatePersonalizedTips(persona, spendingPatterns, savingsRate);
      const nextSteps = this.generateNextSteps(persona, balance, monthlySummary);

      return {
        persona,
        personalizedTips,
        nextSteps,
        similarUsersStats: {
          savingsRate: this.getSimilarUsersAverage(persona.name, 'savingsRate'),
          emergencyFundRatio: this.getSimilarUsersAverage(persona.name, 'emergencyFundRatio'),
          investmentRatio: this.getSimilarUsersAverage(persona.name, 'investmentRatio')
        }
      };

    } catch (error) {
      console.error('Error analyzing user persona:', error);
      return this.getDefaultPersona();
    }
  }

  private analyzeSpendingPatterns(transactions: any[], breakdown: any[], monthlySummary: any) {
    // Calculate transaction frequency
    const transactionFrequency = transactions.length > 30 ? 'high' : transactions.length > 15 ? 'medium' : 'low';

    // Calculate average transaction size
    const totalSpent = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    const expenseTransactions = transactions.filter(t => t.type === 'expense');
    const averageTransactionSize = expenseTransactions.length > 0 ? totalSpent / expenseTransactions.length : 0;

    // Identify top spending categories
    const topCategories = breakdown.slice(0, 3).map(cat => cat.name);

    // Determine budgeting style
    const budgetCompliance = breakdown.length > 0 ? breakdown.filter(cat => {
      // Check if spending in this category seems controlled
      return cat.value <= monthlySummary.expenses * 0.3; // Arbitrary threshold
    }).length / breakdown.length : 0;

    const budgetingStyle = budgetCompliance > 0.7 ? 'strict' : budgetCompliance > 0.4 ? 'flexible' : 'minimal';

    // Identify spending personality traits
    const traits = [];
    if (topCategories.includes('Food')) traits.push('foodie');
    if (topCategories.includes('Entertainment')) traits.push('entertainment_lover');
    if (topCategories.includes('Shopping')) traits.push('shopper');
    if (topCategories.includes('Travel')) traits.push('traveler');
    if (transactionFrequency === 'high') traits.push('frequent_spender');
    if (averageTransactionSize > monthlySummary.expenses * 0.1) traits.push('big_ticket_buyer');

    return {
      transactionFrequency,
      averageTransactionSize,
      topCategories,
      budgetingStyle,
      traits
    };
  }

  private determinePersona(metrics: any): FinancialPersona {
    const { savingsRate, emergencyFundRatio, budgetCompliance, goalProgress, spendingPatterns } = metrics;

    // Scoring system
    const scores = {
      disciplinedSaver: 0,
      budgetConscious: 0,
      goalOriented: 0,
      aspirationalSpender: 0,
      impulsiveSpender: 0,
      minimalTracker: 0
    };

    // Savings rate scoring
    if (savingsRate > 30) scores.disciplinedSaver += 30;
    else if (savingsRate > 20) scores.budgetConscious += 25;
    else if (savingsRate > 10) scores.goalOriented += 20;
    else if (savingsRate > 0) scores.aspirationalSpender += 15;
    else scores.impulsiveSpender += 10;

    // Emergency fund scoring
    if (emergencyFundRatio > 1) scores.disciplinedSaver += 25;
    else if (emergencyFundRatio > 0.5) scores.budgetConscious += 20;
    else if (emergencyFundRatio > 0.2) scores.goalOriented += 15;
    else scores.aspirationalSpender += 10;

    // Budget compliance scoring
    if (budgetCompliance > 0.8) scores.disciplinedSaver += 20;
    else if (budgetCompliance > 0.6) scores.budgetConscious += 20;
    else if (budgetCompliance > 0.4) scores.goalOriented += 15;
    else scores.aspirationalSpender += 10;

    // Goal achievement scoring
    if (goalProgress > 0.8) scores.disciplinedSaver += 25;
    else if (goalProgress > 0.6) scores.goalOriented += 25;
    else if (goalProgress > 0.3) scores.budgetConscious += 20;
    else scores.aspirationalSpender += 15;

    // Spending pattern adjustments
    if (spendingPatterns.transactionFrequency === 'high') {
      scores.impulsiveSpender += 15;
    }
    if (spendingPatterns.budgetingStyle === 'strict') {
      scores.disciplinedSaver += 15;
      scores.budgetConscious += 10;
    }
    if (spendingPatterns.traits.includes('big_ticket_buyer')) {
      scores.aspirationalSpender += 10;
    }

    // Determine primary persona
    const primaryPersona = Object.entries(scores).reduce((a, b) => scores[a[0]] > scores[b[0]] ? a : b)[0];
    const confidence = Math.min(100, Math.max(60, scores[primaryPersona]));

    return this.createPersona(primaryPersona, spendingPatterns, confidence);
  }

  private createPersona(personaType: string, spendingPatterns: any, confidence: number): FinancialPersona {
    const personas = {
      disciplinedSaver: {
        id: 'disciplined_saver',
        name: 'Disciplined Saver',
        description: 'You\'re a financial role model! You consistently save, budget carefully, and plan for the future.',
        emoji: '💰',
        traits: ['High savings rate', 'Strong budget adherence', 'Goal-oriented', 'Financially disciplined'],
        strengths: ['Excellent financial habits', 'Strong emergency fund', 'Consistent goal achievement', 'Low financial stress'],
        challenges: ['May miss enjoyable experiences', 'Could be too conservative with spending'],
        riskTolerance: 'low' as const,
        recommendedStrategies: [
          'Continue your excellent habits',
          'Consider investing surplus savings',
          'Help others learn from your success',
          'Balance saving with occasional treats'
        ],
        spendingProfile: spendingPatterns
      },

      budgetConscious: {
        id: 'budget_conscious',
        name: 'Budget Conscious',
        description: 'You\'re mindful about money and generally stick to your financial plans, with room for improvement.',
        emoji: '🎯',
        traits: ['Moderate savings', 'Good budget awareness', 'Balanced approach', 'Practical spender'],
        strengths: ['Realistic financial goals', 'Consistent budgeting', 'Balanced lifestyle', 'Financial awareness'],
        challenges: ['Could save more aggressively', 'May need better goal tracking'],
        riskTolerance: 'medium' as const,
        recommendedStrategies: [
          'Increase savings rate gradually',
          'Set more specific financial goals',
          'Track expenses more diligently',
          'Build emergency fund faster'
        ],
        spendingProfile: spendingPatterns
      },

      goalOriented: {
        id: 'goal_oriented',
        name: 'Goal Oriented',
        description: 'You set ambitious financial goals but sometimes struggle with execution and consistency.',
        emoji: '🎯',
        traits: ['Ambitious goals', 'Future-focused', 'Occasionally inconsistent', 'Motivated by targets'],
        strengths: ['Clear vision for future', 'Motivated by goals', 'Long-term thinking', 'Growth mindset'],
        challenges: ['Inconsistent execution', 'May overspend on non-goals', 'Needs better tracking'],
        riskTolerance: 'medium' as const,
        recommendedStrategies: [
          'Break big goals into smaller milestones',
          'Set up automatic savings transfers',
          'Use accountability partners',
          'Focus on one goal at a time'
        ],
        spendingProfile: spendingPatterns
      },

      aspirationalSpender: {
        id: 'aspirational_spender',
        name: 'Aspirational Spender',
        description: 'You enjoy nice things and aspire to a higher standard of living, but need better financial discipline.',
        emoji: '✨',
        traits: ['Quality-focused', 'Aspires to luxury', 'Occasional big purchases', 'Lifestyle-oriented'],
        strengths: ['Appreciates quality', 'Motivated by success', 'Socially aware', 'Ambitious'],
        challenges: ['Impulsive spending', 'Weak savings habits', 'Overextending budget'],
        riskTolerance: 'high' as const,
        recommendedStrategies: [
          'Create a "want vs need" decision framework',
          'Set luxury budgets separate from essentials',
          'Build savings before major purchases',
          'Focus on experiences over things'
        ],
        spendingProfile: spendingPatterns
      },

      impulsiveSpender: {
        id: 'impulsive_spender',
        name: 'Impulsive Spender',
        description: 'You enjoy spending and find it hard to delay gratification, leading to financial challenges.',
        emoji: '🛍️',
        traits: ['Spontaneous spending', 'Present-focused', 'Emotional purchasing', 'Social shopper'],
        strengths: ['Enjoys life experiences', 'Generous with others', 'Lives in the moment', 'Fun-loving'],
        challenges: ['Poor saving habits', 'Debt accumulation', 'Financial stress', 'Inconsistent budgeting'],
        riskTolerance: 'high' as const,
        recommendedStrategies: [
          'Implement 24-hour rule for purchases',
          'Use cash-only for discretionary spending',
          'Create spending accountability',
          'Build automatic savings first'
        ],
        spendingProfile: spendingPatterns
      },

      minimalTracker: {
        id: 'minimal_tracker',
        name: 'Minimal Tracker',
        description: 'You\'re just getting started with financial tracking and have basic awareness of your spending.',
        emoji: '🌱',
        traits: ['New to finance', 'Learning phase', 'Basic awareness', 'Growing interest'],
        strengths: ['Open to learning', 'Fresh perspective', 'No bad habits yet', 'Motivated to improve'],
        challenges: ['Limited financial knowledge', 'No established habits', 'May feel overwhelmed'],
        riskTolerance: 'low' as const,
        recommendedStrategies: [
          'Start with simple expense tracking',
          'Learn basic budgeting concepts',
          'Set one small financial goal',
          'Educate yourself gradually'
        ],
        spendingProfile: spendingPatterns
      }
    };

    const persona = personas[personaType as keyof typeof personas] || personas.minimalTracker;
    return {
      ...persona,
      confidence,
      lastUpdated: new Date()
    };
  }

  private generatePersonalizedTips(persona: FinancialPersona, spendingPatterns: any, savingsRate: number): string[] {
    const tips = [];

    switch (persona.id) {
      case 'disciplined_saver':
        tips.push('Consider allocating some savings toward investments for long-term growth');
        tips.push('Your discipline could help you achieve financial independence faster');
        if (spendingPatterns.traits.includes('foodie')) {
          tips.push('Even disciplined savers deserve nice meals - just balance with your budget');
        }
        break;

      case 'budget_conscious':
        tips.push('You\'re doing well! Focus on increasing your savings rate by 2-3% each month');
        tips.push('Consider setting up automatic transfers to your savings account');
        break;

      case 'goal_oriented':
        tips.push('Break your big goals into smaller, achievable milestones');
        tips.push('Set up visual progress trackers to stay motivated');
        break;

      case 'aspirational_spender':
        tips.push('Create a "luxury fund" separate from your essential expenses budget');
        tips.push('Wait 48 hours before making big purchases to avoid impulse buys');
        break;

      case 'impulsive_spender':
        tips.push('Try the "cash only" method for discretionary spending to reduce impulse purchases');
        tips.push('Create a 24-hour waiting period for non-essential purchases');
        tips.push('Identify your emotional spending triggers and find healthier alternatives');
        break;

      case 'minimal_tracker':
        tips.push('Start by tracking just your largest expenses to build good habits');
        tips.push('Set one simple goal: save ₹1000 this month');
        tips.push('Download financial education apps or books to learn more');
        break;
    }

    // Add spending-specific tips
    if (spendingPatterns.topCategories.includes('Food')) {
      tips.push('Consider meal planning to reduce food expenses while maintaining enjoyment');
    }
    if (spendingPatterns.topCategories.includes('Entertainment')) {
      tips.push('Look for free or low-cost entertainment alternatives in your area');
    }
    if (savingsRate < 10) {
      tips.push('Aim to save at least 10-20% of your income for financial security');
    }

    return tips;
  }

  private generateNextSteps(persona: FinancialPersona, balance: number, monthlySummary: any): string[] {
    const steps = [];

    // Universal steps
    steps.push('Set up automatic expense tracking for all transactions');

    switch (persona.id) {
      case 'disciplined_saver':
        steps.push('Explore investment options for your surplus savings');
        steps.push('Consider becoming a financial mentor for friends/family');
        steps.push('Set even more ambitious long-term goals');
        break;

      case 'budget_conscious':
        steps.push('Create a comprehensive budget for all expense categories');
        steps.push('Build your emergency fund to 6 months of expenses');
        steps.push('Start investing a portion of your savings');
        break;

      case 'goal_oriented':
        steps.push('Choose your most important goal and focus on it exclusively');
        steps.push('Set up automatic monthly transfers toward your goals');
        steps.push('Track progress daily or weekly to stay motivated');
        break;

      case 'aspirational_spender':
        steps.push('Calculate your "luxury budget" as a percentage of your income');
        steps.push('Create a wishlist and timeline for big purchases');
        steps.push('Build savings before making aspirational purchases');
        break;

      case 'impulsive_spender':
        steps.push('Identify and limit access to easy spending methods (credit cards)');
        steps.push('Create accountability by sharing goals with friends/family');
        steps.push('Build small savings habits before tackling spending control');
        break;

      case 'minimal_tracker':
        steps.push('Download a financial tracking app and start logging expenses');
        steps.push('Read one financial education book or article per week');
        steps.push('Set up automatic savings transfers to build good habits');
        break;
    }

    // Balance-specific steps
    if (balance < 5000) {
      steps.push('URGENT: Build emergency fund to at least ₹5,000 immediately');
    }

    // Income-specific steps
    if (monthlySummary.expenses > monthlySummary.income) {
      steps.push('CRITICAL: Reduce expenses below income level or increase income');
    }

    return steps;
  }

  private getSimilarUsersAverage(personaName: string, metric: string): number {
    // Simulated data - in a real app, this would come from aggregated user data
    const averages = {
      disciplinedSaver: { savingsRate: 35, emergencyFundRatio: 1.2, investmentRatio: 0.4 },
      budgetConscious: { savingsRate: 22, emergencyFundRatio: 0.8, investmentRatio: 0.25 },
      goalOriented: { savingsRate: 18, emergencyFundRatio: 0.6, investmentRatio: 0.2 },
      aspirationalSpender: { savingsRate: 12, emergencyFundRatio: 0.3, investmentRatio: 0.15 },
      impulsiveSpender: { savingsRate: 5, emergencyFundRatio: 0.1, investmentRatio: 0.05 },
      minimalTracker: { savingsRate: 8, emergencyFundRatio: 0.2, investmentRatio: 0.1 }
    };

    const personaKey = personaName.replace(/\s+/g, '') as keyof typeof averages;
    return averages[personaKey]?.[metric as keyof typeof averages[keyof typeof averages]] || 0;
  }

  private getDefaultPersona(): PersonaInsights {
    return {
      persona: {
        id: 'unknown',
        name: 'Getting to Know You',
        description: 'We\'re still analyzing your spending patterns to determine your financial persona.',
        emoji: '🤔',
        traits: ['Learning in progress'],
        strengths: ['Open to self-improvement'],
        challenges: ['Need more data'],
        riskTolerance: 'medium',
        recommendedStrategies: ['Continue tracking expenses', 'Add more transaction data'],
        spendingProfile: {
          topCategories: [],
          averageTransactionSize: 0,
          transactionFrequency: 'low',
          budgetingStyle: 'minimal'
        },
        confidence: 0,
        lastUpdated: new Date()
      },
      personalizedTips: ['Keep adding transactions to get better insights'],
      nextSteps: ['Add more expense data', 'Set up budgets', 'Create savings goals'],
      similarUsersStats: {
        savingsRate: 15,
        emergencyFundRatio: 0.5,
        investmentRatio: 0.2
      }
    };
  }
}

// Export singleton instance
export const personaAnalysisEngine = new PersonaAnalysisEngine();
export default personaAnalysisEngine;
