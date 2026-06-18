import {useState, useMemo, useEffect} from "react";
import {useNavigate} from "react-router";
import {format, startOfDay, endOfDay, subDays} from "date-fns";
import {toast} from "sonner";
import {DATE_RANGES} from "./AccountChart";
import {BarLoader} from "react-spinners";
import {
    ChevronDown,
    ChevronUp,
    MoreHorizontal,
    Trash,
    Search,
    X,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    RefreshCw,
    Clock,
    Download,
} from "lucide-react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
    TableFooter,
} from "@/components/ui/table";
import {Input} from "@/components/ui/input";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {Checkbox} from "@/components/ui/checkbox";
import {Button} from "@/components/ui/button";
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from "@/components/ui/tooltip";
import {Badge} from "@/components/ui/badge";
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
import {cn} from "@/lib/utils";
import {categoryColors} from "@/data/categories";
import useFetch from "../../hooks/useFetch";
import {bulkDeleteTransactions} from "../../services/account.api";

const ITEMS_PER_PAGE = 10;

const RECURRING_INTERVALS = {
    DAILY: "Daily",
    WEEKLY: "Weekly",
    MONTHLY: "Monthly",
    YEARLY: "Yearly",
};

export default function TransactionTable({
    transactions,
    accountId,
    balance,
    onDelete,
    dateRange,
    customDateRange,
}) {
    const navigate = useNavigate();

    const [selectedIds, setSelectedIds] = useState([]);
    const [sortConfig, setSortConfig] = useState({
        field: "date",
        direction: "desc",
    });

    const [searchTerm, setSearchTerm] = useState("");
    const [typeFilter, setTypeFilter] = useState("");
    const [recurringFilter, setRecurringFilter] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [deleteDialog, setDeleteDialog] = useState({isOpen: false, ids: []});

    const {loading: deleteLoading, fn: deleteFn, data: deleted} = useFetch(bulkDeleteTransactions);

    const transactionsWithBalance = useMemo(() => {
        let currentBalance = balance || 0;
        return [...transactions]
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .map((t) => {
                const balanceAtTime = currentBalance;
                const change = t.type === "INCOME" ? t.amount : -t.amount;
                currentBalance -= change;
                return {...t, runningBalance: balanceAtTime};
            });
    }, [transactions, balance]);

    const filteredAndSortedTransactions = useMemo(() => {
        let result = [...transactionsWithBalance];

        if (dateRange === "CUSTOM" && customDateRange?.from && customDateRange?.to) {
            const startDate = startOfDay(customDateRange.from);
            const endDate = endOfDay(customDateRange.to);
            result = result.filter(
                (transaction) =>
                    new Date(transaction.date) >= startDate && new Date(transaction.date) <= endDate,
            );
        } else if (dateRange && DATE_RANGES[dateRange] && dateRange !== "CUSTOM") {
            const range = DATE_RANGES[dateRange];
            const now = new Date();
            const startDate = range.days ? startOfDay(subDays(now, range.days)) : startOfDay(new Date(0));
            result = result.filter(
                (transaction) =>
                    new Date(transaction.date) >= startDate && new Date(transaction.date) <= endOfDay(now),
            );
        }

        if (searchTerm) {
            const searchLower = searchTerm.toLowerCase();
            result = result.filter((transaction) =>
                transaction.description?.toLowerCase().includes(searchLower),
            );
        }

        if (typeFilter) {
            result = result.filter((transaction) => transaction.type === typeFilter);
        }

        if (recurringFilter) {
            result = result.filter((transaction) => {
                if (recurringFilter === "recurring") return transaction.isRecurring;
                return !transaction.isRecurring;
            });
        }

        result.sort((a, b) => {
            let comparison = 0;
            switch (sortConfig.field) {
                case "date":
                    comparison = new Date(a.date) - new Date(b.date);
                    break;
                case "amount":
                    comparison = a.amount - b.amount;
                    break;
                case "category":
                    comparison = a.category.localeCompare(b.category);
                    break;
                default:
                    comparison = 0;
            }
            return sortConfig.direction === "asc" ? comparison : -comparison;
        });

        return result;
    }, [
        transactionsWithBalance,
        searchTerm,
        typeFilter,
        recurringFilter,
        sortConfig,
        dateRange,
        customDateRange,
    ]);

    const totalPages = Math.ceil(filteredAndSortedTransactions.length / ITEMS_PER_PAGE);

    const paginatedTransactions = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredAndSortedTransactions.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [filteredAndSortedTransactions, currentPage]);

    const totalPageAmount = useMemo(() => {
        return paginatedTransactions.reduce((sum, transaction) => {
            return sum + (transaction.type === "EXPENSE" ? -transaction.amount : transaction.amount);
        }, 0);
    }, [paginatedTransactions]);

    const totalFilteredAmount = useMemo(() => {
        return filteredAndSortedTransactions.reduce((sum, transaction) => {
            return sum + (transaction.type === "EXPENSE" ? -transaction.amount : transaction.amount);
        }, 0);
    }, [filteredAndSortedTransactions]);

    const handleSort = (field) => {
        setSortConfig((current) => ({
            field,
            direction: current.field === field && current.direction === "asc" ? "desc" : "asc",
        }));
    };

    const handleSelect = (id) => {
        setSelectedIds((current) =>
            current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
        );
    };

    const handleSelectAll = () => {
        setSelectedIds((current) =>
            current.length === paginatedTransactions.length ? [] : paginatedTransactions.map((t) => t._id),
        );
    };

    const handleBulkDelete = () => {
        setDeleteDialog({isOpen: true, ids: selectedIds});
    };

    const handleConfirmDelete = async () => {
        let targetAccountId = accountId;
        if (!targetAccountId && deleteDialog.ids.length > 0) {
            const firstTx = transactions.find((t) => t._id === deleteDialog.ids[0]);
            targetAccountId = firstTx?.accountId;
        }

        if (!targetAccountId) {
            toast.error("Could not determine account for deletion.");
            setDeleteDialog({isOpen: false, ids: []});
            return;
        }

        try {
            await deleteFn(targetAccountId, deleteDialog.ids);
            toast.success("Transactions deleted successfully");
            setSelectedIds([]);
            if (onDelete) onDelete();
        } catch (error) {
            // Error is already shown by useFetch
        } finally {
            setDeleteDialog({isOpen: false, ids: []});
        }
    };

    useEffect(() => {
        const activeBtn = document.getElementById(`page-btn-${currentPage}`);
        if (activeBtn) {
            activeBtn.scrollIntoView({behavior: "smooth", block: "nearest", inline: "center"});
        }
    }, [currentPage]);

    const handleClearFilters = () => {
        setSearchTerm("");
        setTypeFilter("");
        setRecurringFilter("");
        setCurrentPage(1);
    };

    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
        setSelectedIds([]);
    };

    const handleExport = () => {
        const headers = ["Date", "Description", "Category", "Type", "Amount", "Balance", "Recurring"];

        const csvContent = [
            headers.join(","),
            ...filteredAndSortedTransactions.map((t) => {
                const date = format(new Date(t.date), "PP");
                const amount = t.amount.toFixed(2);
                const balance = t.runningBalance.toFixed(2);
                const recurring = t.isRecurring ? RECURRING_INTERVALS[t.recurringInterval] : "One-time";
                // Escape quotes and commas in description
                const desc = `"${t.description?.replace(/"/g, '""') || ""}"`;

                return [date, desc, t.category, t.type, amount, balance, recurring].join(",");
            }),
        ].join("\n");

        const blob = new Blob([csvContent], {type: "text/csv;charset=utf-8;"});
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", "transactions_report.csv");
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="space-y-4">
            {deleteLoading && <BarLoader className="mt-4" width={"100%"} color="#9333ea" />}

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search transactions..."
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setCurrentPage(1);
                        }}
                        className="pl-8"
                    />
                </div>
                <div className="flex gap-2">
                    <Select
                        value={typeFilter}
                        onValueChange={(value) => {
                            setTypeFilter(value);
                            setCurrentPage(1);
                        }}
                    >
                        <SelectTrigger className="w-32.5">
                            <SelectValue placeholder="All Types" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="INCOME">Income</SelectItem>
                            <SelectItem value="EXPENSE">Expense</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select
                        value={recurringFilter}
                        onValueChange={(value) => {
                            setRecurringFilter(value);
                            setCurrentPage(1);
                        }}
                    >
                        <SelectTrigger className="w-36.25">
                            <SelectValue placeholder="All Transactions" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="recurring">Recurring Only</SelectItem>
                            <SelectItem value="non-recurring">Non-recurring Only</SelectItem>
                        </SelectContent>
                    </Select>

                    {/* Bulk Actions */}
                    {selectedIds.length > 0 && (
                        <div className="flex items-center gap-2">
                            <Button
                                variant="destructive"
                                size="sm"
                                className="cursor-pointer"
                                onClick={handleBulkDelete}
                            >
                                <Trash className="h-4 w-4 mr-2" />
                                Delete Selected ({selectedIds.length})
                            </Button>
                        </div>
                    )}

                    {(searchTerm || typeFilter || recurringFilter) && (
                        <Button
                            variant="outline"
                            size="icon"
                            className="cursor-pointer"
                            onClick={handleClearFilters}
                            title="Clear filters"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    )}

                    <Button
                        variant="outline"
                        size="sm"
                        className="cursor-pointer"
                        onClick={handleExport}
                        title="Export CSV"
                    >
                        <Download className="h-4 w-4 mr-2" />
                        Export
                    </Button>
                </div>
            </div>

            {/* Table */}
            <Table wrapperClassName="rounded-md border max-h-[calc(100vh-280px)] overflow-auto">
                <TableHeader className="sticky top-0 z-10 bg-background shadow-sm">
                    <TableRow>
                        <TableHead className="w-10">
                            <Checkbox
                                checked={
                                    selectedIds.length === paginatedTransactions.length &&
                                    paginatedTransactions.length > 0
                                }
                                onCheckedChange={handleSelectAll}
                                className="cursor-pointer"
                            />
                        </TableHead>
                        <TableHead className="cursor-pointer" onClick={() => handleSort("date")}>
                            <div className="flex items-center">
                                Date
                                {sortConfig.field === "date" &&
                                    (sortConfig.direction === "asc" ? (
                                        <ChevronUp className="ml-1 h-4 w-4" />
                                    ) : (
                                        <ChevronDown className="ml-1 h-4 w-4" />
                                    ))}
                            </div>
                        </TableHead>
                        <TableHead className="text-left w-full">Description</TableHead>
                        <TableHead className="cursor-pointer" onClick={() => handleSort("category")}>
                            <div className="flex items-center">
                                Category
                                {sortConfig.field === "category" &&
                                    (sortConfig.direction === "asc" ? (
                                        <ChevronUp className="ml-1 h-4 w-4" />
                                    ) : (
                                        <ChevronDown className="ml-1 h-4 w-4" />
                                    ))}
                            </div>
                        </TableHead>
                        <TableHead
                            className="cursor-pointer text-right pr-10"
                            onClick={() => handleSort("amount")}
                        >
                            <div className="flex items-center justify-end">
                                Amount
                                {sortConfig.field === "amount" &&
                                    (sortConfig.direction === "asc" ? (
                                        <ChevronUp className="ml-1 h-4 w-4" />
                                    ) : (
                                        <ChevronDown className="ml-1 h-4 w-4" />
                                    ))}
                            </div>
                        </TableHead>
                        <TableHead className="text-right pr-10">Balance</TableHead>
                        <TableHead className="text-center">Recurring</TableHead>
                        <TableHead className="w-10" />
                    </TableRow>
                </TableHeader>

                <TableBody>
                    {paginatedTransactions.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={7} className="text-center text-muted-foreground">
                                No transactions found
                            </TableCell>
                        </TableRow>
                    ) : (
                        paginatedTransactions.map((transaction) => (
                            <TableRow key={transaction._id}>
                                <TableCell>
                                    <Checkbox
                                        checked={selectedIds.includes(transaction._id)}
                                        onCheckedChange={() => handleSelect(transaction._id)}
                                        className="cursor-pointer"
                                    />
                                </TableCell>
                                <TableCell>{format(new Date(transaction.date), "PP")}</TableCell>
                                <TableCell className="break-words whitespace-normal">
                                    {transaction.description}
                                </TableCell>
                                <TableCell className="capitalize">
                                    <span
                                        style={{
                                            background: categoryColors[transaction.category],
                                        }}
                                        className="px-2 py-1 rounded text-white text-sm"
                                    >
                                        {transaction.category}
                                    </span>
                                </TableCell>
                                <TableCell
                                    className={cn(
                                        "text-right font-medium pr-10",
                                        transaction.type === "EXPENSE" ? "text-red-500" : "text-green-500",
                                    )}
                                >
                                    {transaction.type === "EXPENSE" ? "-" : "+"}₹
                                    {transaction.amount.toFixed(2)}
                                </TableCell>
                                <TableCell className="text-right font-medium text-muted-foreground pr-10">
                                    ₹{transaction.runningBalance.toFixed(2)}
                                </TableCell>
                                <TableCell className="text-center">
                                    {transaction.isRecurring ? (
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger>
                                                    <Badge
                                                        variant="secondary"
                                                        className="gap-1 bg-purple-100 text-purple-700 hover:bg-purple-200"
                                                    >
                                                        <RefreshCw className="h-3 w-3" />
                                                        {RECURRING_INTERVALS[transaction.recurringInterval]}
                                                    </Badge>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <div className="text-sm">
                                                        <div className="font-medium">Next Date:</div>
                                                        <div>
                                                            {transaction.nextRecurringDate
                                                                ? format(
                                                                      new Date(transaction.nextRecurringDate),
                                                                      "PPP",
                                                                  )
                                                                : "Date not available"}
                                                        </div>
                                                    </div>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    ) : (
                                        <Badge variant="outline" className="gap-1">
                                            <Clock className="h-3 w-3" />
                                            One-time
                                        </Badge>
                                    )}
                                </TableCell>
                                <TableCell>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" className="h-8 w-8 p-0 cursor-pointer">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem
                                                className="cursor-pointer"
                                                onClick={() =>
                                                    navigate(`/transaction/create?edit=${transaction._id}`)
                                                }
                                            >
                                                Edit
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem
                                                className="text-destructive cursor-pointer"
                                                onClick={() =>
                                                    setDeleteDialog({
                                                        isOpen: true,
                                                        ids: [transaction._id],
                                                    })
                                                }
                                            >
                                                Delete
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>

                <TableFooter>
                    <TableRow>
                        <TableCell colSpan={4} className="font-bold text-right">
                            Page Total :
                        </TableCell>
                        <TableCell
                            className={cn(
                                "text-right font-bold pr-10",
                                totalPageAmount >= 0 ? "text-green-500" : "text-red-500",
                            )}
                        >
                            {totalPageAmount < 0 ? "-" : "+"}₹{Math.abs(totalPageAmount).toFixed(2)}
                        </TableCell>
                        <TableCell colSpan={3}></TableCell>
                    </TableRow>

                    <TableRow>
                        <TableCell colSpan={4} className="font-bold text-right">
                            Filtered Total :
                        </TableCell>
                        <TableCell
                            className={cn(
                                "text-right font-bold pr-10",
                                totalFilteredAmount >= 0 ? "text-green-500" : "text-red-500",
                            )}
                        >
                            {totalFilteredAmount < 0 ? "-" : "+"}₹{Math.abs(totalFilteredAmount).toFixed(2)}
                        </TableCell>
                        <TableCell colSpan={3}></TableCell>
                    </TableRow>
                </TableFooter>
            </Table>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-1 mt-6">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handlePageChange(1)}
                        disabled={currentPage === 1}
                        className="text-muted-foreground hover:text-primary cursor-pointer"
                    >
                        <ChevronsLeft className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="text-muted-foreground hover:text-primary cursor-pointer"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>

                    <div className="relative flex items-center gap-1 max-w-[60vw] md:max-w-[400px] overflow-x-auto scroll-smooth [&::-webkit-scrollbar]:hidden px-1">
                        {/* Sliding Background */}
                        <div
                            className="absolute left-1 top-0 h-8 w-8 bg-blue-500 rounded-full transition-transform duration-500 ease-in-out pointer-events-none z-0"
                            style={{
                                transform: `translateX(${(currentPage - 1) * 36}px)`,
                            }}
                        />

                        {Array.from({length: totalPages}, (_, i) => {
                            const pageNum = i + 1;
                            return (
                                <Button
                                    key={pageNum}
                                    id={`page-btn-${pageNum}`}
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handlePageChange(pageNum)}
                                    className={cn(
                                        "h-8 w-8 min-w-8 rounded-full font-medium z-10 transition-colors duration-300 cursor-pointer",
                                        currentPage === pageNum
                                            ? "text-white hover:text-white hover:bg-transparent"
                                            : "text-muted-foreground hover:text-primary",
                                    )}
                                >
                                    {pageNum}
                                </Button>
                            );
                        })}
                    </div>

                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="text-muted-foreground hover:text-primary cursor-pointer"
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handlePageChange(totalPages)}
                        disabled={currentPage === totalPages}
                        className="text-muted-foreground hover:text-primary cursor-pointer"
                    >
                        <ChevronsRight className="h-4 w-4" />
                    </Button>
                </div>
            )}

            {/* Delete Confirmation Dialog */}
            <AlertDialog
                open={deleteDialog.isOpen}
                onOpenChange={(isOpen) => setDeleteDialog((prev) => ({...prev, isOpen}))}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete{" "}
                            {deleteDialog.ids.length} transaction(s).
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="cursor-pointer">Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleConfirmDelete}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90 cursor-pointer"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
