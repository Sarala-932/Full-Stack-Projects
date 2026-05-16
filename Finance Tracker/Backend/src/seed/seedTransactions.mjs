import transactionModel from "../models/transactionModel.mjs";
import accountModel from "../models/accountModel.mjs";
import {subDays, addDays} from "date-fns";

// ✅ Replace these with real IDs from your MongoDB
const ACCOUNT_ID = "69ed00b77a91a58b15582b78"; // your account _id
const USER_ID = "69e511c4f568ca7dc4563289"; // your user _id

const CATEGORIES = {
  INCOME: [
    {name: "salary", range: [5000, 8000]},
    {name: "freelance", range: [1000, 3000]},
    {name: "investments", range: [500, 2000]},
    {name: "other-income", range: [100, 1000]},
  ],
  EXPENSE: [
    {name: "housing", range: [1000, 2000]},
    {name: "transportation", range: [100, 500]},
    {name: "groceries", range: [200, 600]},
    {name: "utilities", range: [100, 300]},
    {name: "entertainment", range: [50, 200]},
    {name: "food", range: [50, 150]},
    {name: "shopping", range: [100, 500]},
    {name: "healthcare", range: [100, 1000]},
    {name: "education", range: [200, 1000]},
    {name: "travel", range: [500, 2000]},
  ],
};

function getRandomAmount(min, max) {
  return Number((Math.random() * (max - min) + min).toFixed(2));
}

function getRandomCategory(type) {
  const categories = CATEGORIES[type];
  const category = categories[Math.floor(Math.random() * categories.length)];
  const amount = getRandomAmount(category.range[0], category.range[1]);
  return {category: category.name, amount};
}

export async function seedTransactions() {
  try {
    const transactions = [];
    let totalBalance = 0;

    // generate 90 days of transactions
    for (let i = 90; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const transactionsPerDay = Math.floor(Math.random() * 3) + 1;

      for (let j = 0; j < transactionsPerDay; j++) {
        const type = Math.random() < 0.4 ? "INCOME" : "EXPENSE";
        const {category, amount} = getRandomCategory(type);

        // Make ~10% of transactions recurring
        const isRecurring = Math.random() < 0.1;
        let recurringInterval = null;
        let nextRecurringDate = null;

        if (isRecurring) {
          const intervals = ["DAILY", "WEEKLY", "MONTHLY", "YEARLY"];
          recurringInterval = intervals[Math.floor(Math.random() * intervals.length)];
          
          if (recurringInterval === "DAILY") nextRecurringDate = addDays(date, 1);
          if (recurringInterval === "WEEKLY") nextRecurringDate = addDays(date, 7);
          if (recurringInterval === "MONTHLY") nextRecurringDate = addDays(date, 30);
          if (recurringInterval === "YEARLY") nextRecurringDate = addDays(date, 365);
        }

        transactions.push({
          type,
          amount,
          description: `${type === "INCOME" ? "Received" : "Paid for"} ${category}`,
          date,
          category,
          status: "COMPLETED",
          isRecurring,
          recurringInterval,
          nextRecurringDate,
          userId: USER_ID,
          accountId: ACCOUNT_ID,
          createdAt: date,
          updatedAt: date,
        });

        totalBalance += type === "INCOME" ? amount : -amount;
      }
    }

    // ✅ clear old transactions for this account
    await transactionModel.deleteMany({accountId: ACCOUNT_ID});

    // ✅ insert all new transactions
    await transactionModel.insertMany(transactions);

    // ✅ update account balance
    await accountModel.findByIdAndUpdate(
      ACCOUNT_ID,
      {$set: {balance: totalBalance}},
      {new: true},
    );

    console.log(`✅ Created ${transactions.length} transactions`);
    return {
      success: true,
      message: `Created ${transactions.length} transactions`,
    };
  } catch (error) {
    console.error("Error seeding transactions:", error);
    return {success: false, error: error.message};
  }
}
