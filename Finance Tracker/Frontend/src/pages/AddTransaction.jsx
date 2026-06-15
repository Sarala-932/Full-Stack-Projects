import {useEffect} from "react";
import {useSearchParams} from "react-router";
import {defaultCategories} from "../data/categories";
import {getUserAccounts} from "../services/dashboard.api";
import {getTransaction} from "../services/transaction.api";
import AddTransactionForm from "../components/transaction/AddTransactionForm";
import useFetch from "../hooks/useFetch";
import {BarLoader} from "react-spinners";

const AddTransaction = () => {
    const [searchParams] = useSearchParams();
    const editId = searchParams.get("edit");

    const {data: accounts, fn: fetchAccounts} = useFetch(getUserAccounts);
    
    // Naya fetch hook transaction data lane ke liye
    const {
        data: transactionData,
        fn: fetchTransaction,
        loading: transactionLoading,
    } = useFetch(getTransaction);

    useEffect(() => {
        fetchAccounts();
    }, []);

    // Agar URL me editId hai, toh API call karo transaction data lane ke liye
    useEffect(() => {
        if (editId) {
            fetchTransaction(editId);
        }
    }, [editId]);

    return (
        <div className="max-w-3xl mx-auto px-5 pt-30 pb-32">
            <div className="flex justify-center md:justify-normal mb-8">
                <h1 className="text-5xl gradient-title">
                    {editId ? "Edit Transaction" : "Add Transaction"}
                </h1>
            </div>
            
            {/* Jab tak data fetch ho raha hai tab tak loader dikhao */}
            {transactionLoading && (
                <BarLoader className="mb-4" width={"100%"} color="#9333ea" />
            )}

            {/* Agar edit mode hai, to initialData form me pass karo */}
            {(!editId || transactionData?.data) && (
                <AddTransactionForm
                    accounts={accounts || []}
                    categories={defaultCategories}
                    editMode={!!editId}
                    initialData={transactionData?.data}
                />
            )}
        </div>
    );
};

export default AddTransaction;
