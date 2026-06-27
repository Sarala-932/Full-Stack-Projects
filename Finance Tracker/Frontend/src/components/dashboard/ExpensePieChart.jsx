"use client";

import { useMemo } from "react";
import {
  PieChart,
  Pie,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const COLORS = [
  "#FF6B6B", // Red
  "#3498DB", // Blue
  "#9B59B6", // Purple
  "#F1C40F", // Yellow
  "#E67E22", // Orange
  "#34495E", // Dark Blue
  "#E74C3C", // Dark Red
];

export default function ExpensePieChart({ transactions }) {
  const pieChartData = useMemo(() => {
    if (!transactions) return [];

    const currentDate = new Date();
    const currentMonthExpenses = transactions.filter((t) => {
      const transactionDate = new Date(t.date);
      return (
        t.type === "EXPENSE" &&
        transactionDate.getMonth() === currentDate.getMonth() &&
        transactionDate.getFullYear() === currentDate.getFullYear()
      );
    });

    const expensesByCategory = currentMonthExpenses.reduce((acc, transaction) => {
      const category = transaction.category;
      if (!acc[category]) {
        acc[category] = 0;
      }
      acc[category] += transaction.amount;
      return acc;
    }, {});

    return Object.entries(expensesByCategory).map(([category, amount], index) => ({
      name: category,
      value: amount,
      fill: COLORS[index % COLORS.length]
    }));
  }, [transactions]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-medium">Monthly Expense Breakdown</CardTitle>
      </CardHeader>
      <CardContent className="p-0 pb-5">
        {pieChartData.length === 0 ? (
          <p className="text-center text-muted-foreground py-4">
            No expenses this month
          </p>
        ) : (
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <PieChart margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
                <Pie
                  data={pieChartData}
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  dataKey="value"
                  labelLine={false}
                  label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
                    if (percent < 0.05) return null;
                    const RADIAN = Math.PI / 180;
                    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                    const x = cx + radius * Math.cos(-midAngle * RADIAN);
                    const y = cy + radius * Math.sin(-midAngle * RADIAN);
                    return (
                      <text
                        x={x}
                        y={y}
                        fill="white"
                        textAnchor="middle"
                        dominantBaseline="central"
                        fontSize={12}
                        fontWeight="bold"
                      >
                        {`${(percent * 100).toFixed(0)}%`}
                      </text>
                    );
                  }}
                />
                <Tooltip
                  formatter={(value, name) => [`₹${value.toFixed(2)}`, name]}
                  contentStyle={{
                    backgroundColor: "hsl(var(--popover))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "var(--radius)",
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

        )}
      </CardContent>
    </Card>
  );
}
