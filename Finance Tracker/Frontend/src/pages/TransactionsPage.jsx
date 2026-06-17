import { useEffect, useState } from "react";
import { Link } from "react-router";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TransactionTable from "@/components/account/TransactionTable";
import useFetch from "@/hooks/useFetch";
import { getDashboardData } from "@/services/dashboard.api";

export default function TransactionsPage() {
  const {
    data: transactions,
    loading: transactionsLoading,
    fn: fetchTransactions,
  } = useFetch(getDashboardData);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const recurringTransactions = transactions?.filter(t => t.isRecurring) || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-4xl font-bold tracking-tight gradient-title">Transactions</h1>
        <Link to="/transaction/create">
          <Button className="cursor-pointer">
            <Plus className="mr-2 h-4 w-4" />
            Add transaction
          </Button>
        </Link>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full max-w-[400px] grid-cols-2 mb-6">
          <TabsTrigger value="all" className="cursor-pointer">All Transactions</TabsTrigger>
          <TabsTrigger value="recurring" className="cursor-pointer">Recurring</TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="mt-6">
          {transactionsLoading && !transactions ? (
            <div className="flex justify-center p-8 text-muted-foreground">Loading transactions...</div>
          ) : (
            <TransactionTable transactions={transactions || []} />
          )}
        </TabsContent>
        <TabsContent value="recurring" className="mt-6">
          {transactionsLoading && !transactions ? (
            <div className="flex justify-center p-8 text-muted-foreground">Loading transactions...</div>
          ) : recurringTransactions.length > 0 ? (
            <TransactionTable transactions={recurringTransactions} />
          ) : (
            <div className="flex flex-col items-center justify-center p-12 text-center border rounded-lg bg-card text-muted-foreground">
              <p>No recurring transactions found.</p>
              <p className="text-sm mt-1">Set up a recurring transaction to see it here.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
