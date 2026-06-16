import {inngest} from "./client.mjs";
import budgetModel from "../models/budgetModel.mjs";
import transactionModel from "../models/transactionModel.mjs";
import userModel from "../models/userModel.mjs";
import accountModel from "../models/accountModel.mjs";
import {sendEmail} from "../lib/sendEmail.mjs";
import {emailTemplate} from "../lib/emailTemplate.js";
import mongoose from "mongoose";
import {GoogleGenerativeAI} from "@google/generative-ai";

// 1.Recurring Transaction Processing with Throttling
export const processRecurringTransaction = inngest.createFunction(
    {
        id: "process-recurring-transaction",
        name: "Process Recurring Transaction",
        triggers: [{event: "transaction.recurring.process"}],
        throttle: {
            limit: 10, // Process 10 transactions
            period: "1m", // per minute
            key: "event.data.userId", // Throttle per user
        },
    },
    async ({event, step}) => {
        // Validate event data
        if (!event?.data?.transactionId || !event?.data?.userId) {
            console.error("Invalid event data:", event);
            return {error: "Missing required event data"};
        }

        await step.run("process-transaction", async () => {
            const transaction = await transactionModel
                .findOne({
                    _id: event.data.transactionId,
                    userId: event.data.userId,
                })
                .lean();

            if (!transaction || !isTransactionDue(transaction)) return;

            const session = await mongoose.startSession();
            session.startTransaction();

            try {
                // Create new transaction
                await transactionModel.create(
                    [
                        {
                            type: transaction.type,
                            amount: transaction.amount,
                            description: `${transaction.description} (Recurring)`,
                            date: new Date(),
                            category: transaction.category,
                            userId: transaction.userId,
                            accountId: transaction.accountId,
                            isRecurring: false,
                            status: "COMPLETED",
                        },
                    ],
                    {session},
                );

                // Update account balance
                const balanceChange =
                    transaction.type === "EXPENSE" ? -transaction.amount : transaction.amount;

                await accountModel.findByIdAndUpdate(
                    transaction.accountId,
                    {$inc: {balance: balanceChange}},
                    {session},
                );

                // Update last processed date and next recurring date
                await transactionModel.findByIdAndUpdate(
                    transaction._id,
                    {
                        lastProcessed: new Date(),
                        nextRecurringDate: calculateNextRecurringDate(
                            new Date(),
                            transaction.recurringInterval,
                        ),
                    },
                    {session},
                );

                await session.commitTransaction();
            } catch (error) {
                await session.abortTransaction();
                throw error;
            } finally {
                session.endSession();
            }
        });
    },
);
// Trigger recurring transactions with batching
export const triggerRecurringTransactions = inngest.createFunction(
    {
        id: "trigger-recurring-transactions",
        name: "Trigger Recurring Transactions",
        triggers: [{cron: "0 0 * * *"}], // Daily at midnight
    },
    async ({step}) => {
        const recurringTransactions = await step.run("fetch-recurring-transactions", async () => {
            return await transactionModel
                .find({
                    isRecurring: true,
                    status: "COMPLETED",
                    $or: [
                        {lastProcessed: null},
                        {lastProcessed: {$exists: false}},
                        {nextRecurringDate: {$lte: new Date()}},
                    ],
                })
                .lean();
        });

        // Send event for each recurring transaction in batches
        if (recurringTransactions.length > 0) {
            const events = recurringTransactions.map((transaction) => ({
                name: "transaction.recurring.process",
                data: {
                    transactionId: transaction._id.toString(),
                    userId: transaction.userId.toString(),
                },
            }));

            // Send events directly using inngest.send()
            await inngest.send(events);
        }

        return {triggered: recurringTransactions.length};
    },
);

// 2. Monthly Report Generation
export const generateMonthlyReports = inngest.createFunction(
    {
        id: "generate-monthly-reports",
        name: "Generate Monthly Reports",
        triggers: [{cron: "0 0 1 * *"}], // First day of each month
    },
    async ({step}) => {
        const users = await step.run("fetch-users", async () => {
            return await userModel.find({}).lean();
        });

        for (const user of users) {
            await step.run(`generate-report-${user._id}`, async () => {
                const lastMonth = new Date();
                lastMonth.setMonth(lastMonth.getMonth() - 1);

                const stats = await getMonthlyStats(user._id, lastMonth);
                const monthName = lastMonth.toLocaleString("default", {
                    month: "long",
                });

                // Generate AI insights
                const insights = await generateFinancialInsights(stats, monthName);

                const emailResult = await sendEmail({
                    to: user.email,
                    subject: `Your Monthly Financial Report - ${monthName}`,
                    html: emailTemplate({
                        userName: user.name || user.email.split("@")[0],
                        type: "monthly-report",
                        data: {
                            stats,
                            month: monthName,
                            insights,
                        },
                    }),
                });

                return {success: true, emailResult};
            });
        }

        return {processed: users.length};
    },
);

