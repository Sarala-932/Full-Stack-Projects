import useFetch from "@/hooks/useFetch";
import {zodResolver} from "@hookform/resolvers/zod";
import {useEffect, useState, useRef} from "react";
import {useForm, Controller} from "react-hook-form";
import {useNavigate, useSearchParams} from "react-router";
import {z} from "zod";
import {createTransaction, updateTransaction} from "@/services/transaction.api";
import {SelectValue, Select, SelectTrigger, SelectContent, SelectItem} from "../ui/select";
import {Input} from "../ui/input";
import CreateAccountDrawer from "../dashboard/CreateAccountDrawer";
import {Button} from "@/components/ui/button";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";
import {PopoverAnchor} from "@radix-ui/react-popover";
import {cn} from "@/lib/utils";
import {format} from "date-fns";
import {Calendar1Icon, Loader2} from "lucide-react";
import {Calendar} from "@/components/ui/calendar";
import {Switch} from "../ui/switch";
import {toast} from "sonner";
import {ReceiptScanner} from "./ReceiptScanner";

export const transactionSchema = z
    .object({
        type: z.enum(["INCOME", "EXPENSE"]),
        amount: z.string().min(1, "Amount is required"),
        description: z.string().optional(),
        date: z.date({required_error: "Date is required"}),
        accountId: z.string().min(1, "Account is required"),
        category: z.string().min(1, "Category is required"),
        isRecurring: z.boolean().default(false),
        recurringInterval: z.enum(["DAILY", "WEEKLY", "MONTHLY", "YEARLY"]).optional(),
    })
    .superRefine((data, ctx) => {
        if (data.isRecurring && !data.recurringInterval) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Recurring interval is required for recurring transactions",
                path: ["recurringInterval"],
            });
        }
    });

