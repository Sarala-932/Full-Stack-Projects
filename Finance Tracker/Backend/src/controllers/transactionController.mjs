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
