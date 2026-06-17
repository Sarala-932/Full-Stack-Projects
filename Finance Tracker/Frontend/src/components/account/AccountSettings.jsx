import React, {useState} from "react";
import {MoreHorizontal, Edit, Trash, Loader2} from "lucide-react";
import {toast} from "sonner";
import {useNavigate} from "react-router";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import useFetch from "@/hooks/useFetch";
import {updateAccount, deleteAccount} from "@/services/account.api";

export default function AccountSettings({account, onUpdate}) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [balanceInput, setBalanceInput] = useState(account?.balance || "");
  const navigate = useNavigate();

  const {
    loading: updateLoading,
    fn: updateAccountFn,
  } = useFetch(updateAccount);

  const {
    loading: deleteLoading,
    fn: deleteAccountFn,
  } = useFetch(deleteAccount);

  const handleUpdateBalance = async () => {
    if (!balanceInput) {
      toast.error("Balance cannot be empty");
      return;
    }

    try {
      await updateAccountFn(account._id, {balance: balanceInput});
      toast.success("Account balance updated successfully");
      setIsEditOpen(false);
      if (onUpdate) onUpdate();
    } catch (error) {
      toast.error(error.message || "Failed to update balance");
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await deleteAccountFn(account._id);
      toast.success("Account deleted successfully");
      setIsDeleteOpen(false);
      navigate("/accounts");
    } catch (error) {
      toast.error(error.message || "Failed to delete account");
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="cursor-pointer">
            <MoreHorizontal className="h-5 w-5 text-muted-foreground" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem className="cursor-pointer" onClick={() => {
            setBalanceInput(account.balance);
            setIsEditOpen(true);
          }}>
            <Edit className="mr-2 h-4 w-4" />
            Edit Balance
          </DropdownMenuItem>
          <DropdownMenuItem className="cursor-pointer text-destructive focus:text-destructive" onClick={() => setIsDeleteOpen(true)}>
            <Trash className="mr-2 h-4 w-4" />
            Delete Account
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Edit Balance Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Initial Balance</DialogTitle>
            <DialogDescription>
              Enter the new balance for your account. This will override the current balance.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Balance Amount</label>
              <Input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={balanceInput}
                onChange={(e) => setBalanceInput(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" className="cursor-pointer" onClick={() => setIsEditOpen(false)}>
              Cancel
            </Button>
            <Button className="cursor-pointer" onClick={handleUpdateBalance} disabled={updateLoading}>
              {updateLoading ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Account Alert */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              <strong className="px-1">{account.name}</strong> account and remove all of its associated transactions.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="cursor-pointer">Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 cursor-pointer"
              onClick={(e) => {
                e.preventDefault();
                handleDeleteAccount();
              }}
              disabled={deleteLoading}
            >
              {deleteLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Delete Account"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
