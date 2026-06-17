import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import AccountCard from "@/components/dashboard/AccountCard";
import CreateAccountDrawer from "@/components/dashboard/CreateAccountDrawer";
import useFetch from "@/hooks/useFetch";
import { getUserAccounts } from "@/services/dashboard.api";

export default function AccountsList() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const {
    data: accounts,
    loading: accountsLoading,
    fn: fetchAccounts,
    setData: setAccounts,
  } = useFetch(getUserAccounts);

  useEffect(() => {
    fetchAccounts();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-bold tracking-tight gradient-title">Your Accounts</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Create Account Card */}
        <Card
          className="hover:shadow-md transition-shadow cursor-pointer border-dashed flex flex-col items-center justify-center p-6"
          onClick={() => setIsDrawerOpen(true)}
        >
          <CardContent className="flex flex-col items-center justify-center pt-6">
            <Plus className="h-10 w-10 mb-2 text-muted-foreground" />
            <p className="text-sm font-medium text-muted-foreground">Add New Account</p>
          </CardContent>
        </Card>

        {/* Loading Skeletons */}
        {accountsLoading && !accounts && (
          <>
            <Card className="animate-pulse flex flex-col p-6 h-48 border bg-muted/50" />
            <Card className="animate-pulse flex flex-col p-6 h-48 border bg-muted/50" />
            <Card className="animate-pulse flex flex-col p-6 h-48 border bg-muted/50" />
          </>
        )}

        {/* Existing Accounts */}
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
