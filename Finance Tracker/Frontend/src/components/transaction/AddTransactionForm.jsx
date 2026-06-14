import useFetch from "@/hooks/useFetch";
import {zodResolver} from "@hookform/resolvers/zod";
import {useEffect} from "react";
import {useForm} from "react-hook-form";
import {useNavigate} from "react-router";
import {z} from "zod";
import {createTransaction} from "@/services/transaction.api";
import {SelectValue, Select, SelectTrigger, SelectContent, SelectItem} from "../ui/select";
import {Input} from "../ui/input";
import CreateAccountDrawer from "../dashboard/CreateAccountDrawer";
import {Button} from "@/components/ui/button";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";
import {cn} from "@/lib/utils";
import {format} from "date-fns";
import {Calendar1Icon} from "lucide-react";
import {Calendar} from "@/components/ui/calendar";
import {Switch} from "../ui/switch";
import {toast} from "sonner";

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

    const {
        register,
        handleSubmit,
        formState: {errors},
        watch,
        setValue,
        getValues,
        reset,
    } = useForm({
        resolver: zodResolver(transactionSchema),
        defaultValues: {
            type: "EXPENSE",
            amount: "",
            description: "",
            accountId: accounts.find((ac) => ac.isDefault)?._id,
            date: new Date(),
            isRecurring: false,
        },
    });
    const {
        loading: transactionLoading,
        fn: transactionFn,
        data: transactionResult,
    } = useFetch(createTransaction);

    const type = watch("type");
    const isRecurring = watch("isRecurring");
    const date = watch("date");
    // const [isDrawerOpen, setIsDrawerOpen] = React.useState(false);

    const filteredCategories = categories.filter((category) => category.type === type);

    const onSubmit = (data) => {
        const formData = {
            ...data,
            amount: parseFloat(data.amount),
        };

        transactionFn(formData);
    };

    useEffect(() => {
        if (transactionResult?.success && !transactionLoading) {
            toast.success("Transaction created successfully");
            reset();
            navigate(`/accounts/${transactionResult.data.accountId}`);
        }
    }, [transactionResult, transactionLoading]);

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Ai Receipt scanner */}

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
                <Select
                    onValueChange={(value) => setValue("category", value)}
                    defaultValue={getValues("category")}
                >
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
                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            className={cn(
                                "w-full pl-3 text-left font-normal",
                                !date && "text-muted-foreground",
                            )}
                        >
                            {date ? format(date, "PPP") : <span>Pick a date</span>}
                            <Calendar1Icon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                            mode="single"
                            selected={date}
                            onSelect={(date) => setValue("date", date)}
                            disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                            initialFocus
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
                />
            </div>

            {/* Recurring Interval */}
            {isRecurring && (
                <div className="space-y-2">
                    <label className="text-sm font-medium">Recurring Interval</label>
                    <Select
                        onValueChange={(value) => setValue("recurringInterval", value)}
                        defaultValue={getValues("recurringInterval")}
                    >
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
                    {errors.recurringInterval && (
                        <p className="text-sm text-red-500">{errors.recurringInterval.message}</p>
                    )}
                </div>
            )}

            {/* Actions */}
            <div className="flex flex-col gap-4 sm:flex-row">
                <Button type="button" variant="outline" className="flex-1" onClick={() => navigate(-1)}>
                    Cancel
                </Button>
                <Button type="submit" className="flex-1" disabled={transactionLoading}>
                    {/* {transactionLoading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            {editMode ? "Updating..." : "Creating..."}
                        </>
                    ) : editMode ? (
                        "Update Transaction"
                    ) : (
                        "Create Transaction"
                    )} */}
                    Create Transaction
                </Button>
            </div>
        </form>
    );
}

export default AddTransactionForm;