function AddTransactionForm({accounts, categories, editMode = false, initialData = null}) {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const accountIdParam = searchParams.get("accountId");
    const [submitAction, setSubmitAction] = useState("save");

    const defaultAccountId = accountIdParam || accounts.find((ac) => ac.isDefault)?._id;

    const {
        register,
        handleSubmit,
        formState: {errors},
        watch,
        setValue,
        getValues,
        reset,
        control,
    } = useForm({
        resolver: zodResolver(transactionSchema),
        defaultValues:
            editMode && initialData
                ? {
                      ...initialData,
                      amount: initialData.amount.toString(),
                      date: new Date(initialData.date),
                  }
                : {
                      type: "EXPENSE",
                      amount: "",
                      description: "",
                      accountId: defaultAccountId,
                      date: new Date(),
                      isRecurring: false,
                  },
    });
    const {
        loading: transactionLoading,
        fn: transactionFn,
        data: transactionResult,
    } = useFetch(editMode ? updateTransaction : createTransaction);

    const type = watch("type");
    const isRecurring = watch("isRecurring");
    const date = watch("date");
    const category = watch("category");
    const recurringInterval = watch("recurringInterval");
    const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

    const [inputValue, setInputValue] = useState("");
    const inputValueRef = useRef(inputValue);
    useEffect(() => {
        inputValueRef.current = inputValue;
    }, [inputValue]);

    useEffect(() => {
        if (date) {
            const parsedInput = new Date(inputValueRef.current);
            const isSameDate =
                !isNaN(parsedInput.getTime()) &&
                format(parsedInput, "yyyy-MM-dd") === format(date, "yyyy-MM-dd");
            if (!isSameDate) {
                setInputValue(format(date, "dd MMM yyyy"));
            }
        }
    }, [date]);

    const filteredCategories = categories.filter((category) => category.type === type);

    const onSubmit = (data) => {
        const formData = {
            ...data,
            amount: parseFloat(data.amount),
        };

        if (editMode) {
            transactionFn(initialData._id, formData);
        } else {
            transactionFn(formData);
        }
    };

    useEffect(() => {
        if (transactionResult?.success && !transactionLoading) {
            toast.success(editMode ? "Transaction updated successfully" : "Transaction created successfully");

            if (submitAction === "save-new") {
                // Keep the same account and date, reset the rest
                const currentAccountId = getValues("accountId");
                const currentDate = getValues("date");
                reset({
                    type: "EXPENSE",
                    amount: "",
                    description: "",
                    accountId: currentAccountId,
                    date: currentDate,
                    isRecurring: false,
                });
            } else {
                reset();
                if (editMode) {
                    navigate(-1);
                } else {
                    navigate(`/accounts/${transactionResult.data.accountId}`);
                }
            }
        }
    }, [transactionResult, transactionLoading, editMode, navigate, reset, submitAction, getValues]);

    const handleScanComplete = (scannedData) => {
        // console.log("scannedData",scannedData);

        if (scannedData) {
            setValue("amount", scannedData.amount.toString());
            setValue("date", new Date(scannedData.date));
            if (scannedData.description) {
                setValue("description", scannedData.description);
            }
            if (scannedData.category) {
                setValue("category", scannedData.category);
            }
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pb-20">
            {/* Ai Receipt scanner */}
            <ReceiptScanner onScanComplete={handleScanComplete} />

            {/* Type */}
            <div className="space-y-2">
                <label className="text-sm font-medium">Type</label>

                <Select onValueChange={(value) => setValue("type", value)} defaultValue={type}>
                    <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="EXPENSE">Expense</SelectItem>
                        <SelectItem value="INCOME">Income</SelectItem>
                    </SelectContent>
                </Select>
                {errors.type && <p className="text-sm text-red-500">{errors.type.message}</p>}
            </div>

            {/* Amount and Account */}
            <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                    <label className="text-sm font-medium">Amount</label>
                    <Input type="number" step="0.01" placeholder="0.00" {...register("amount")} />
                    {errors.amount && <p className="text-sm text-red-500">{errors.amount.message}</p>}
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium">Account</label>
                    <Select
                        onValueChange={(value) => setValue("accountId", value)}
                        defaultValue={getValues("accountId")}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select account" />
                        </SelectTrigger>
                        <SelectContent>
                            {accounts.map((account) => (
                                <SelectItem key={account._id} value={account._id}>
                                    {account.name} (₹{parseFloat(account.balance).toFixed(2)})
                                </SelectItem>
                            ))}
                            <CreateAccountDrawer>
                                <Button
                                    variant="ghost"
                                    className="relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground"
                                >
                                    Create Account
                                </Button>
                            </CreateAccountDrawer>
                        </SelectContent>
                    </Select>
                    {errors.accountId && <p className="text-sm text-red-500">{errors.accountId.message}</p>}
                </div>
            </div>

            {/* Category */}

            <div className="space-y-2">
                <label className="text-sm font-medium">Category</label>
                <Select onValueChange={(value) => setValue("category", value)} value={category}>
                    <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                        {filteredCategories.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                                {category.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                {errors.category && <p className="text-sm text-red-500">{errors.category.message}</p>}
            </div>

            {/* Date */}

            <div className="space-y-2">
                <label className="text-sm font-medium">Date</label>
                <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
                    <PopoverAnchor asChild>
                        <div className="relative flex items-center date-input-container">
                            <Input
                                type="text"
                                value={inputValue}
                                onChange={(e) => {
                                    setInputValue(e.target.value);
                                    const parsed = new Date(e.target.value);
                                    if (!isNaN(parsed.getTime()) && parsed.getFullYear() > 1900) {
                                        setValue("date", parsed);
                                    }
                                }}
                                onClick={() => setIsDatePickerOpen(true)}
                                placeholder="e.g., 15 Jun 2026"
                                className="pl-3"
                            />
                        </div>
                    </PopoverAnchor>
                    <PopoverContent
                        className="w-auto p-0"
                        align="start"
                        onOpenAutoFocus={(e) => e.preventDefault()}
                        onPointerDownOutside={(e) => {
                            if (e.target.closest(".date-input-container")) {
                                e.preventDefault();
                            }
                        }}
                    >
                        <Calendar
                            mode="single"
                            selected={date}
                            onSelect={(newDate) => {
                                if (newDate) {
                                    setValue("date", newDate);
                                    setIsDatePickerOpen(false);
                                }
                            }}
                            disabled={(d) => d > new Date() || d < new Date("1900-01-01")}
                        />
                    </PopoverContent>
                </Popover>
                {errors.date && <p className="text-sm text-red-500">{errors.date.message}</p>}
            </div>

            {/* Description */}
            <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <Input placeholder="Enter description" {...register("description")} />
                {errors.description && <p className="text-sm text-red-500">{errors.description.message}</p>}
            </div>

            {/* Recurring Toggle */}
            <div className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                    <label className="text-base font-medium">Recurring Transaction</label>
                    <div className="text-sm text-muted-foreground">
                        Set up a recurring schedule for this transaction
                    </div>
                </div>
                <Switch
                    checked={isRecurring}
                    onCheckedChange={(checked) => setValue("isRecurring", checked)}
                    className="cursor-pointer"
                />
            </div>

            {/* Recurring Interval */}
            {isRecurring && (
                <div className="space-y-2">
                    <label className="text-sm font-medium">Recurring Interval</label>
                    <Controller
                        name="recurringInterval"
                        control={control}
                        render={({field}) => (
                            <Select onValueChange={field.onChange} value={field.value || undefined}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select interval" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="DAILY">Daily</SelectItem>
                                    <SelectItem value="WEEKLY">Weekly</SelectItem>
                                    <SelectItem value="MONTHLY">Monthly</SelectItem>
                                    <SelectItem value="YEARLY">Yearly</SelectItem>
                                </SelectContent>
                            </Select>
                        )}
                    />
                    {errors.recurringInterval && (
                        <p className="text-sm text-red-500">{errors.recurringInterval.message}</p>
                    )}
                </div>
            )}

            {/* Fixed Footer Actions */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-6 shadow-[0_-2px_10px_rgba(0,0,0,0.05)] z-50">
                <div className="max-w-3xl mx-auto flex flex-col gap-4 sm:flex-row">
                    <Button type="button" variant="outline" className="flex-1 py-6 cursor-pointer" onClick={() => navigate(-1)}>
                        Cancel
                    </Button>
                    
                    {!editMode && (
                        <Button
                            type="submit"
                            variant="secondary"
                            className="flex-1 py-6 cursor-pointer" 
                            disabled={transactionLoading}
                            onClick={() => setSubmitAction("save-new")}
                        >
                            {transactionLoading && submitAction === "save-new" ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin inline" />
                            ) : null}
                            Save and New
                        </Button>
                    )}
            
                    <Button
                        type="submit"
                        className="flex-1 py-6 cursor-pointer bg-blue-600 hover:bg-blue-700 text-white" 
                        disabled={transactionLoading}
                        onClick={() => setSubmitAction("save")}
                    >
                        {transactionLoading && submitAction === "save" ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin inline" />
                                {editMode ? "Updating..." : "Saving..."}
                            </>
                        ) : editMode ? (
                            "Update Transaction"
                        ) : (
                            "Save Transaction"
                        )}
                    </Button>
                </div>
            </div>
        </form>
    );
}

export default AddTransactionForm;
