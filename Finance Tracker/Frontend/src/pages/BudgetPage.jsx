import { useEffect, useState } from "react";
import BudgetProgress from "@/components/dashboard/BudgetProgress";
import useFetch from "@/hooks/useFetch";
import { getUserAccounts } from "@/services/dashboard.api";
import { getCurrentBudget } from "@/services/budget.api";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function BudgetPage() {
  const {
    data: accounts,
    loading: accountsLoading,
    fn: fetchAccounts,
  } = useFetch(getUserAccounts);

  useEffect(() => {
    fetchAccounts();
  }, []);

  const [selectedAccountId, setSelectedAccountId] = useState(null);

  useEffect(() => {
    if (accounts?.length > 0 && !selectedAccountId) {
      const defaultAcc = accounts.find(a => a.isDefault) || accounts[0];
      setSelectedAccountId(defaultAcc._id);
    }
  }, [accounts]);

  const {
    data: budgetResponse,
    loading: budgetLoading,
    fn: fetchBudget,
  } = useFetch(getCurrentBudget);

  useEffect(() => {
    if (selectedAccountId) {
      fetchBudget(selectedAccountId);
    }
  }, [selectedAccountId]);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight gradient-title">Budget Management</h1>
        {accounts?.length > 0 && (
          <div className="w-64">
            <Select value={selectedAccountId} onValueChange={setSelectedAccountId}>
              <SelectTrigger>
                <SelectValue placeholder="Select account" />
              </SelectTrigger>
              <SelectContent>
                {accounts.map(acc => (
                  <SelectItem key={acc._id} value={acc._id}>
                    {acc.name} ({acc.bankName})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {!accountsLoading && accounts?.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground">
            <p>No accounts found.</p>
            <p className="text-sm mt-1">Please create an account to manage your budget.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="max-w-3xl">
          {selectedAccountId && (
            <div className="space-y-4">
              <BudgetProgress
                accountId={selectedAccountId}
                initialBudget={budgetResponse?.data?.budget}
                currentExpenses={budgetResponse?.data?.currentExpenses || 0}
                categoryExpenses={budgetResponse?.data?.categoryExpenses || {}}
                onUpdate={() => fetchBudget(selectedAccountId)}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
