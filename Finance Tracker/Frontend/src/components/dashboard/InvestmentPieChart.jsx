import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#ffc658', '#ef4444'];

const ASSET_CATEGORIES = {
    STOCK: "Stocks",
    MUTUAL_FUND: "Mutual Fund",
    CRYPTO: "Crypto",
    FD: "Fixed Deposits",
    REAL_ESTATE: "Real Estate",
    GOLD: "Gold",
    OTHER: "Other"
};

export default function InvestmentPieChart({ investments }) {
    const data = investments?.data || [];

    const allocationData = data.reduce((acc, inv) => {
        const type = ASSET_CATEGORIES[inv.assetType] || inv.assetType;
        const val = (inv.currentPrice || inv.purchasePrice) * inv.quantity;
        if (!acc[type]) acc[type] = { name: type, value: 0 };
        acc[type].value += val;
        return acc;
    }, {});

    const pieData = Object.values(allocationData).filter(d => d.value > 0);

    return (
        <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
                <CardTitle className="text-base font-medium">Asset Allocation</CardTitle>
            </CardHeader>
            <CardContent>
                {pieData.length > 0 ? (
                    <div className="h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value) => `₹${value.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`} />
                                <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '12px' }}/>
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                ) : (
                    <div className="flex items-center justify-center h-[250px] text-muted-foreground text-sm">
                        No investment data
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
