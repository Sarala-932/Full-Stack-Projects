import React from "react";
import {Card, CardContent, CardFooter, CardHeader, CardTitle} from "@/components/ui/card";
import {Switch} from "../ui/switch";
import {ArrowDownRight, ArrowUpRight} from "lucide-react";
import {Link} from "react-router";
import {useEffect} from "react";
import {toast} from "sonner";
import useFetch from "../../hooks/useFetch";
import {updateDefaultAccount} from "../../services/account.api";

function AccountCard({account, onUpdate, onOptimisticUpdate}) {
  const {
    // loading: updateDefaultLoading,
    fn: updateDefaultFn,
    data: updatedAccount,
    error,
  } = useFetch(updateDefaultAccount);

  const handleDefaultChange = async (event) => {
    event.preventDefault();

    if (account.isDefault) {
      toast.warning("You need at least 1 default account");
      return;
    }

    // Instantly update UI optimistically
    onOptimisticUpdate(account._id);

    const previousAccounts = account;

    try {
      await updateDefaultFn(account._id);
    } catch (error) {
      // ✅ server failed → rollback to old state
      setAccounts(previousAccounts);
      toast.error("Failed to update default account");
    }
  };

  useEffect(() => {
    if (updatedAccount?.success) {
      toast.success("Default account updated successfully");
      onUpdate();
    }
  }, [updatedAccount]);

  useEffect(() => {
    if (error) {
      toast.error(error.message || "Failed to update default account");
      onUpdate(); // Rollback to actual server state if error
    }
  }, [error]);

  return (
    <Card className="hover:shadow-md transition-shadow group relative">
      <Link to={`/accounts/${account._id}`}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium capitalize">
            {account.bankName}
          </CardTitle>
          <Switch
            className="cursor-pointer"
            checked={account.isDefault}
            onClick={handleDefaultChange}
            // disabled={updateDefaultLoading}
          />
        </CardHeader>
        <CardContent>
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-xs text-muted-foreground">
                {account.type.charAt(0) + account.type.slice(1).toLowerCase()} Account
              </h3>
              <h4 className="text-xs text-muted-foreground">
                {account.name.charAt(0) + account.name.slice(1).toLowerCase()}
              </h4>
              <p className="text-xs text-muted-foreground mt-1">
                Account Number ****{account.accountNumber.slice(-4)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold">
                ₹{parseFloat(account.balance).toFixed(2).toLocaleString("en-IN")}
              </p>
              <p className="text-xs text-muted-foreground">Available Balance</p>
            </div>
          </div>
          {account.isDefault && (
            <div className="mt-4">
              <span className="bg-blue-100 text-blue-700 text-[10px] font-semibold px-2 py-1 rounded uppercase tracking-wider">
                Default
              </span>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between text-sm text-muted-foreground">
          <div className="flex items-center">
            <ArrowUpRight className="mr-1 h-4 w-4 text-green-500" />
            Income
          </div>

          <div className="flex items-center">
            <ArrowDownRight className="mr-1 h-4 w-4 text-red-500" />
            Expense
          </div>
        </CardFooter>
      </Link>
    </Card>
  );
}

export default AccountCard;
