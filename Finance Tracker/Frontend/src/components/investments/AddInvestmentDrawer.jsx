import React, {useEffect} from "react";
import {
    Drawer,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
    DrawerFooter,
    DrawerClose,
} from "@/components/ui/drawer";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {useForm, Controller} from "react-hook-form";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";
import {PopoverAnchor} from "@radix-ui/react-popover";
import {Calendar} from "@/components/ui/calendar";
import {format} from "date-fns";
import {z} from "zod";
import {zodResolver} from "@hookform/resolvers/zod";
import {useAuth} from "@clerk/react";
import useFetch from "@/hooks/useFetch";
import {addInvestment, updateInvestment, searchSymbols, fetchCurrentPrice} from "@/services/investment.api";
import {toast} from "sonner";
import {Loader2} from "lucide-react";

const ASSET_TYPES = [
    {value: "STOCK", label: "Stock"},
    {value: "MUTUAL_FUND", label: "Mutual Fund"},
    {value: "CRYPTO", label: "Cryptocurrency"},
    {value: "FD", label: "Fixed Deposit"},
    {value: "REAL_ESTATE", label: "Real Estate"},
    {value: "GOLD", label: "Gold"},
    {value: "LIC", label: "LIC"},
    {value: "OTHER", label: "Other"},
];

const investmentSchema = z.object({
    assetName: z.string().min(1, "Asset name is required"),
    assetType: z.enum(["STOCK", "MUTUAL_FUND", "CRYPTO", "FD", "REAL_ESTATE", "GOLD", "LIC", "OTHER"]),
    symbol: z.string().optional(),
    quantity: z
        .string()
        .min(1, "Quantity is required")
        .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, "Must be a positive number"),
    purchasePrice: z
        .string()
        .min(1, "Purchase price is required")
        .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, "Must be a positive number"),
    currentPrice: z.string().optional(),
    purchaseDate: z.string().min(1, "Date is required"),
    notes: z.string().optional(),
});

