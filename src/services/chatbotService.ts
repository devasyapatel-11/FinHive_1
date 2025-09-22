import {
  getRecentTransactions,
  getTotalBalance,
  getCurrentMonthSummary,
  getExpenseBreakdown,
  getSavingsGoals,
  getBudgets,
  getBudgetStatus,
  formatIndianCurrency
} from './financeService';

export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  time: string;
  type?: 'text' | 'insight' | 'warning' | 'suggestion';
}

// Predefined responses for common queries
const COMMON_RESPONSES = {
  greetings: [
    "Hello! I'm your FinHive AI assistant. I can help you with questions about your finances, spending patterns, budgets, and savings goals. What would you like to know?",
    "Hi there! I'm here to help you understand your financial data better. Ask me anything about your transactions, budgets, or spending habits!",
    "Welcome to FinHive AI! I can analyze your financial data and provide personalized insights. What financial question can I help you with today?"
  ],

  help: `I can help you with:
• 💰 Your current balance and spending summary
• 📊 Monthly spending breakdown by category
• 🎯 Budget status and recommendations
• 💸 Recent transactions and patterns
• 🎯 Savings goals progress
• 📈 Financial insights and tips
• 💡 Spending suggestions

Try asking:
• "What's my balance?"
• "How much did I spend this month?"
• "Show me my budget status"
• "What's my biggest expense category?"
• "How are my savings goals doing?"`,

  unknown: [
    "I'm not sure I understand that question. Try asking about your balance, spending, budgets, or savings goals!",
    "I can help with financial questions! Ask me about your balance, spending patterns, budgets, or savings goals.",
    "Let me help you with your finances. Try questions like 'What's my balance?' or 'Show me my spending breakdown'."
  ]
};

// Natural language processing for common queries
function processQuery(query: string): {
  intent: string;
  entities: string[];
  confidence: number;
} {
  const lowerQuery = query.toLowerCase();

  // Balance queries
  if (lowerQuery.includes('balance') || lowerQuery.includes('money do i have')) {
    return { intent: 'balance', entities: [], confidence: 0.9 };
  }

  // Monthly summary queries
  if ((lowerQuery.includes('spend') || lowerQuery.includes('spent')) &&
      (lowerQuery.includes('month') || lowerQuery.includes('this month'))) {
    return { intent: 'monthly_summary', entities: [], confidence: 0.9 };
  }

  // Budget queries
  if (lowerQuery.includes('budget') || lowerQuery.includes('limit')) {
    return { intent: 'budget_status', entities: [], confidence: 0.9 };
  }

  // Expense breakdown queries
  if (lowerQuery.includes('breakdown') || lowerQuery.includes('categories') ||
      lowerQuery.includes('biggest') || lowerQuery.includes('most')) {
    return { intent: 'expense_breakdown', entities: [], confidence: 0.9 };
  }

  // Recent transactions
  if (lowerQuery.includes('recent') || lowerQuery.includes('last') ||
      (lowerQuery.includes('transaction') && !lowerQuery.includes('total'))) {
    return { intent: 'recent_transactions', entities: [], confidence: 0.8 };
  }

  // Savings goals
  if (lowerQuery.includes('saving') || lowerQuery.includes('goal') ||
      lowerQuery.includes('target')) {
    return { intent: 'savings_goals', entities: [], confidence: 0.8 };
  }

  // Help queries
  if (lowerQuery.includes('help') || lowerQuery.includes('what can you do') ||
      lowerQuery.includes('commands')) {
    return { intent: 'help', entities: [], confidence: 0.9 };
  }

  // Greeting queries
  if (lowerQuery.includes('hello') || lowerQuery.includes('hi') ||
      lowerQuery.includes('hey') || lowerQuery.includes('good morning')) {
    return { intent: 'greeting', entities: [], confidence: 0.9 };
  }

  return { intent: 'unknown', entities: [], confidence: 0.1 };
}

