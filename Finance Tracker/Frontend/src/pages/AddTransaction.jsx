import {useEffect} from "react";
import {defaultCategories} from "../data/categories";
import {getUserAccounts} from "../services/dashboard.api";
import AddTransactionForm from "../components/transaction/AddTransactionForm";
import useFetch from "../hooks/useFetch";

const AddTransaction = () => {
  const {data: accounts, fn: fetchAccounts} = useFetch(getUserAccounts);

  useEffect(() => {
    fetchAccounts();
  }, []);

  return (
    <div className="max-w-3xl mx-auto px-5 pt-30">
      <div className="flex justify-center md:justify-normal mb-8">
        <h1 className="text-5xl gradient-title">Add Transaction</h1>
      </div>
      <AddTransactionForm accounts={accounts || []} categories={defaultCategories} />
    </div>
  );
};

export default AddTransaction;
