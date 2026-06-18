import {useState, useEffect} from "react";
import {Pencil, Check, X, Plus, Trash2} from "lucide-react";
import useFetch from "../../hooks/useFetch";
import {toast} from "sonner";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {Progress} from "@/components/ui/progress";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {updateBudget} from "../../services/budget.api";
import {defaultCategories} from "../../data/categories";

export default function BudgetProgress({
    accountId,
    initialBudget,
    currentExpenses,
    categoryExpenses,
    onUpdate,
}) {
    const [isEditing, setIsEditing] = useState(false);
    const [newBudget, setNewBudget] = useState(initialBudget?.amount?.toString() || "");
    const [categoryLimits, setCategoryLimits] = useState(initialBudget?.categoryLimits || []);
    const [isAddingCategory, setIsAddingCategory] = useState(false);
    const [newCategory, setNewCategory] = useState("");
    const [newCategoryAmount, setNewCategoryAmount] = useState("");
    const [editingCategory, setEditingCategory] = useState(null);
    const [editingCategoryAmount, setEditingCategoryAmount] = useState("");

    useEffect(() => {
        if (initialBudget) {
            setNewBudget(initialBudget.amount?.toString() || "");
            setCategoryLimits(initialBudget.categoryLimits || []);
        } else {
            setNewBudget("");
            setCategoryLimits([]);
        }
        setIsEditing(false);
        setIsAddingCategory(false);
        setEditingCategory(null);
    }, [initialBudget, accountId]);

    const {loading: isLoading, fn: updateBudgetFn, data: updatedBudget, error} = useFetch(updateBudget);

    const rawPercentage =
        initialBudget && initialBudget.amount > 0 ? (currentExpenses / initialBudget.amount) * 100 : 0;
    const percentUsed = Math.min(Math.max(rawPercentage, 0), 100);

    const handleUpdateOverallBudget = async () => {
        const amount = parseFloat(newBudget);
        if (isNaN(amount) || amount <= 0) {
            toast.error("Please enter a valid overall budget amount");
            return;
        }
        try {
            const res = await updateBudgetFn({amount, accountId, categoryLimits});
            if (res?.success) toast.success("Overall budget updated successfully");
        } catch (e) {}
    };

    const handleCancel = () => {
        setNewBudget(initialBudget?.amount?.toString() || "");
        setCategoryLimits(initialBudget?.categoryLimits || []);
        setIsEditing(false);
        setIsAddingCategory(false);
    };

    const handleAddCategoryLimit = async () => {
        if (!newCategory || !newCategoryAmount) {
            toast.error("Please select a category and enter an amount");
            return;
        }
        const amount = parseFloat(newCategoryAmount);
        if (isNaN(amount) || amount <= 0) {
            toast.error("Please enter a valid amount");
            return;
        }

        // Check if category already has a limit
        if (categoryLimits.some((c) => c.category === newCategory)) {
            toast.error("This category already has a limit");
            return;
        }

        const updatedLimits = [...categoryLimits, {category: newCategory, amount}];
        setCategoryLimits(updatedLimits);
        setIsAddingCategory(false);
        setNewCategory("");
        setNewCategoryAmount("");

        if (initialBudget) {
            try {
                const res = await updateBudgetFn({
                    amount: initialBudget.amount,
                    accountId,
                    categoryLimits: updatedLimits,
                });
                if (res?.success) toast.success("Category limit added successfully");
            } catch (e) {}
        }
    };

    const handleRemoveCategoryLimit = async (categoryToRemove) => {
        const updatedLimits = categoryLimits.filter((c) => c.category !== categoryToRemove);
        setCategoryLimits(updatedLimits);
        if (initialBudget) {
            try {
                const res = await updateBudgetFn({
                    amount: initialBudget.amount,
                    accountId,
                    categoryLimits: updatedLimits,
                });
                if (res?.success) toast.success("Category limit deleted successfully");
            } catch (e) {}
        }
    };

    const handleEditCategoryLimit = (limit) => {
        setEditingCategory(limit.category);
        setEditingCategoryAmount(limit.amount.toString());
    };

    const handleSaveCategoryLimit = async () => {
        const amount = parseFloat(editingCategoryAmount);
        if (isNaN(amount) || amount <= 0) {
            toast.error("Please enter a valid amount");
            return;
        }

        const updatedLimits = categoryLimits.map((c) =>
            c.category === editingCategory ? {...c, amount} : c,
        );

        setCategoryLimits(updatedLimits);
        setEditingCategory(null);
        setEditingCategoryAmount("");

        if (initialBudget) {
            try {
                const res = await updateBudgetFn({
                    amount: initialBudget.amount,
                    accountId,
                    categoryLimits: updatedLimits,
                });
                if (res?.success) toast.success("Category limit updated successfully");
            } catch (e) {}
        }
    };

    const handleCancelEditCategory = () => {
        setEditingCategory(null);
        setEditingCategoryAmount("");
    };

    useEffect(() => {
        if (updatedBudget?.success) {
            setIsEditing(false);
            if (onUpdate) onUpdate();
        }
    }, [updatedBudget]);

    useEffect(() => {
        if (error) {
            toast.error(error.message || "Failed to update budget");
        }
    }, [error]);

    // Available categories for dropdown (exclude ones already added)
    const expenseCategories = defaultCategories.filter(
        (c) => c.type === "EXPENSE" && !categoryLimits.some((cl) => cl.category === c.id),
    );

    return (
        <div className="space-y-6">
            {/* Overall Budget Card */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <div className="flex-1">
                        <CardTitle className="text-sm font-medium">Overall Monthly Budget</CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                            {isEditing ? (
                                <div className="flex items-center gap-2">
                                    <Input
                                        type="number"
                                        value={newBudget}
                                        onChange={(e) => setNewBudget(e.target.value)}
                                        className="w-32"
                                        placeholder="Enter amount"
                                        autoFocus
                                        disabled={isLoading}
                                    />
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={handleUpdateOverallBudget}
                                        disabled={isLoading}
                                        className="cursor-pointer"
                                    >
                                        <Check className="h-4 w-4 text-green-500" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={handleCancel}
                                        disabled={isLoading}
                                        className="cursor-pointer"
                                    >
                                        <X className="h-4 w-4 text-red-500" />
                                    </Button>
                                </div>
                            ) : (
                                <>
                                    <CardDescription>
                                        {initialBudget
                                            ? `₹${currentExpenses.toFixed(2)} of ₹${initialBudget.amount.toFixed(2)} spent`
                                            : "No budget set for this account"}
                                    </CardDescription>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => setIsEditing(true)}
                                        className="h-6 w-6 cursor-pointer"
                                    >
                                        <Pencil className="h-3 w-3" />
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {initialBudget && (
                        <div className="space-y-2">
                            <Progress
                                value={percentUsed}
                                extraStyles={`${
                                    percentUsed >= 90
                                        ? "bg-red-500"
                                        : percentUsed >= 75
                                          ? "bg-yellow-500"
                                          : "bg-green-500"
                                }`}
                            />
                            <p className="text-xs text-muted-foreground text-right">
                                {percentUsed.toFixed(1)}% used
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Category Budgets */}
            {initialBudget && (
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-base font-semibold">Category Limits</CardTitle>
                            <CardDescription>Set budget limits for specific categories</CardDescription>
                        </div>
                        {!isAddingCategory && (
                            <Button
                                variant="outline"
                                size="sm"
                                className="cursor-pointer"
                                onClick={() => setIsAddingCategory(true)}
                            >
                                <Plus className="h-4 w-4 mr-2" /> Add Limit
                            </Button>
                        )}
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {isAddingCategory && (
                            <div className="flex items-center gap-2 p-3 border rounded-lg bg-muted/50 mb-4">
                                <Select value={newCategory} onValueChange={setNewCategory}>
                                    <SelectTrigger className="w-[180px] bg-background cursor-pointer">
                                        <SelectValue placeholder="Select category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {expenseCategories.map((c) => (
                                            <SelectItem key={c.id} value={c.id} className="cursor-pointer">
                                                {c.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <Input
                                    type="number"
                                    placeholder="Amount"
                                    value={newCategoryAmount}
                                    onChange={(e) => setNewCategoryAmount(e.target.value)}
                                    className="w-32 bg-background"
                                />
                                <Button
                                    size="sm"
                                    onClick={handleAddCategoryLimit}
                                    disabled={isLoading}
                                    className="cursor-pointer"
                                >
                                    Save
                                </Button>
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    onClick={() => setIsAddingCategory(false)}
                                    className="cursor-pointer"
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        )}

                        {categoryLimits.length === 0 && !isAddingCategory ? (
                            <p className="text-sm text-muted-foreground text-center py-4">
                                No category limits set.
                            </p>
                        ) : (
                            categoryLimits.map((limit, index) => {
                                const spent = categoryExpenses[limit.category] || 0;
                                const catPercentRaw = (spent / limit.amount) * 100;
                                const catPercent = Math.min(Math.max(catPercentRaw, 0), 100);
                                const categoryInfo = defaultCategories.find((c) => c.id === limit.category);

                                return (
                                    <div key={index} className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-medium">
                                                    {categoryInfo?.name || limit.category}
                                                </span>
                                                {editingCategory === limit.category ? (
                                                    <div className="flex items-center gap-2 ml-2">
                                                        <Input
                                                            type="number"
                                                            value={editingCategoryAmount}
                                                            onChange={(e) =>
                                                                setEditingCategoryAmount(e.target.value)
                                                            }
                                                            className="w-24 h-7 text-xs bg-background"
                                                            autoFocus
                                                        />
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-6 w-6 cursor-pointer"
                                                            onClick={handleSaveCategoryLimit}
                                                        >
                                                            <Check className="h-4 w-4 text-green-500" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-6 w-6 cursor-pointer"
                                                            onClick={handleCancelEditCategory}
                                                        >
                                                            <X className="h-4 w-4 text-red-500" />
                                                        </Button>
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-muted-foreground">
                                                        ₹{spent.toFixed(2)} / ₹{limit.amount.toFixed(2)}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-1">
                                                {!editingCategory && (
                                                    <>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-6 w-6 text-muted-foreground hover:text-primary cursor-pointer"
                                                            onClick={() => handleEditCategoryLimit(limit)}
                                                        >
                                                            <Pencil className="h-3 w-3" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-6 w-6 text-muted-foreground hover:text-red-500 cursor-pointer"
                                                            onClick={() =>
                                                                handleRemoveCategoryLimit(limit.category)
                                                            }
                                                        >
                                                            <Trash2 className="h-3 w-3" />
                                                        </Button>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                        <Progress
                                            value={catPercent}
                                            extraStyles={`${
                                                catPercent >= 90
                                                    ? "bg-red-500"
                                                    : catPercent >= 75
                                                      ? "bg-yellow-500"
                                                      : "bg-primary"
                                            }`}
                                            className="h-2"
                                        />
                                    </div>
                                );
                            })
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
