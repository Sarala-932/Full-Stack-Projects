import {useEffect, useState} from "react";
import {useForm, Controller} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {Loader2} from "lucide-react";
import {toast} from "sonner";
import {z} from "zod";
import useFetch from "../../hooks/useFetch";
import {createAccount} from "../../services/dashboard.api";
import {Button} from "@/components/ui/button";
import {Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerClose, DrawerDescription, DrawerTrigger} from "@/components/ui/drawer";
import {Input} from "@/components/ui/input";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {Switch} from "@/components/ui/switch";

// ✅ Validation Schema
const accountSchema = z.object({
  accountNumber: z.string().min(1, "Account number is required"),
  bankName: z.string().min(1, "Bank name is required"),
  name: z.string().optional(),
  type: z.enum(["SAVINGS", "CURRENT"], {
    required_error: "Account type is required",
  }),
  balance: z.string().min(1, "Balance is required"),
  currency: z.string().min(1, "Currency is required"),
  isDefault: z.boolean().default(false),
});

// ✅ Bank List
const BANK_NAMES = [
  "State Bank of India",
  "HDFC Bank",
  "ICICI Bank",
  "Axis Bank",
  "Kotak Mahindra Bank",
  "Punjab National Bank",
  "Bank of Baroda",
  "Canara Bank",
  "IndusInd Bank",
  "Yes Bank",
  "Other",
];

export default function CreateAccountDrawer({open, onClose, onSuccess, children}) {
  const {
    register,
    handleSubmit,
    formState: {errors},
    setValue,
    watch,
    reset,
    control,
  } = useForm({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      accountNumber: "",
      bankName: "",
      name: "",
      type: "SAVINGS",
      balance: "",
      currency: "INR",
      isDefault: false,
    },
  });

  // ✅ useFetch hook with createAccount API function
  const {data: newAccount, loading: createAccountLoading, error, fn: createAccountFn, setData} = useFetch(createAccount);

  // ✅ Submit handler
  const onSubmit = async (data) => {
    console.log("Form Data:", data);
    try {
      await createAccountFn(data);
    } catch (err) {
      console.error("Submission error:", err);
    }
  };

  // Reset fetch state when drawer closes
  useEffect(() => {
    if (!open) {
      setData(undefined);
      reset();
    }
  }, [open, setData, reset]);

  // Log errors for debugging
  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      console.error("Form Errors:", errors);
    }
  }, [errors]);

  // ✅ On success
  useEffect(() => {
    if (newAccount) {
      toast.success("Account created successfully");
      if (onSuccess) onSuccess(); // refresh dashboard
      if (onClose) onClose(); // close drawer
      setData(undefined); // Clear state to prevent duplicate toasts
    }
  }, [newAccount]);

  // ✅ On error
  useEffect(() => {
    if (error) {
      const errorMsg = error.response?.data?.message || error.message || "Failed to create account";
      toast.error(errorMsg);
    }
  }, [error]);

  return (
    <Drawer open={open} onOpenChange={onClose}>
      {children && <DrawerTrigger asChild>{children}</DrawerTrigger>}
      <DrawerContent aria-describedby={undefined}>
        <DrawerHeader>
          <DrawerTitle>Create New Account</DrawerTitle>
          <DrawerDescription className="sr-only">Enter your account details to add a new bank account.</DrawerDescription>
        </DrawerHeader>

        <div className="px-4 pb-4 overflow-y-auto max-h-[80vh]">
          <form
            onSubmit={(e) => {
              console.log("Form submit event triggered");
              handleSubmit(onSubmit)(e);
            }}
            className="space-y-4"
          >
            {/* Account Number */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Account Number</label>
              <Input placeholder="e.g., 1234567890" {...register("accountNumber")} />
              {errors.accountNumber && <p className="text-sm text-red-500">{errors.accountNumber.message}</p>}
            </div>

            {/* Bank Name */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Bank Name</label>
              <Controller
                name="bankName"
                control={control}
                render={({field}) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your bank" />
                    </SelectTrigger>
                    <SelectContent>
                      {BANK_NAMES.map((bank) => (
                        <SelectItem key={bank} value={bank}>
                          {bank}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.bankName && <p className="text-sm text-red-500">{errors.bankName.message}</p>}
            </div>

            {/* Account Name */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Account Name</label>
              <Input placeholder="e.g., My Salary Account" {...register("name")} />
              {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
            </div>

            {/* Account Type */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Account Type</label>
              <Controller
                name="type"
                control={control}
                render={({field}) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CURRENT">Current</SelectItem>
                      <SelectItem value="SAVINGS">Savings</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.type && <p className="text-sm text-red-500">{errors.type.message}</p>}
            </div>

            {/* Initial Balance */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Initial Balance</label>
                <Input type="number" step="0.01" placeholder="0.00" {...register("balance")} />
                {errors.balance && <p className="text-sm text-red-500">{errors.balance.message}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium ml-1">Currency</label>
                <Controller
                  name="currency"
                  control={control}
                  render={({field}) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Currency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="INR">INR (₹)</SelectItem>
                        <SelectItem value="USD">USD ($)</SelectItem>
                        <SelectItem value="EUR">EUR (€)</SelectItem>
                        <SelectItem value="GBP">GBP (£)</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.currency && <p className="text-sm text-red-500">{errors.currency.message}</p>}
              </div>
            </div>

            {/* Set as Default */}
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div className="space-y-0.5">
                <label className="text-sm font-medium cursor-pointer">Set as Default</label>
                <p className="text-sm text-muted-foreground">This account will be selected by default for transactions</p>
              </div>
              <Controller name="isDefault" control={control} render={({field}) => <Switch checked={field.value} onCheckedChange={field.onChange} />} />
            </div>

            {/* Buttons */}
            <div className="flex gap-4 pt-4">
              <DrawerClose asChild>
                <Button type="button" variant="outline" className="flex-1 cursor-pointer">
                  Cancel
                </Button>
              </DrawerClose>

              <Button type="submit" className="flex-1 cursor-pointer" disabled={createAccountLoading}>
                {createAccountLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Account"
                )}
              </Button>
            </div>
            {Object.keys(errors).length > 0 && <p className="text-xs text-red-500 text-center">Please fix the errors above before submitting.</p>}
          </form>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
