import {useEffect, useState} from "react";
import CreateAccountDrawer from "../components/dashboard/CreateAccountDrawer";
import {Card, CardContent} from "@/components/ui/card";
import {Plus} from "lucide-react";
import useFetch from "../hooks/useFetch";
import {getUserAccounts, getDashboardData} from "../services/dashboard.api";
import AccountCard from "@/components/dashboard/AccountCard";
import BudgetProgress from "@/components/dashboard/BudgetProgress";
import {getCurrentBudget} from "../services/budget.api";
import DashboardOverview from "@/components/dashboard/DashboardOverview";

function Dashboard() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const {
    data: accounts,
    loading: accountsLoading,
    fn: fetchAccounts,
    setData: setAccounts,
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

  // useEffect(() => {
  //   if (budgetResponse) {
  //     console.log("Budget Data", budgetResponse); // ✅ logs when data arrives
  //   }
  // }, [budgetResponse]);

  return (
    <div className="px-5 space-y-8 pt-30">
      {/* {Heading} */}
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-6xl font-bold tracking-tight gradient-title">Dashboard</h1>
      </div>

      {/* budget progress */}

      {defaultAccount && (
        <BudgetProgress
          initialBudget={budgetResponse?.data?.budget}
          currentExpenses={budgetResponse?.data?.currentExpenses || 0}
          onUpdate={() => fetchBudget(defaultAccount._id)}
        />
      )}

      {/* overview */}
      {transactions && (
        <DashboardOverview
          accounts={accounts}
          transactions={transactions || []}
        />
      )}

      {/* accounts grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Create Account Card */}
        <Card
          className="hover:shadow-md transition-shadow cursor-pointer border-dashed flex flex-col items-center justify-center p-6"
          onClick={() => {
            console.log("Opening drawer");
            setIsDrawerOpen(true);
          }}
        >
          <CardContent className="flex flex-col items-center justify-center pt-6">
            <Plus className="h-10 w-10 mb-2 text-muted-foreground" />
            <p className="text-sm font-medium text-muted-foreground">Add New Account</p>
          </CardContent>
        </Card>

        {/* Existing Accounts */}
        {accountsLoading && !accounts && (
          <>
            <Card className="animate-pulse flex flex-col p-6 h-48 border bg-muted/50" />
            <Card className="animate-pulse flex flex-col p-6 h-48 border bg-muted/50" />
            <Card className="animate-pulse flex flex-col p-6 h-48 border bg-muted/50" />
          </>
        )}

        {accounts?.map((account) => (
          <AccountCard
            key={account._id}
            account={account}
            onUpdate={fetchAccounts}
            onOptimisticUpdate={(id) => {
              if (accounts) {
                setAccounts(
                  accounts.map((acc) => ({
                    ...acc,
                    isDefault: acc._id === id,
                  })),
                );
              }
            }}
          />
        ))}
      </div>

      <CreateAccountDrawer
        open={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onSuccess={() => fetchAccounts()}
      />
    </div>
  );
}

export default Dashboard;
