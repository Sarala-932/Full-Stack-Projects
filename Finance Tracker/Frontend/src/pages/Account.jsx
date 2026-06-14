import React from "react";
import {BarLoader} from "react-spinners";
import {useParams, useNavigate} from "react-router";
import {useEffect, useState} from "react";
import TransactionTable from "../components/account/TransactionTable";
import useFetch from "../hooks/useFetch";
import {getAccountWithTransactions} from "../services/account.api";
import NotFound from "./NotFound";
import AccountChart from "@/components/account/AccountChart";

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
  const account = accountData ? { ...accountData, transactions: undefined } : null;
  const transactions = accountData?.transactions || [];

  const [dateRange, setDateRange] = useState("1M");

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
    <div className="space-y-8 px-5 pt-25">
      <div className="flex gap-4 items-end justify-between">
        {/* Account Name and Type */}
        <div className="ml-20">
          <h1 className="text-5xl sm:text-6xl font-bold capitalize gradient-title">
            {account.name}
          </h1>
          <p className="text-muted-foreground">
            {account.type.charAt(0) + account.type.slice(1).toLowerCase()} Account
          </p>
          <p className="text-muted-foreground text-sm">{account.bankName}</p>
        </div>

        {/* Balance and Transaction Count */}
        <div className="text-right mr-20 pb-2">
          <div className="text-xl sm:text-2xl font-bold">
            ₹{parseFloat(account.balance).toFixed(2)}
          </div>
          <p className="text-sm text-muted-foreground">
            {account.transactionCount} Transactions
          </p>
        </div>
      </div>

      {/* Chart Section */}
      <AccountChart 
      transactions={transactions} 
      dateRange={dateRange} 
      onDateRangeChange={setDateRange}  
      />


      {/* Transactions Table */}
      <TransactionTable 
        transactions={transactions} 
        accountId={accountId} 
        balance={account.balance}
        onDelete={() => fetchAccount(accountId)} 
        dateRange={dateRange}
      />
    </div>
  );
}

export default Account;
