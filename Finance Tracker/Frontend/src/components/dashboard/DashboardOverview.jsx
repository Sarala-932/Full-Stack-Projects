"use client";

import { useMemo, useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { format, subDays, startOfDay, endOfDay, isWithinInterval } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function DashboardOverview({ transactions }) {
  const [dateRange, setDateRange] = useState("30"); // days

  // Generate chart data based on transactions and date range
  const chartData = useMemo(() => {
    if (!transactions) return [];

    const days = parseInt(dateRange);
    const today = new Date();
    const startDate = subDays(today, days - 1);
    
    // Create an array of all days in the range
    const dataMap = {};
    for (let i = 0; i < days; i++) {
      const date = subDays(today, days - 1 - i);
      const formattedDate = format(date, "MMM dd");
      dataMap[formattedDate] = {
        date: formattedDate,
        income: 0,
        expense: 0,
      };
    }

    // Fill in the transaction data
    transactions.forEach((t) => {
      const tDate = new Date(t.date);
      if (isWithinInterval(tDate, { start: startOfDay(startDate), end: endOfDay(today) })) {
        const formattedDate = format(tDate, "MMM dd");
        if (dataMap[formattedDate]) {
          if (t.type === "INCOME") {
            dataMap[formattedDate].income += t.amount;
          } else if (t.type === "EXPENSE") {
            dataMap[formattedDate].expense += t.amount;
          }
        }
      }
    });

    return Object.values(dataMap);
  }, [transactions, dateRange]);

  return (
    <Card className="col-span-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-base font-normal">Cash flow</CardTitle>
        <Select value={dateRange} onValueChange={setDateRange}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Select range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 3 months</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="99%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
              <XAxis 
                dataKey="date" 
                tickLine={false} 
                axisLine={false} 
                tick={{ fontSize: 12, fill: "var(--muted-foreground)" }} 
                dy={10} 
              />
              <YAxis 
                tickLine={false} 
                axisLine={false} 
                tick={{ fontSize: 12, fill: "var(--muted-foreground)" }} 
                tickFormatter={(value) => `₹${value >= 1000 ? (value/1000).toFixed(1) + 'k' : value}`} 
              />
              <Tooltip
                formatter={(value) => `₹${value.toFixed(2)}`}
                contentStyle={{
                  backgroundColor: "hsl(var(--popover))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "var(--radius)",
                }}
              />
              <Area
                type="monotone"
                dataKey="income"
                name="Income"
                stroke="#22c55e"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorIncome)"
              />
              <Area
                type="monotone"
                dataKey="expense"
                name="Expense"
                stroke="#ef4444"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorExpense)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
