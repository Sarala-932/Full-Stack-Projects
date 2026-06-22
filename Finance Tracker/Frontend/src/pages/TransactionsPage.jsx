import {useEffect, useState} from "react";
import {Link} from "react-router";
import {Plus} from "lucide-react";
import {Button} from "@/components/ui/button";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import TransactionTable from "@/components/account/TransactionTable";
import useFetch from "@/hooks/useFetch";
import {getDashboardData, getUserAccounts} from "@/services/dashboard.api";

export default function TransactionsPage() {
    const {
        data: transactions,
        loading: transactionsLoading,
        fn: fetchTransactions,
    } = useFetch(getDashboardData);

    const {data: accounts, fn: fetchAccounts} = useFetch(getUserAccounts);

    const [selectedAccountId, setSelectedAccountId] = useState("all");

    useEffect(() => {
        fetchTransactions();
        fetchAccounts();
    }, []);

    const filteredTransactions =
        transactions?.filter((t) =>
            selectedAccountId === "all" ? true : t.accountId === selectedAccountId,
        ) || [];

    const recurringTransactions = filteredTransactions.filter((t) => t.isRecurring);

    return (
        <div className="space-y-2">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <h1 className="text-2xl font-semibold tracking-tight gradient-title">Transactions</h1>
            </div>

            <Tabs defaultValue="all" className="w-full">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <TabsList className="grid w-full sm:max-w-[400px] grid-cols-2">
                        <TabsTrigger value="all" className="cursor-pointer">
                            All Transactions
                        </TabsTrigger>
                        <TabsTrigger value="recurring" className="cursor-pointer">
                            Recurring
                        </TabsTrigger>
                    </TabsList>

                    <div className="w-full sm:w-[250px]">
                        <Select value={selectedAccountId} onValueChange={setSelectedAccountId}>
                            <SelectTrigger className="cursor-pointer">
                                <SelectValue placeholder="All Accounts" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all" className="cursor-pointer">
                                    All Accounts
                                </SelectItem>
                                {accounts?.map((account) => (
                                    <SelectItem
                                        key={account._id}
                                        value={account._id}
                                        className="cursor-pointer"
                                    >
                                        {account.name} (****{account.accountNumber?.slice(-4)})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <TabsContent value="all" className="mt-6">
                    {transactionsLoading && !transactions ? (
                        <div className="flex justify-center p-8 text-muted-foreground">
                            Loading transactions...
                        </div>
                    ) : (
                        <TransactionTable transactions={filteredTransactions} onDelete={fetchTransactions} />
                    )}
                </TabsContent>
                <TabsContent value="recurring" className="mt-6">
                    {transactionsLoading && !transactions ? (
                        <div className="flex justify-center p-8 text-muted-foreground">
                            Loading transactions...
                        </div>
                    ) : recurringTransactions.length > 0 ? (
                        <TransactionTable transactions={recurringTransactions} onDelete={fetchTransactions} />
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