export default function AddInvestmentDrawer({
    children,
    onInvestmentAdded,
    editData = null,
    isOpen,
    setIsOpen,
}) {
    const [isDatePickerOpen, setIsDatePickerOpen] = React.useState(false);

    const {
        register,
        handleSubmit,
        formState: {errors},
        reset,
        control,
        watch,
        setValue,
    } = useForm({
        resolver: zodResolver(investmentSchema),
        defaultValues: {
            assetName: "",
            assetType: "STOCK",
            symbol: "",
            quantity: "",
            purchasePrice: "",
            currentPrice: "",
            purchaseDate: new Date().toISOString().split("T")[0],
            notes: "",
        },
    });

    const {loading, fn: submitInvestment, data} = useFetch(editData ? updateInvestment : addInvestment);
    const { getToken } = useAuth();
    const [searchResults, setSearchResults] = React.useState([]);
    const [isSearching, setIsSearching] = React.useState(false);
    const [showSuggestions, setShowSuggestions] = React.useState(false);
    const [searchQuery, setSearchQuery] = React.useState("");

    const assetType = watch("assetType");

    useEffect(() => {
        let isCurrent = true;

        const fetchResults = async () => {
            if (!searchQuery || searchQuery.length < 2) {
                if (isCurrent) {
                    setSearchResults([]);
                    setShowSuggestions(false);
                }
                return;
            }
            setIsSearching(true);
            try {
                const token = await getToken();
                const res = await searchSymbols(token, searchQuery, assetType);
                if (isCurrent) {
                    if (res.success) {
                        setSearchResults(res.data || []);
                        setShowSuggestions(true);
                    }
                }
            } catch (err) {
                if (isCurrent) {
                    console.error("Failed to search symbols:", err.message);
                }
            } finally {
                if (isCurrent) {
                    setIsSearching(false);
                }
            }
        };

        const timeoutId = setTimeout(fetchResults, 400);
        return () => {
            isCurrent = false;
            clearTimeout(timeoutId);
        };
    }, [searchQuery, assetType, getToken]);

    const handleSelectSuggestion = async (suggestion) => {
        setValue("assetName", suggestion.name, { shouldValidate: true });
        setValue("symbol", suggestion.symbol, { shouldValidate: true });
        
        let mappedType = "STOCK";
        if (suggestion.type === "EQUITY") {
            mappedType = "STOCK";
        } else if (suggestion.type === "CRYPTOCURRENCY") {
            mappedType = "CRYPTO";
        } else if (suggestion.type === "MUTUALFUND") {
            mappedType = "MUTUAL_FUND";
        }
        
        setValue("assetType", mappedType, { shouldValidate: true });
        setShowSuggestions(false);
        
        // Auto-fetch price
        try {
            const token = await getToken();
            const res = await fetchCurrentPrice(token, suggestion.symbol, mappedType);
            if (res.success && res.price) {
                setValue("currentPrice", res.price.toFixed(2).toString(), { shouldValidate: true });
                toast.success(`Fetched current price: ${res.price}`);
            }
        } catch (err) {
            console.error("Failed to fetch price", err);
        }
    };

    useEffect(() => {
        if (editData) {
            reset({
                ...editData,
                quantity: editData.quantity.toString(),
                purchasePrice: parseFloat(editData.purchasePrice).toFixed(2),
                currentPrice: editData.currentPrice ? parseFloat(editData.currentPrice).toFixed(2) : "",
                purchaseDate: new Date(editData.purchaseDate).toISOString().split("T")[0],
                notes: editData.notes || "",
            });
        } else if (isOpen) {
            reset({
                assetName: "",
                assetType: "STOCK",
                symbol: "",
                quantity: "",
                purchasePrice: "",
                currentPrice: "",
                purchaseDate: new Date().toISOString().split("T")[0],
                notes: "",
            });
        }
    }, [editData, isOpen, reset]);

    const onSubmit = async (formData) => {
        const payload = {
            ...formData,
            quantity: parseFloat(formData.quantity),
            purchasePrice: parseFloat(formData.purchasePrice),
            currentPrice: formData.currentPrice ? parseFloat(formData.currentPrice) : 0,
            purchaseDate: new Date(formData.purchaseDate).toISOString(),
        };

        try {
            if (editData) {
                await submitInvestment(editData._id, payload);
            } else {
                await submitInvestment(payload);
            }
            toast.success(`Investment ${editData ? "updated" : "added"} successfully`);
            onInvestmentAdded();
            setIsOpen(false);
            if (!editData) reset();
        } catch (error) {
            // Error is handled by useFetch internally via toast
        }
    };

    return (
        <Drawer open={isOpen} onOpenChange={setIsOpen}>
            {children && <DrawerTrigger asChild>{children}</DrawerTrigger>}
            <DrawerContent>
                <div className="mx-auto w-full max-w-lg">
                    <DrawerHeader>
                        <DrawerTitle>{editData ? "Edit Investment" : "Add New Investment"}</DrawerTitle>
                    </DrawerHeader>

                    <form onSubmit={handleSubmit(onSubmit)} className="p-4 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Asset Type</label>
                                <Controller
                                    name="assetType"
                                    control={control}
                                    render={({field}) => (
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {ASSET_TYPES.map((type) => (
                                                    <SelectItem key={type.value} value={type.value}>
                                                        {type.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                                {errors.assetType && (
                                    <p className="text-red-500 text-xs">{errors.assetType.message}</p>
                                )}
                            </div>

                            <div className="space-y-2 relative">
                                <label className="text-sm font-medium">Asset Name</label>
                                <Controller
                                    name="assetName"
                                    control={control}
                                    render={({ field }) => (
                                        <Input
                                            {...field}
                                            placeholder="Search Yahoo Finance or type custom..."
                                            onChange={(e) => {
                                                field.onChange(e);
                                                setSearchQuery(e.target.value);
                                            }}
                                            onFocus={() => {
                                                if (searchResults.length > 0) setShowSuggestions(true);
                                            }}
                                            onBlur={() => {
                                                field.onBlur();
                                                setTimeout(() => setShowSuggestions(false), 200);
                                            }}
                                            autoComplete="off"
                                        />
                                    )}
                                />
                                {showSuggestions && (
                                    <div className="absolute z-50 w-full mt-1 bg-popover text-popover-foreground border rounded-md shadow-md max-h-60 overflow-y-auto">
                                        {isSearching ? (
                                            <div className="p-2 text-sm text-center text-muted-foreground">Searching...</div>
                                        ) : searchResults.length === 0 ? (
                                            <div className="p-2 text-sm text-center text-muted-foreground">No results found</div>
                                        ) : (
                                            searchResults.map((item, i) => (
                                                <div 
                                                    key={i} 
                                                    className="px-3 py-2 cursor-pointer hover:bg-muted text-sm border-b last:border-0"
                                                    onMouseDown={() => handleSelectSuggestion(item)}
                                                >
                                                    <div className="font-medium text-foreground">{item.name}</div>
                                                    <div className="text-xs text-muted-foreground">{item.symbol} &bull; {item.exchange}</div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                )}
                                {errors.assetName && (
                                    <p className="text-red-500 text-xs">{errors.assetName.message}</p>
                                )}
                            </div>
                        </div>

                        {(assetType === "STOCK" || assetType === "MUTUAL_FUND" || assetType === "CRYPTO") && (
                            <div className="space-y-2">
                                <label className="text-sm font-medium">
                                    Ticker Symbol (Optional - For live data)
                                </label>
                                <Input
                                    placeholder={
                                        assetType === "MUTUAL_FUND"
                                            ? "MFAPI Scheme Code (e.g. 120503)"
                                            : "e.g. RELIANCE.NS, BTC-USD"
                                    }
                                    {...register("symbol")}
                                />
                                <p className="text-xs text-muted-foreground">
                                    Add Yahoo Finance symbol (.NS/.BO) or MFAPI code.
                                </p>
                                {errors.symbol && (
                                    <p className="text-red-500 text-xs">{errors.symbol.message}</p>
                                )}
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Quantity</label>
                                <Input
                                    type="number"
                                    step="0.0001"
                                    placeholder="10"
                                    {...register("quantity")}
                                />
                                {errors.quantity && (
                                    <p className="text-red-500 text-xs">{errors.quantity.message}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Purchase Date</label>
                                <Popover
                                    open={isDatePickerOpen}
                                    onOpenChange={setIsDatePickerOpen}
                                    modal={true}
                                >
                                    <PopoverAnchor asChild>
                                        <div className="relative flex items-center date-input-container">
                                            <Input
                                                type="text"
                                                value={
                                                    watch("purchaseDate")
                                                        ? format(
                                                              new Date(watch("purchaseDate")),
                                                              "dd MMM yyyy",
                                                          )
                                                        : ""
                                                }
                                                onChange={() => {}}
                                                onClick={() => setIsDatePickerOpen(true)}
                                                readOnly
                                                placeholder="Select date"
                                                className="pl-3 cursor-pointer"
                                            />
                                        </div>
                                    </PopoverAnchor>
                                    <PopoverContent
                                        className="w-auto p-0 z-9999"
                                        align="start"
                                        side="bottom"
                                        avoidCollisions={false}
                                        onOpenAutoFocus={(e) => e.preventDefault()}
                                        onPointerDownOutside={(e) => {
                                            if (e.target.closest(".date-input-container")) {
                                                e.preventDefault();
                                            }
                                        }}
                                    >
                                        <Calendar
                                            mode="single"
                                            captionLayout="dropdown"
                                            startMonth={new Date(1990, 0)}
                                            endMonth={new Date()}
                                            selected={
                                                watch("purchaseDate")
                                                    ? new Date(watch("purchaseDate"))
                                                    : new Date()
                                            }
                                            onSelect={(newDate) => {
                                                if (newDate) {
                                                    setValue("purchaseDate", format(newDate, "yyyy-MM-dd"));
                                                    setIsDatePickerOpen(false);
                                                }
                                            }}
                                            disabled={(date) =>
                                                date > new Date() || date < new Date("1900-01-01")
                                            }
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                                {errors.purchaseDate && (
                                    <p className="text-red-500 text-xs">{errors.purchaseDate.message}</p>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Purchase Price (per unit)</label>
                                <Input
                                    type="number"
                                    step="0.01"
                                    placeholder="1500"
                                    {...register("purchasePrice")}
                                />
                                {errors.purchasePrice && (
                                    <p className="text-red-500 text-xs">{errors.purchasePrice.message}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Current Price (Optional)</label>
                                <Input
                                    type="number"
                                    step="0.01"
                                    placeholder="Auto-fetched if symbol given"
                                    {...register("currentPrice")}
                                />
                                {errors.currentPrice && (
                                    <p className="text-red-500 text-xs">{errors.currentPrice.message}</p>
                                )}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Notes</label>
                            <Input placeholder="Any details..." {...register("notes")} />
                        </div>

                        <DrawerFooter className="px-0">
                            <Button type="submit" disabled={loading} className="cursor-pointer">
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {loading
                                    ? editData
                                        ? "Updating..."
                                        : `Adding ${watch("assetName") || "Asset"}...`
                                    : editData
                                      ? "Update Investment"
                                      : "Add Investment"}
                            </Button>
                            <DrawerClose asChild>
                                <Button
                                    variant="outline"
                                    type="button"
                                    onClick={() => {
                                        if (!editData) reset();
                                    }}
                                    className="cursor-pointer"
                                >
                                    Cancel
                                </Button>
                            </DrawerClose>
                        </DrawerFooter>
                    </form>
                </div>
            </DrawerContent>
        </Drawer>
    );
}
