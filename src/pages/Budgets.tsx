import { useState, useEffect } from "react";
import PageTemplate from './PageTemplate';
import { useAuth } from "@/hooks/useAuth";
import { getBudgets, saveBudget, getBudgetStatus, deleteBudget, formatIndianCurrency } from "@/services/financeService";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Trash2, Plus, Target, AlertTriangle, CheckCircle } from "lucide-react";
import { toast } from "sonner";

type Budget = {
  id: string;
  user_id: string;
  category: string;
  monthly_limit: number;
  spent_amount: number;
  period: string;
  start_date: string;
  end_date: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

type BudgetStatus = {
  category: string;
  limit: number;
  spent: number;
  remaining: number;
  percentage: number;
  status: 'good' | 'warning' | 'danger';
};

const commonCategories = [
  'Food',
  'Transport',
  'Entertainment',
  'Shopping',
  'Utilities',
  'Healthcare',
  'Education',
  'Rent',
  'Travel',
  'Other'
];

const Budgets = () => {
  const { user } = useAuth();
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [budgetStatus, setBudgetStatus] = useState<BudgetStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [budgetLimit, setBudgetLimit] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      loadBudgets();
    }
  }, [user]);

  const loadBudgets = async () => {
    try {
      setIsLoading(true);
      const [budgetsData, statusData] = await Promise.all([
        getBudgets(user!.id),
        getBudgetStatus(user!.id)
      ]);
      setBudgets(budgetsData);
      setBudgetStatus(statusData);
    } catch (error) {
      console.error('Error loading budgets:', error);
      toast.error('Failed to load budgets');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveBudget = async () => {
    if (!selectedCategory || !budgetLimit) {
      toast.error('Please fill in all fields');
      return;
    }

    const limit = parseFloat(budgetLimit);
    if (isNaN(limit) || limit <= 0) {
      toast.error('Please enter a valid budget limit');
      return;
    }

    try {
      setIsSubmitting(true);
      await saveBudget(user!.id, {
        category: selectedCategory,
        monthly_limit: limit
      });

      toast.success('Budget saved successfully!');
      setIsDialogOpen(false);
      setSelectedCategory('');
      setBudgetLimit('');
      await loadBudgets();
    } catch (error) {
      console.error('Error saving budget:', error);
      toast.error('Failed to save budget');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteBudget = async (budgetId: string) => {
    try {
      await deleteBudget(budgetId, user!.id);
      toast.success('Budget deleted successfully!');
      await loadBudgets();
    } catch (error) {
      console.error('Error deleting budget:', error);
      toast.error('Failed to delete budget');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'good':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'danger':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'danger':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading your budgets...</p>
        </div>
      </div>
    );
  }

  return (
    <PageTemplate title="Budgets">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-muted-foreground">Set spending limits and track your progress</p>
          </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Budget
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Budget</DialogTitle>
              <DialogDescription>
                Set a monthly spending limit for a category
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="category" className="text-right">
                  Category
                </Label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {commonCategories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="limit" className="text-right">
                  Monthly Limit
                </Label>
                <Input
                  id="limit"
                  type="number"
                  placeholder="Enter amount"
                  value={budgetLimit}
                  onChange={(e) => setBudgetLimit(e.target.value)}
                  className="col-span-3"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                onClick={handleSaveBudget}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Saving...' : 'Save Budget'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {budgetStatus.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Target className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No budgets set</h3>
            <p className="text-muted-foreground text-center mb-4">
              Create your first budget to start tracking your spending limits
            </p>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Budget
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {budgetStatus.map((status) => (
            <Card key={status.category} className="relative">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{status.category}</CardTitle>
                    <CardDescription className="flex items-center gap-2">
                      {getStatusIcon(status.status)}
                      <span className="capitalize">{status.status}</span>
                    </CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const budget = budgets.find(b => b.category === status.category);
                      if (budget) handleDeleteBudget(budget.id);
                    }}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Spent</span>
                    <span>{formatIndianCurrency(status.spent)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Limit</span>
                    <span>{formatIndianCurrency(status.limit)}</span>
                  </div>
                  <Progress
                    value={status.percentage}
                    className={`h-2 ${status.status === 'danger' ? '[&>div]:bg-red-500' :
                                 status.status === 'warning' ? '[&>div]:bg-yellow-500' :
                                 '[&>div]:bg-green-500'}`}
                  />
                  <div className="flex justify-between text-sm">
                    <span>Remaining</span>
                    <span className={status.remaining < 0 ? 'text-red-600 font-semibold' : ''}>
                      {formatIndianCurrency(status.remaining)}
                    </span>
                  </div>
                </div>

                <Badge
                  variant="outline"
                  className={getStatusColor(status.status)}
                >
                  {Math.round(status.percentage)}% used
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Summary Stats */}
      {budgetStatus.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Budget Summary</CardTitle>
            <CardDescription>Overview of your spending against budgets</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {budgetStatus.filter(b => b.status === 'good').length}
                </div>
                <div className="text-sm text-muted-foreground">On Track</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {budgetStatus.filter(b => b.status === 'warning').length}
                </div>
                <div className="text-sm text-muted-foreground">Watch Out</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {budgetStatus.filter(b => b.status === 'danger').length}
                </div>
                <div className="text-sm text-muted-foreground">Over Budget</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      </div>
    </PageTemplate>
  );
};

export default Budgets;
