import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, RefreshCw, Trash2, Edit } from "lucide-react";
import useFetch from "@/hooks/useFetch";
import { getInvestments, syncLivePrices, deleteInvestment } from "@/services/investment.api";
import { BarLoader } from "react-spinners";
import AddInvestmentDrawer from "@/components/investments/AddInvestmentDrawer";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const ASSET_CATEGORIES = {
    STOCK: "Stocks",
    MUTUAL_FUND: "Mutual Fund",
    CRYPTO: "Crypto",
    FD: "Fixed Deposits",
    REAL_ESTATE: "Real Estate",
    GOLD: "Gold",
    OTHER: "Other"
};

export default function InvestmentsPage() {
    const { data: investments, loading, fn: fetchInvestments } = useFetch(getInvestments);
    const { loading: syncLoading, fn: runSync } = useFetch(syncLivePrices);
    const { fn: removeInvestment } = useFetch(deleteInvestment);

    const [isAddDrawerOpen, setIsAddDrawerOpen] = useState(false);
    const [editData, setEditData] = useState(null);
    const [activeTab, setActiveTab] = useState("ALL");

    useEffect(() => {
        fetchInvestments();
    }, []);

    const handleSync = async () => {
        await runSync();
        toast.success("Live prices synced successfully!");
        fetchInvestments();
    };

    const handleDelete = async (id) => {
        if (confirm("Are you sure you want to delete this investment?")) {
            await removeInvestment(id);
            toast.success("Investment deleted");
            fetchInvestments();
        }
    };

    const handleEdit = (inv) => {
        setEditData(inv);
        setIsAddDrawerOpen(true);
    };

    if (loading && !investments) {
        return (
            <div className="flex justify-center items-center h-[50vh]">
                <BarLoader color="#9333ea" width={200} />
            </div>
        );
    }

    const data = investments?.data || [];
    
    // Determine available tabs based on data
    const availableTypes = ["ALL", ...new Set(data.map(d => d.assetType).filter(Boolean))];
    if (!availableTypes.includes("STOCK")) availableTypes.push("STOCK");
    if (!availableTypes.includes("MUTUAL_FUND")) availableTypes.push("MUTUAL_FUND");
    if (!availableTypes.includes("CRYPTO")) availableTypes.push("CRYPTO");

    const tabAssets = activeTab === "ALL" ? data : data.filter(inv => inv.assetType === activeTab);

    // Calculate Portfolio Metrics for ACTIVE TAB
    const tabInvested = tabAssets.reduce((acc, inv) => acc + (inv.purchasePrice * inv.quantity), 0);
    const tabCurrent = tabAssets.reduce((acc, inv) => acc + ((inv.currentPrice || inv.purchasePrice) * inv.quantity), 0);
    const tabReturn = tabCurrent - tabInvested;
    const tabReturnPercent = tabInvested > 0 ? (tabReturn / tabInvested) * 100 : 0;
    const tabIsProfit = tabReturn >= 0;

    return (
        <div className="space-y-6 px-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-3xl font-bold tracking-tight gradient-title">Investment Portfolio</h1>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={handleSync} disabled={syncLoading} className="cursor-pointer">
                        <RefreshCw className={`h-4 w-4 mr-2 ${syncLoading ? "animate-spin" : ""}`} />
                        {syncLoading ? "Syncing..." : "Sync Prices"}
                    </Button>
                    <Button onClick={() => { setEditData(null); setIsAddDrawerOpen(true); }} className="cursor-pointer">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Asset
                    </Button>
                </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                
                <div className="bg-[#0f172a] dark:bg-slate-950 p-6 rounded-xl border border-slate-800 shadow-sm mb-6">
                    <div className="flex flex-wrap items-center gap-6 mb-8 overflow-x-auto pb-2 border-b border-slate-800">
                        <h2 className="text-xl font-semibold text-white whitespace-nowrap">My Portfolio</h2>
                        <TabsList className="bg-transparent h-auto p-0 space-x-2">
                            {availableTypes.map(type => (
                                <TabsTrigger 
                                    key={type} 
                                    value={type}
                                    className="data-[state=active]:bg-slate-800 data-[state=active]:text-white dark:data-[state=active]:bg-slate-800 dark:data-[state=active]:text-white rounded-md px-4 py-2 border border-transparent data-[state=active]:border-slate-700 transition-all text-slate-500 dark:text-slate-400 hover:text-white cursor-pointer"
                                >
                                    {type === "ALL" ? "All" : (ASSET_CATEGORIES[type] || type)}
                                </TabsTrigger>
                            ))}
                        </TabsList>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        <div>
                            <p className="text-sm text-slate-500 mb-1">Investment</p>
                            <p className="text-2xl font-semibold text-white">₹{tabInvested.toLocaleString('en-IN', { maximumFractionDigits: 2, minimumFractionDigits: 2 })}</p>
                        </div>
                        <div>
                            <p className="text-sm text-slate-500 mb-1">Current Value</p>
                            <p className="text-2xl font-semibold text-white">₹{tabCurrent.toLocaleString('en-IN', { maximumFractionDigits: 2, minimumFractionDigits: 2 })}</p>
                        </div>
                        <div>
                            <p className="text-sm text-slate-500 mb-1">Overall Profits</p>
                            <p className={`text-2xl font-semibold ${tabIsProfit ? "text-green-400" : "text-red-400"}`}>
                                {tabIsProfit ? "" : "-"}₹{Math.abs(tabReturn).toLocaleString('en-IN', { maximumFractionDigits: 2, minimumFractionDigits: 2 })} 
                                <span className="text-base font-normal ml-2">({tabIsProfit ? "+" : ""}{tabReturnPercent.toFixed(2)}%)</span>
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-slate-500 mb-1">Today's Profit</p>
                            <p className="text-2xl font-semibold text-slate-500">
                                ₹0.00 <span className="text-base font-normal ml-2">(0.00%)</span>
                            </p> 
                        </div>
                    </div>
                    
                    <div className="mt-8 pt-4 border-t border-slate-800">
                        <p className="text-slate-400 text-sm">
                            Today's P&L: <span className="text-white font-medium ml-1">₹ 0.00</span>
                        </p>
                    </div>
                </div>

                <div className="mb-6">
                        {availableTypes.map(type => (
                            <TabsContent key={type} value={type} className="mt-0">
                                <div className="border rounded-xl bg-card text-card-foreground shadow-sm overflow-x-auto h-full">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="hover:bg-transparent">
                                                <TableHead>Asset Name</TableHead>
                                                <TableHead>Symbol</TableHead>
                                                <TableHead className="text-right">Quantity</TableHead>
                                                <TableHead className="text-right">Avg. Price</TableHead>
                                                <TableHead className="text-right">LTP</TableHead>
                                                <TableHead className="text-right">Inv. Value</TableHead>
                                                <TableHead className="text-right">Current Value</TableHead>
                                                <TableHead className="text-right">Overall P&L</TableHead>
                                                <TableHead className="text-right">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {tabAssets.length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                                                        No investments found.
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                tabAssets.map((inv) => {
                                                    const invested = inv.purchasePrice * inv.quantity;
                                                    const current = (inv.currentPrice || inv.purchasePrice) * inv.quantity;
                                                    const invReturn = current - invested;
                                                    const invReturnPercent = invested > 0 ? (invReturn / invested) * 100 : 0;
                                                    const invIsProfit = invReturn >= 0;

                                                    return (
                                                        <TableRow key={inv._id}>
                                                            <TableCell className="font-medium">{inv.assetName}</TableCell>
                                                            <TableCell className="text-muted-foreground text-xs">{inv.symbol || "-"}</TableCell>
                                                            <TableCell className="text-right">{inv.quantity}</TableCell>
                                                            <TableCell className="text-right">₹{inv.purchasePrice.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</TableCell>
                                                            <TableCell className="text-right">₹{(inv.currentPrice || inv.purchasePrice).toLocaleString('en-IN', { maximumFractionDigits: 2 })}</TableCell>
                                                            <TableCell className="text-right">₹{invested.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</TableCell>
                                                            <TableCell className="text-right">₹{current.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</TableCell>
                                                            <TableCell className={`text-right font-medium ${invIsProfit ? "text-green-600 dark:text-green-500" : "text-red-600 dark:text-red-500"}`}>
                                                                {invIsProfit ? "+" : ""}₹{invReturn.toLocaleString('en-IN', { maximumFractionDigits: 2 })} 
                                                                <span className="text-[10px] ml-1 block opacity-80">({invIsProfit ? "+" : ""}{invReturnPercent.toFixed(2)}%)</span>
                                                            </TableCell>
                                                            <TableCell className="text-right">
                                                                <div className="flex justify-end gap-1">
                                                                    <Button variant="ghost" size="icon" className="h-8 w-8 cursor-pointer" onClick={() => handleEdit(inv)}>
                                                                        <Edit className="h-4 w-4" />
                                                                    </Button>
                                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950 cursor-pointer" onClick={() => handleDelete(inv._id)}>
                                                                        <Trash2 className="h-4 w-4" />
                                                                    </Button>
                                                                </div>
                                                            </TableCell>
                                                        </TableRow>
                                                    );
                                                })
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                            </TabsContent>
                        ))}
                </div>
            </Tabs>

            <AddInvestmentDrawer 
                isOpen={isAddDrawerOpen} 
                setIsOpen={setIsAddDrawerOpen} 
                editData={editData}
                onInvestmentAdded={fetchInvestments}
            />
        </div>
    );
}