async function generateFinancialInsights(stats, month) {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({model: "gemini-2.5-flash"});

    const prompt = `
    Analyze this financial data and provide 3 concise, actionable insights.
    Focus on spending patterns and practical advice.
    Keep it friendly and conversational.

    Financial Data for ${month}:
    - Total Income: ₹${stats.totalIncome}
    - Total Expenses: ₹${stats.totalExpenses}
    - Net Income: ₹${stats.totalIncome - stats.totalExpenses}
    - Expense Categories: ${Object.entries(stats.byCategory)
        .map(([category, amount]) => `${category}: ₹${amount}`)
        .join(", ")}

    Format the response as a JSON array of strings, like this:
    ["insight 1", "insight 2", "insight 3"]
  `;

    try {
        const result = await model.generateContent(prompt);
        const response = result.response;
        const text = response.text();
        const cleanedText = text.replace(/```(?:json)?\n?/g, "").trim();

        return JSON.parse(cleanedText);
    } catch (error) {
        console.error("Error generating insights:", error);
        return [
            "Your highest expense category this month might need attention.",
            "Consider setting up a budget for better financial management.",
            "Track your recurring expenses to identify potential savings.",
        ];
    }
}

// 3. Budget Alerts with Event Batching
export const checkBudgetAlerts = inngest.createFunction(
    {id: "check-budget-alerts", triggers: [{cron: "0 */6 * * *"}]},
    async ({step}) => {
        // Step 1: Fetch all budgets with populated user
        const budgets = await step.run("fetch-budgets", async () => {
            return await budgetModel.find().populate("userId").lean();
        });

        // Step 2: Process each budget
        for (const budget of budgets) {
            // Get default account for this user
            const defaultAccount = await accountModel
                .findOne({
                    userId: budget.userId._id,
                    isDefault: true,
                })
                .lean();

            if (!defaultAccount) continue; // Skip if no default account

            await step.run(`check-budget-${budget._id}`, async () => {
                const currentDate = new Date();
                currentDate.setMonth(3); // 3 = April
                const startDate = new Date(currentDate);
                startDate.setDate(1);
                // const startDate = new Date();
                // startDate.setDate(1); // Start of current month
                startDate.setHours(0, 0, 0, 0);

                // Calculate total expenses for the default account
                const expenseAgg = await transactionModel.aggregate([
                    {
                        $match: {
                            userId: budget.userId._id,
                            accountId: defaultAccount._id,
                            type: "EXPENSE",
                            status: "COMPLETED",
                            date: {$gte: startDate},
                        },
                    },
                    {
                        $group: {
                            _id: null,
                            total: {$sum: "$amount"},
                        },
                    },
                ]);

                const totalExpenses = expenseAgg[0]?.total || 0;
                const budgetAmount = budget.amount;
                const percentageUsed = (totalExpenses / budgetAmount) * 100;
                console.log(percentageUsed);

                // Check if we should send an alert
                if (
                    percentageUsed >= 80 &&
                    (!budget.lastAlertSent || isNewMonth(new Date(budget.lastAlertSent), currentDate))
                ) {
                    // console.log(percentageUsed, budget.lastAlertSent);
                    await sendEmail({
                        to: budget.userId.email,
                        subject: `Budget Alert for ${defaultAccount.name}`,
                        html: emailTemplate({
                            userName: budget.userId.name,
                            type: "budget-alert",
                            data: {
                                percentageUsed,
                                budgetAmount: parseInt(budgetAmount).toFixed(1),
                                totalExpenses: parseInt(totalExpenses).toFixed(1),
                                accountName: defaultAccount.name,
                            },
                        }),
                    });

                    // Update lastAlertSent
                    await budgetModel.findByIdAndUpdate(budget._id, {
                        lastAlertSent: new Date(),
                    });
                }
            });
        }
    },
);

function isNewMonth(lastAlertDate, currentDate) {
    return (
        lastAlertDate.getMonth() !== currentDate.getMonth() ||
        lastAlertDate.getFullYear() !== currentDate.getFullYear()
    );
}

// Utility functions

function isTransactionDue(transaction) {
    // If no lastProcessed date, transaction is due
    if (!transaction.lastProcessed) return true;

    const today = new Date();
    const nextDue = new Date(transaction.nextRecurringDate);

    // Compare with nextDue date
    return nextDue <= today;
}

function calculateNextRecurringDate(date, interval) {
    const next = new Date(date);
    switch (interval) {
        case "DAILY":
            next.setDate(next.getDate() + 1);
            break;
        case "WEEKLY":
            next.setDate(next.getDate() + 7);
            break;
        case "MONTHLY":
            next.setMonth(next.getMonth() + 1);
            break;
        case "YEARLY":
            next.setFullYear(next.getFullYear() + 1);
            break;
    }
    return next;
}

async function getMonthlyStats(userId, month) {
    const startDate = new Date(month.getFullYear(), month.getMonth(), 1);
    const endDate = new Date(month.getFullYear(), month.getMonth() + 1, 0, 23, 59, 59, 999);

    const transactions = await transactionModel
        .find({
            userId,
            date: {
                $gte: startDate,
                $lte: endDate,
            },
        })
        .lean();

    const calculatedStats = transactions.reduce(
        (stats, t) => {
            const amount = t.amount;
            if (t.type === "EXPENSE") {
                stats.totalExpenses += amount;
                stats.byCategory[t.category] = (stats.byCategory[t.category] || 0) + amount;
            } else {
                stats.totalIncome += amount;
            }
            return stats;
        },
        {
            totalExpenses: 0,
            totalIncome: 0,
            byCategory: {},
            transactionCount: transactions.length,
        },
    );

    // Fix decimals to 2 places
    calculatedStats.totalIncome = parseFloat(calculatedStats.totalIncome.toFixed(2));
    calculatedStats.totalExpenses = parseFloat(calculatedStats.totalExpenses.toFixed(2));
    
    for (const category in calculatedStats.byCategory) {
        calculatedStats.byCategory[category] = parseFloat(calculatedStats.byCategory[category].toFixed(2));
    }

    return calculatedStats;
}
