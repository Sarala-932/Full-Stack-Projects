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
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieChartData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ₹${value.toFixed(2)}`}
                />
                <Tooltip
                  formatter={(value) => `₹${value.toFixed(2)}`}
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
