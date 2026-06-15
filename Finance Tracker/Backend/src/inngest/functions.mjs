import {inngest} from "./client.mjs";
import budgetModel from "../models/budgetModel.mjs";
import transactionModel from "../models/transactionModel.mjs";
import userModel from "../models/userModel.mjs";
import accountModel from "../models/accountModel.mjs";
import {sendEmail} from "../lib/sendEmail.mjs";
import {emailTemplate} from "../lib/emailTemplate.js";
import mongoose from "mongoose";
// Helper to check if it's a new month
function isNewMonth(lastAlertDate, currentDate) {
    return (
        lastAlertDate.getMonth() !== currentDate.getMonth() ||
        lastAlertDate.getFullYear() !== currentDate.getFullYear()
    );
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

function isTransactionDue(transaction) {
    // If no lastProcessed date, transaction is due
    if (!transaction.lastProcessed) return true;

    const today = new Date();
    const nextDue = new Date(transaction.nextRecurringDate);

    // Compare with nextDue date
    return nextDue <= today;
}

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
