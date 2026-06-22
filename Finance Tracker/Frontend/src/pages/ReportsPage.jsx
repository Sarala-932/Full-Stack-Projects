import {useEffect} from "react";
import DashboardOverview from "@/components/dashboard/DashboardOverview";
import ExpensePieChart from "@/components/dashboard/ExpensePieChart";
import useFetch from "@/hooks/useFetch";
import {getDashboardData} from "@/services/dashboard.api";

export default function ReportsPage() {
    const {
        data: transactions,
        loading: transactionsLoading,
        fn: fetchTransactions,
    } = useFetch(getDashboardData);

    useEffect(() => {
        fetchTransactions();
    }, []);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-semibold tracking-tight gradient-title">Reports & Analytics</h1>
            </div>

            {transactionsLoading && !transactions ? (
                <div className="flex justify-center p-8 text-muted-foreground">Loading reports...</div>
            ) : (
                <div className="grid gap-6">
                    <div className="w-full">
                        <DashboardOverview transactions={transactions || []} />
                    </div>
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
                        <ExpensePieChart transactions={transactions || []} />
                        {/* Add more charts here in the future if needed */}
                    </div>
                </div>
            )}
        </div>
    );
}
