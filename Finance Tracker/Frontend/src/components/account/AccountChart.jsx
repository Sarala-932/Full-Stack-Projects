import {endOfDay, format, startOfDay, subDays} from "date-fns";
import React, {useMemo, useState} from "react";
import {CalendarIcon} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
// import RechartsDevtools from "recharts/devtools";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";
import {Button} from "@/components/ui/button";
import {Calendar} from "@/components/ui/calendar";
import {cn} from "@/lib/utils";

export const DATE_RANGES = {
  "7D": {label: "Last 7 Days", days: 7},
  "1M": {label: "Last Month", days: 30},
  "3M": {label: "Last 3 Months", days: 90},
  "6M": {label: "Last 6 Months", days: 180},
  ALL: {label: "All Time", days: null},
  CUSTOM: {label: "Custom Range", days: null},
};

function AccountChart({transactions, dateRange, onDateRangeChange, customDateRange, onCustomDateRangeChange}) {

  const filteredData = useMemo(() => {
    let startDate, endDate;

    if (dateRange === "CUSTOM" && customDateRange?.from && customDateRange?.to) {
      startDate = startOfDay(customDateRange.from);
      endDate = endOfDay(customDateRange.to);
    } else {
      const range = DATE_RANGES[dateRange];
      const now = new Date();
      startDate = range.days
        ? startOfDay(subDays(now, range.days))
        : startOfDay(new Date(0));
      endDate = endOfDay(now);
    }

    const filtered = transactions.filter((t) => {
      return new Date(t.date) >= startDate && new Date(t.date) <= endDate;
    });

    const grouped = filtered.reduce((acc, transaction) => {
      const date = format(new Date(transaction.date), "MMM dd");

      if (!acc[date]) {
        acc[date] = {date, income: 0, expense: 0};
      }

      if (transaction.type === "INCOME") {
        acc[date].income += transaction.amount;
      } else {
        acc[date].expense += transaction.amount;
      }

      return acc;
    }, {});

    return Object.values(grouped).sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [transactions, dateRange, customDateRange]);

  // console.log(filteredData);

  const totals = useMemo(() => {
    return filteredData.reduce(
      (acc, day) => ({
        income: acc.income + day.income,
        expense: acc.expense + day.expense,
      }),
      {income: 0, expense: 0},
    );
  }, [filteredData]);
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-lg font-semibold">Transaction Overview</CardTitle>
        <div className="flex items-center gap-2">
          <Select defaultValue={dateRange} onValueChange={onDateRangeChange}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Select range" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(DATE_RANGES).map(([key, {label}]) => (
                <SelectItem key={key} value={key}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {dateRange === "CUSTOM" && (
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-[240px] justify-start text-left font-normal",
                    !customDateRange?.from && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {customDateRange?.from ? (
                    customDateRange.to ? (
                      <>
                        {format(customDateRange.from, "LLL dd, y")} -{" "}
                        {format(customDateRange.to, "LLL dd, y")}
                      </>
                    ) : (
                      format(customDateRange.from, "LLL dd, y")
                    )
                  ) : (
                    <span>Pick a date range</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={customDateRange?.from}
                  selected={customDateRange}
                  onSelect={onCustomDateRangeChange}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex justify-around mb-6 text-sm">
          <div className="text-center">
            <p className="text-muted-foreground">Total Income</p>
            <p className="text-lg font-bold text-green-500">
              ₹{totals.income.toFixed(2)}
            </p>
          </div>

          <div className="text-center">
            <p className="text-muted-foreground">Total Expenses</p>
            <p className="text-lg font-bold text-red-500">₹{totals.expense.toFixed(2)}</p>
          </div>

          <div className="text-center">
            <p className="text-muted-foreground">Net Balance</p>
            <p
              className={`text-lg font-bold ${
                totals.income - totals.expense >= 0 ? "text-green-500" : "text-red-500"
              }`}
            >
              ₹{(totals.income - totals.expense).toFixed(2)}
            </p>
          </div>
        </div>

        <div className="w-full">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={filteredData}
              margin={{
                top: 10,
                right: 10,
                left: 10,
                bottom: 0,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="date" />
              <YAxis
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `₹${value}`}
              />
              <Tooltip formatter={(value) => [`₹${value}`, undefined]} cursor={{fill: 'transparent'}} />
              <Legend />
              <Bar dataKey="income" name="Income" fill="#22c55e" radius={[4, 4, 0, 0]} maxBarSize={40} />
              <Bar
                dataKey="expense"
                name="Expense"
                fill="#ef4444"
                radius={[4, 4, 0, 0]}
                maxBarSize={40}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

export default AccountChart;
