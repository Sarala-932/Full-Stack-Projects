import React from "react";
import {BarLoader} from "react-spinners";
import {useParams, useNavigate} from "react-router";
import {useEffect, useState} from "react";
import TransactionTable from "../components/account/TransactionTable";
import useFetch from "../hooks/useFetch";
import {getAccountWithTransactions} from "../services/account.api";
import NotFound from "./NotFound";
import AccountChart from "@/components/account/AccountChart";
import AccountSettings from "@/components/account/AccountSettings";

function Account() {
    const {id: accountId} = useParams();
    const navigate = useNavigate();

    const {
        data: accountData,
        loading: accountLoading,
        error: accountError,
        fn: fetchAccount,
    } = useFetch(getAccountWithTransactions, `account_${accountId}`);

    // Derive account details and transactions directly from the data
    const account = accountData ? {...accountData, transactions: undefined} : null;
    const transactions = accountData?.transactions || [];

    const [dateRange, setDateRange] = useState("1M");
    const [customDateRange, setCustomDateRange] = useState({from: undefined, to: undefined});

    useEffect(() => {
        fetchAccount(accountId);
    }, [accountId]);

    useEffect(() => {
        if (accountError) {
            navigate("/dashboard"); // ← redirect if account not found
        }
    }, [accountError]);

    const isLoading = !accountData && (accountLoading === null || accountLoading);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-[50vh]">
                <BarLoader color="#9333ea" width={200} />
            </div>
        );
    }

    if (accountError) {
        return null;
    }

    if (!account) {
        return <NotFound />;
    }

    return (
        <div className="space-y-4 px-4 py-2">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end justify-between">
                {/* Account Name and Type */}
                <div>
                    <h1 className="text-3xl font-semibold tracking-tight capitalize gradient-title">
                        {account.name}
                    </h1>
                    <p className="text-muted-foreground mt-1 text-xs">
                        {account.type.charAt(0) + account.type.slice(1).toLowerCase()} Account
                        {account.bankName && ` • ${account.bankName}`}
                    </p>
                </div>

                {/* Balance and Settings */}
                <div className="flex flex-col items-start sm:items-end pb-1 gap-2">
                    <div className="text-left sm:text-right">
                        <div className="text-xl font-semibold flex items-center justify-start sm:justify-end gap-2">
                            ₹{parseFloat(account.balance).toFixed(2)}
                            <div className="mt-0">
                                <AccountSettings account={account} onUpdate={() => fetchAccount(accountId)} />
                            </div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {account.transactionCount} Transactions
                        </p>
                    </div>
                </div>
            </div>

            {/* Chart Section */}
            <AccountChart
                transactions={transactions}
                dateRange={dateRange}
                onDateRangeChange={setDateRange}
                customDateRange={customDateRange}
                onCustomDateRangeChange={setCustomDateRange}
            />

            {/* Transactions Table */}
            <TransactionTable
                transactions={transactions}
                accountId={accountId}
                balance={account.balance}
                onDelete={() => fetchAccount(accountId)}
                dateRange={dateRange}
                customDateRange={customDateRange}
            />
        </div>
    );
}

export default Account;
