import transactionModel from "../models/transactionModel.mjs";
import accountModel from "../models/accountModel.mjs";
import userModel from "../models/userModel.mjs";
import mongoose from "mongoose";

const calculateNextRecurringDate = (date, interval) => {
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
};

const validTransactionTypes = ["INCOME", "EXPENSE"];
const validRecurringIntervals = ["DAILY", "WEEKLY", "MONTHLY", "YEARLY"];

export const createTransaction = async (req, res) => {
  try {
    const clerkUserId = req.userId;
    if (!clerkUserId) {
      return res.status(401).json({success: false, message: "Unauthorized"});
    }

    const user = await userModel.findOne({clerkUserId}).select("_id").lean();
    if (!user) {
      return res.status(404).json({success: false, message: "User not found"});
    }

    const data = req.body;

    const account = await accountModel.findOne({
      _id: data.accountId,
      userId: user._id,
    });

    if (!account) {
      return res.status(404).json({message: "Account not found"});
    }

    // Calculate new balance
    const balanceChange = data.type === "EXPENSE" ? -data.amount : data.amount;
    const newBalance = account.balance + balanceChange;

    // Create transaction and update account balance using mongoose session
    const session = await mongoose.startSession();
    session.startTransaction();

    const transaction = await transactionModel.create(
      [
        {
          ...data,
          userId: user._id,
          nextRecurringDate:
            data.isRecurring && data.recurringInterval
              ? calculateNextRecurringDate(data.date, data.recurringInterval)
              : null,
        },
      ],
      {session},
    );

    await accountModel.findByIdAndUpdate(
      data.accountId,
      {balance: newBalance},
      {session},
    );

    await session.commitTransaction();
    session.endSession();

    return res.status(201).send({success: true, data: transaction[0]});
  } catch (error) {
    return res.status(500).send({success: false, message: error.message});
  }
};

export const bulkCreateTransactions = async (req, res) => {
  let session;

  try {
    const clerkUserId = req.userId;
    if (!clerkUserId) {
      return res.status(401).json({success: false, message: "Unauthorized"});
    }

    const user = await userModel.findOne({clerkUserId}).select("_id").lean();
    if (!user) {
      return res.status(404).json({success: false, message: "User not found"});
    }

    const {transactions} = req.body;

    if (!Array.isArray(transactions) || transactions.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one transaction is required",
      });
    }

    const normalizedTransactions = [];

    for (const [index, transaction] of transactions.entries()) {
      const row = index + 1;
      const amount = Number(transaction.amount);
      const date = new Date(transaction.date);

      if (!validTransactionTypes.includes(transaction.type)) {
        return res.status(400).json({
          success: false,
          message: `Transaction ${row}: invalid transaction type`,
        });
      }

      if (!Number.isFinite(amount) || amount <= 0) {
        return res.status(400).json({
          success: false,
          message: `Transaction ${row}: amount must be greater than 0`,
        });
      }

      if (
        !transaction.accountId ||
        !mongoose.Types.ObjectId.isValid(transaction.accountId)
      ) {
        return res.status(400).json({
          success: false,
          message: `Transaction ${row}: valid account is required`,
        });
      }

      if (!transaction.category) {
        return res.status(400).json({
          success: false,
          message: `Transaction ${row}: category is required`,
        });
      }

      if (Number.isNaN(date.getTime())) {
        return res.status(400).json({
          success: false,
          message: `Transaction ${row}: valid date is required`,
        });
      }

      const isRecurring = Boolean(transaction.isRecurring);

      if (
        isRecurring &&
        !validRecurringIntervals.includes(transaction.recurringInterval)
      ) {
        return res.status(400).json({
          success: false,
          message: `Transaction ${row}: recurring interval is required`,
        });
      }

      normalizedTransactions.push({
        ...transaction,
        amount,
        date,
        isRecurring,
        recurringInterval: isRecurring ? transaction.recurringInterval : undefined,
        nextRecurringDate: isRecurring
          ? calculateNextRecurringDate(date, transaction.recurringInterval)
          : null,
        userId: user._id,
      });
    }

    const accountIds = [
      ...new Set(
        normalizedTransactions.map((transaction) =>
          transaction.accountId.toString(),
        ),
      ),
    ];

    session = await mongoose.startSession();
    session.startTransaction();

    const accounts = await accountModel
      .find({_id: {$in: accountIds}, userId: user._id})
      .select("_id")
      .session(session)
      .lean();

    if (accounts.length !== accountIds.length) {
      await session.abortTransaction();
      return res.status(404).json({
        success: false,
        message: "One or more accounts were not found",
      });
    }

    const createdTransactions = await transactionModel.insertMany(
      normalizedTransactions,
      {session},
    );

    const accountBalanceChanges = normalizedTransactions.reduce(
      (acc, transaction) => {
        const accountId = transaction.accountId.toString();
        const change =
          transaction.type === "EXPENSE"
            ? -transaction.amount
            : transaction.amount;

        acc[accountId] = (acc[accountId] || 0) + change;
        return acc;
      },
      {},
    );

    await accountModel.bulkWrite(
      Object.entries(accountBalanceChanges).map(([accountId, balanceChange]) => ({
        updateOne: {
          filter: {_id: accountId, userId: user._id},
          update: {$inc: {balance: balanceChange}},
        },
      })),
      {session},
    );

    await session.commitTransaction();

    return res.status(201).json({
      success: true,
      data: createdTransactions,
      message: "Transactions created successfully",
    });
  } catch (error) {
    if (session?.inTransaction()) {
      await session.abortTransaction();
    }

    return res.status(500).json({success: false, message: error.message});
  } finally {
    session?.endSession();
  }
};
