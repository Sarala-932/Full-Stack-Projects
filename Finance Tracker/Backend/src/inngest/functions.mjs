import {inngest} from "./client.mjs";
import budgetModel from "../models/budgetModel.mjs";
import transactionModel from "../models/transactionModel.mjs";
import userModel from "../models/userModel.mjs";
import accountModel from "../models/accountModel.mjs";
import {sendEmail} from "../lib/sendEmail.mjs";
import {emailTemplate} from "../emails/template.js";

// Helper to check if it's a new month
const isNewMonth = (date1, date2) => {
  return (
    date1.getMonth() !== date2.getMonth() || date1.getFullYear() !== date2.getFullYear()
  );
};

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
          (!budget.lastAlertSent ||
            isNewMonth(new Date(budget.lastAlertSent), currentDate))
        ) {
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
