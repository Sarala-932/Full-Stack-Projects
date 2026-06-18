import {useEffect, useState, useMemo} from "react";
import { useUser } from "@clerk/react";
import { Link, useNavigate } from "react-router";
import CreateAccountDrawer from "../components/dashboard/CreateAccountDrawer";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Plus, ArrowUpRight, ArrowDownRight, Wallet} from "lucide-react";
import useFetch from "../hooks/useFetch";
import {getUserAccounts, getDashboardData} from "../services/dashboard.api";
import {getCurrentBudget} from "../services/budget.api";
import DashboardOverview from "@/components/dashboard/DashboardOverview";
import ExpensePieChart from "@/components/dashboard/ExpensePieChart";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

function Dashboard() {
  const { user } = useUser();
  const navigate = useNavigate();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const {
    data: accounts,
    loading: accountsLoading,
    fn: fetchAccounts,
  } = useFetch(getUserAccounts);

  const {
    data: transactions,
    loading: transactionsLoading,
    fn: fetchTransactions,
  } = useFetch(getDashboardData);

  useEffect(() => {
    fetchAccounts();
    fetchTransactions();
  }, []);

  const defaultAccount = accounts?.find((account) => account.isDefault);

  const {
    data: budgetResponse,
    loading: budgetLoading,
    fn: fetchBudget,
  } = useFetch(getCurrentBudget);

  useEffect(() => {
    if (defaultAccount) {
      fetchBudget(defaultAccount._id);
    }
  }, [defaultAccount]);

  // Calculations for summary cards
  const totalBalance = useMemo(() => {
    if (!accounts) return 0;
    return accounts.reduce((sum, account) => sum + account.balance, 0);
  }, [accounts]);

  const { incomeThisMonth, expensesThisMonth, incomeCount, expenseCount } = useMemo(() => {
    let inc = 0, exp = 0, iCount = 0, eCount = 0;
    if (!transactions) return { incomeThisMonth: 0, expensesThisMonth: 0, incomeCount: 0, expenseCount: 0 };
    
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    transactions.forEach(t => {
      const tDate = new Date(t.date);
      if (tDate.getMonth() === currentMonth && tDate.getFullYear() === currentYear) {
        if (t.type === "INCOME") {
          inc += t.amount;
          iCount++;
        } else if (t.type === "EXPENSE") {
          exp += t.amount;
          eCount++;
        }
      }
    });
    return { incomeThisMonth: inc, expensesThisMonth: exp, incomeCount: iCount, expenseCount: eCount };
  }, [transactions]);

  const budgetPercentage = useMemo(() => {
    if (!budgetResponse?.data?.budget?.amount || budgetResponse.data.budget.amount === 0) return 0;
    const used = budgetResponse.data.currentExpenses || 0;
    return Math.min(Math.round((used / budgetResponse.data.budget.amount) * 100), 100);
  }, [budgetResponse]);

  const recentTransactions = transactions ? transactions.slice(0, 5) : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight gradient-title">Hello, {user?.firstName || "User"}</h1>
          <p className="text-muted-foreground text-sm">Here's your financial overview</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="cursor-pointer" onClick={() => setIsDrawerOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Account
          </Button>
          {/* <Link to="/transaction/create">
            <Button className="cursor-pointer">
              <Plus className="mr-2 h-4 w-4" />
              Add transaction
            </Button>
          </Link> */}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:shadow-md transition-shadow bg-linear-to-br from-primary/5 via-primary/10 to-transparent border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalBalance.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Across {accounts?.length || 0} accounts
            </p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Income this month</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">₹{incomeThisMonth.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {incomeCount} transactions
            </p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expenses this month</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">₹{expensesThisMonth.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {expenseCount} transactions
            </p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Budget used</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{budgetPercentage}%</div>
            <div className="mt-2 h-2 w-full bg-secondary rounded-full overflow-hidden">
              <div 
                className={cn(
                  "h-full rounded-full transition-all",
                  budgetPercentage >= 90 ? "bg-red-500" : budgetPercentage >= 75 ? "bg-yellow-500" : "bg-primary"
                )}
                style={{ width: `${budgetPercentage}%` }}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <DashboardOverview transactions={transactions || []} />
        </div>
        <div className="lg:col-span-1">
          <ExpensePieChart transactions={transactions || []} />
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid gap-4 md:grid-cols-2">
        
        {/* Accounts List */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-medium">Accounts</CardTitle>
            <Link to="/accounts" className="text-sm text-muted-foreground hover:text-foreground">
              <Button variant="outline" size="sm">View all</Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            {accounts?.map((account) => (
              <Link key={account._id} to={`/accounts/${account._id}`}>
                <div className="flex items-center justify-between p-2 hover:bg-muted/50 rounded-lg cursor-pointer transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-secondary rounded-full">
                      <Wallet className="h-4 w-4" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">{account.name}</p>
                      <p className="text-xs text-muted-foreground">{account.bankName} - {account.type}</p>
                    </div>
                  </div>
                  <div className="text-sm font-bold">
                    ₹{account.balance.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </div>
                </div>
              </Link>
            ))}
            {(!accounts || accounts.length === 0) && !accountsLoading && (
              <p className="text-center text-sm text-muted-foreground">No accounts found</p>
            )}
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-medium">Recent transactions</CardTitle>
            <Link to="/transactions" className="text-sm text-muted-foreground hover:text-foreground">
              <Button variant="outline" size="sm">View all</Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            {recentTransactions.map((transaction) => (
              <div key={transaction._id} className="flex items-center justify-between p-2 hover:bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-secondary rounded-full capitalize text-xs font-semibold w-9 h-9 flex items-center justify-center">
                    {transaction.category ? transaction.category.substring(0, 1) : "T"}
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">{transaction.description || transaction.category}</p>
                    <p className="text-xs text-muted-foreground">{format(new Date(transaction.date), "MMM dd")}</p>
                  </div>
                </div>
                <div className={cn(
                  "text-sm font-bold flex items-center",
                  transaction.type === "INCOME" ? "text-green-500" : "text-red-500"
                )}>
                  {transaction.type === "INCOME" ? "+" : "-"}₹{Math.abs(transaction.amount).toLocaleString("en-IN")}
                </div>
              </div>
            ))}
            {recentTransactions.length === 0 && !transactionsLoading && (
              <p className="text-center text-sm text-muted-foreground">No recent transactions</p>
            )}
          </CardContent>
        </Card>
      </div>

      <CreateAccountDrawer
        open={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onSuccess={() => navigate("/accounts")}
      />
    </div>
  );
}

export default Dashboard;
