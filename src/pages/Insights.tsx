import { useState, useEffect } from "react";
import PageTemplate from './PageTemplate';
import { useAuth } from "@/hooks/useAuth";
import { insightsEngine, FinancialInsight, FinancialPersona } from "@/services/insightsService";
import { formatIndianCurrency } from "@/services/financeService";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Target,
  Trophy,
  BarChart3,
  Lightbulb,
  RefreshCw,
  User,
  Wallet,
  PiggyBank,
  ShoppingBag,
  DollarSign
} from "lucide-react";
import { toast } from "sonner";

const Insights = () => {
  const { user } = useAuth();
  const [insights, setInsights] = useState<FinancialInsight[]>([]);
  const [persona, setPersona] = useState<FinancialPersona | null>(null);
  const [quickStats, setQuickStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (user) {
      loadInsights();
    }
  }, [user]);

  const loadInsights = async () => {
    try {
      setIsRefreshing(true);
      const [insightsData, personaData, statsData] = await Promise.all([
        insightsEngine.generateInsights(user!.id),
        insightsEngine.analyzeFinancialPersona(user!.id),
        insightsEngine.getQuickStats(user!.id)
      ]);

      setInsights(insightsData);
      setPersona(personaData);
      setQuickStats(statsData);
    } catch (error) {
      console.error('Error loading insights:', error);
      toast.error('Failed to load insights');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'savings_opportunity':
        return <PiggyBank className="h-5 w-5 text-green-600" />;
      case 'spending_alert':
        return <AlertTriangle className="h-5 w-5 text-orange-600" />;
      case 'budget_warning':
        return <Target className="h-5 w-5 text-red-600" />;
      case 'goal_progress':
        return <TrendingUp className="h-5 w-5 text-blue-600" />;
      case 'trend_analysis':
        return <BarChart3 className="h-5 w-5 text-purple-600" />;
      case 'milestone_achievement':
        return <Trophy className="h-5 w-5 text-yellow-600" />;
      default:
        return <Lightbulb className="h-5 w-5 text-gray-600" />;
    }
  };

  const getInsightColor = (impact: string) => {
    switch (impact) {
      case 'high':
        return 'border-l-red-500 bg-red-50';
      case 'medium':
        return 'border-l-orange-500 bg-orange-50';
      case 'low':
        return 'border-l-blue-500 bg-blue-50';
      default:
        return 'border-l-gray-500 bg-gray-50';
    }
  };

  const getPersonaIcon = (type: string) => {
    switch (type) {
      case 'disciplined_saver':
        return <Trophy className="h-6 w-6 text-yellow-600" />;
      case 'budget_conscious':
        return <Target className="h-6 w-6 text-green-600" />;
      case 'goal_oriented':
        return <TrendingUp className="h-6 w-6 text-blue-600" />;
      case 'impulsive_spender':
        return <ShoppingBag className="h-6 w-6 text-orange-600" />;
      default:
        return <User className="h-6 w-6 text-gray-600" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Analyzing your financial data...</p>
        </div>
      </div>
    );
  }

  return (
    <PageTemplate title="Financial Insights">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <p className="text-muted-foreground">Personalized analysis and recommendations for your finances</p>
          </div>
          <Button
            onClick={loadInsights}
            disabled={isRefreshing}
            variant="outline"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh Insights
          </Button>
        </div>

        {/* Quick Stats */}
        {quickStats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Wallet className="h-8 w-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-muted-foreground">Total Balance</p>
                    <p className="text-2xl font-bold">{formatIndianCurrency(quickStats.totalBalance)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <DollarSign className="h-8 w-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-muted-foreground">Monthly Income</p>
                    <p className="text-2xl font-bold">{formatIndianCurrency(quickStats.monthlyIncome)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <TrendingDown className="h-8 w-8 text-red-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-muted-foreground">Monthly Expenses</p>
                    <p className="text-2xl font-bold">{formatIndianCurrency(quickStats.monthlyExpenses)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <PiggyBank className="h-8 w-8 text-purple-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-muted-foreground">Savings Rate</p>
                    <p className="text-2xl font-bold">{Math.round(quickStats.savingsRate)}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Financial Persona */}
        {persona && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {getPersonaIcon(persona.type)}
                Your Financial Persona
              </CardTitle>
              <CardDescription>
                Based on your spending patterns and financial habits
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold capitalize mb-2">
                  {persona.type.replace('_', ' ')}
                </h3>
                <p className="text-muted-foreground mb-4">{persona.description}</p>

                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span>Financial Discipline Score</span>
                    <span>{Math.round(persona.score)}%</span>
                  </div>
                  <Progress value={persona.score} className="h-2" />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-green-700 mb-2">💪 Strengths</h4>
                    <ul className="text-sm space-y-1">
                      {persona.strengths.map((strength, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                          {strength}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-medium text-orange-700 mb-2">🎯 Areas for Improvement</h4>
                    <ul className="text-sm space-y-1">
                      {persona.improvementAreas.map((area, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-orange-500 rounded-full"></div>
                          {area}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Insights */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Personalized Insights</h2>

          {insights.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <BarChart3 className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No insights available</h3>
                <p className="text-muted-foreground text-center max-w-md">
                  Add some financial data like transactions, budgets, or savings goals to see personalized insights and recommendations.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {insights.map((insight) => (
                <Card key={insight.id} className={`border-l-4 ${getInsightColor(insight.impact)}`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        {getInsightIcon(insight.type)}
                        <CardTitle className="text-lg">{insight.title}</CardTitle>
                      </div>
                      <Badge
                        variant={insight.impact === 'high' ? 'destructive' : insight.impact === 'medium' ? 'default' : 'secondary'}
                      >
                        {insight.impact} priority
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-muted-foreground">{insight.description}</p>

                    {insight.amount && (
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">Amount:</span>
                        <span className="text-sm">{formatIndianCurrency(insight.amount)}</span>
                      </div>
                    )}

                    {insight.percentage && (
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">Percentage:</span>
                        <span className="text-sm">{Math.round(insight.percentage)}%</span>
                      </div>
                    )}

                    {insight.recommendation && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <p className="text-sm text-blue-800">
                          <strong>💡 Recommendation:</strong> {insight.recommendation}
                        </p>
                      </div>
                    )}

                    {insight.category && (
                      <Badge variant="outline">
                        Category: {insight.category}
                      </Badge>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </PageTemplate>
  );
}

export default Insights;