export async function generateBotResponse(userId: string, userQuery: string): Promise<ChatMessage> {
  const { intent } = processQuery(userQuery);

  try {
    let response = '';
    let type: 'text' | 'insight' | 'warning' | 'suggestion' = 'text';

    switch (intent) {
      case 'greeting':
        response = COMMON_RESPONSES.greetings[Math.floor(Math.random() * COMMON_RESPONSES.greetings.length)];
        break;

      case 'help':
        response = COMMON_RESPONSES.help;
        break;

      case 'balance':
        const balance = await getTotalBalance(userId);
        response = `💰 **Your Current Balance**\n\nYou have ${formatIndianCurrency(balance)} in your accounts right now.`;
        if (balance > 0) {
          response += `\n\n💡 **Tip:** Consider setting aside some savings from this balance!`;
        } else {
          response += `\n\n⚠️ **Note:** Your balance is negative. You might want to review your recent expenses.`;
        }
        type = 'insight';
        break;

      case 'monthly_summary':
        const monthlySummary = await getCurrentMonthSummary(userId);
        response = `📊 **This Month's Summary**\n\n` +
          `💸 **Income:** ${formatIndianCurrency(monthlySummary.income)}\n` +
          `💰 **Expenses:** ${formatIndianCurrency(monthlySummary.expenses)}\n` +
          `📈 **Net:** ${formatIndianCurrency(monthlySummary.income - monthlySummary.expenses)}\n\n`;

        if (monthlySummary.expenses > monthlySummary.income) {
          response += `⚠️ **Warning:** You're spending more than you're earning this month. Consider reviewing your budget!`;
          type = 'warning';
        } else {
          response += `✅ **Great job!** You're staying within your income this month.`;
          type = 'insight';
        }
        break;

      case 'budget_status':
        const budgetStatus = await getBudgetStatus(userId);
        if (budgetStatus.length === 0) {
          response = `🎯 **Budget Status**\n\nYou haven't set up any budgets yet. Would you like to create some spending limits for different categories?\n\n💡 **Tip:** Start with your biggest expense categories like Food, Transport, and Entertainment.`;
          type = 'suggestion';
        } else {
          response = `🎯 **Budget Status**\n\n`;
          const goodBudgets = budgetStatus.filter(b => b.status === 'good');
          const warningBudgets = budgetStatus.filter(b => b.status === 'warning');
          const dangerBudgets = budgetStatus.filter(b => b.status === 'danger');

          response += `✅ **On Track:** ${goodBudgets.length} budgets\n`;
          response += `⚠️ **Watch Out:** ${warningBudgets.length} budgets\n`;
          response += `🚨 **Over Budget:** ${dangerBudgets.length} budgets\n\n`;

          if (dangerBudgets.length > 0) {
            response += `🚨 **Categories over budget:**\n`;
            dangerBudgets.forEach(budget => {
              response += `• ${budget.category}: ${formatIndianCurrency(budget.spent)} / ${formatIndianCurrency(budget.limit)} (${Math.round(budget.percentage)}%)\n`;
            });
            response += `\n💡 **Suggestion:** Consider reducing spending in these categories or increasing your budget limits.`;
            type = 'warning';
          } else if (warningBudgets.length > 0) {
            response += `⚠️ **Categories approaching limit:**\n`;
            warningBudgets.forEach(budget => {
              response += `• ${budget.category}: ${formatIndianCurrency(budget.spent)} / ${formatIndianCurrency(budget.limit)} (${Math.round(budget.percentage)}%)\n`;
            });
            type = 'suggestion';
          }
        }
        break;

      case 'expense_breakdown':
        const breakdown = await getExpenseBreakdown(userId);
        if (breakdown.length === 0) {
          response = `📊 **Spending Breakdown**\n\nI don't see any expenses recorded yet. Start adding transactions to see your spending patterns!`;
        } else {
          response = `📊 **Your Top Spending Categories (This Month)**\n\n`;
          breakdown.slice(0, 5).forEach((category, index) => {
            const emoji = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣'][index] || '📊';
            response += `${emoji} **${category.name}:** ${formatIndianCurrency(category.value)}\n`;
          });

          const totalSpent = breakdown.reduce((sum, cat) => sum + cat.value, 0);
          response += `\n💰 **Total Spent:** ${formatIndianCurrency(totalSpent)}`;

          // Find potential savings
          const largestCategory = breakdown[0];
          if (largestCategory && largestCategory.value > totalSpent * 0.3) {
            response += `\n\n💡 **Insight:** ${largestCategory.name} is your biggest expense category (${Math.round((largestCategory.value / totalSpent) * 100)}% of spending). Consider if you can reduce spending here!`;
            type = 'insight';
          }
        }
        break;

      case 'recent_transactions':
        const recentTransactions = await getRecentTransactions(userId, 5);
        if (recentTransactions.length === 0) {
          response = `📝 **Recent Transactions**\n\nNo transactions found. Start adding your expenses and income to track your finances!`;
        } else {
          response = `📝 **Your Recent Transactions**\n\n`;
          recentTransactions.forEach((transaction, index) => {
            const emoji = transaction.type === 'income' ? '💰' : '💸';
            const amount = transaction.type === 'income' ? `+${formatIndianCurrency(transaction.amount)}` : `-${formatIndianCurrency(transaction.amount)}`;
            response += `${emoji} ${transaction.description || transaction.category} - ${amount}\n`;
          });

          response += `\n💡 **Tip:** Regular transaction tracking helps you understand your spending habits better!`;
        }
        break;

      case 'savings_goals':
        const goals = await getSavingsGoals(userId);
        if (goals.length === 0) {
          response = `🎯 **Savings Goals**\n\nYou haven't set up any savings goals yet. Setting financial goals is a great way to build wealth!\n\n💡 **Suggestions:**\n• Emergency fund (3-6 months of expenses)\n• Vacation fund\n• New laptop/phone fund\n• Investment starting fund`;
          type = 'suggestion';
        } else {
          response = `🎯 **Your Savings Goals**\n\n`;
          goals.forEach(goal => {
            const progress = goal.target_amount > 0 ? (goal.current_amount / goal.target_amount) * 100 : 0;
            const remaining = goal.target_amount - goal.current_amount;
            response += `📈 **${goal.title}**\n`;
            response += `   Progress: ${formatIndianCurrency(goal.current_amount)} / ${formatIndianCurrency(goal.target_amount)} (${Math.round(progress)}%)\n`;
            if (remaining > 0) {
              response += `   Remaining: ${formatIndianCurrency(remaining)}\n\n`;
            } else {
              response += `   🎉 **Goal achieved!**\n\n`;
            }
          });

          const completedGoals = goals.filter(g => g.current_amount >= g.target_amount);
          if (completedGoals.length > 0) {
            response += `🏆 **Congratulations!** You've achieved ${completedGoals.length} savings goal(s)!`;
            type = 'insight';
          }
        }
        break;

      default:
        response = COMMON_RESPONSES.unknown[Math.floor(Math.random() * COMMON_RESPONSES.unknown.length)];
        break;
    }

    return {
      id: `bot_${Date.now()}`,
      text: response,
      sender: 'bot',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type
    };

  } catch (error) {
    console.error('Error generating bot response:', error);
    return {
      id: `bot_${Date.now()}`,
      text: "Sorry, I'm having trouble accessing your financial data right now. Please try again in a moment.",
      sender: 'bot',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'text'
    };
  }
}

// Get suggested questions based on user data
export async function getSuggestedQuestions(userId: string): Promise<string[]> {
  const suggestions = [
    "What's my current balance?",
    "How much did I spend this month?",
    "Show me my budget status",
    "What's my biggest expense category?"
  ];

  try {
    // Add dynamic suggestions based on user data
    const balance = await getTotalBalance(userId);
    if (balance < 1000) {
      suggestions.push("Help me create a budget");
    }

    const monthlySummary = await getCurrentMonthSummary(userId);
    if (monthlySummary.expenses > monthlySummary.income) {
      suggestions.push("Why am I overspending?");
    }

    const budgetStatus = await getBudgetStatus(userId);
    const dangerBudgets = budgetStatus.filter(b => b.status === 'danger');
    if (dangerBudgets.length > 0) {
      suggestions.push("Which budgets am I over?");
    }

  } catch (error) {
    console.error('Error generating suggestions:', error);
  }

  return suggestions.slice(0, 6); // Return up to 6 suggestions
}
