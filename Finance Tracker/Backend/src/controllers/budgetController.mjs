import budgetModel from "../models/budgetModel.mjs";
import transactionModel from "../models/transactionModel.mjs";
import userModel from "../models/userModel.mjs";
import mongoose from "mongoose";

// GET CURRENT BUDGET
const getCurrentBudget = async (req, res) => {
  try {
    const clerkUserId = req.userId;
    if (!clerkUserId) {
      return res.status(401).json({success: false, message: "Unauthorized"});
    }

    const user = await userModel.findOne({clerkUserId}).select("_id").lean();
    if (!user) {
      return res.status(404).json({success: false, message: "User not found"});
    }

    const {accountId} = req.params;

    if (!mongoose.Types.ObjectId.isValid(accountId)) {
      return res.status(400).json({success: false, message: "Invalid account id"});
    }
    const accountObjectId = new mongoose.Types.ObjectId(accountId);
    // get budget for this user
    const budget = await budgetModel.findOne({userId: user._id}).lean();

    // get current month start and end
    const currentDate = new Date();
    const testMonth = 3;
    const startOfMonth = new Date(currentDate.getFullYear(), testMonth, 1);
    const endOfMonth = new Date(
      currentDate.getFullYear(),
      testMonth + 1,
      0,
      23,
      59,
      59,
      999,
    );

    // calculate total expenses for current month
    const expenses = await transactionModel.aggregate([
      {
        $match: {
          userId: user._id,
          type: "EXPENSE",
          accountId: accountObjectId,
          date: {
            $gte: startOfMonth,
            $lte: endOfMonth,
          },
        },
      },
      {
        $group: {
          _id: null,
          totalExpenses: {$sum: "$amount"},
        },
      },
    ]);

    const currentExpenses = expenses.length > 0 ? expenses[0].totalExpenses : 0;

    return res.status(200).json({
      success: true,
      data: {
        budget: budget || null,
        currentExpenses,
      },
    });
  } catch (error) {
    return res.status(500).json({success: false, message: error.message});
  }
};

// UPDATE BUDGET

const updateBudget = async (req, res) => {
  try {
    const clerkUserId = req.userId;
    if (!clerkUserId) {
      return res.status(401).json({success: false, message: "Unauthorized"});
    }

    const user = await userModel.findOne({clerkUserId}).select("_id").lean();
    if (!user) {
      return res.status(404).json({success: false, message: "User not found"});
    }

    const {amount} = req.body;

    if (!amount || isNaN(amount)) {
      return res.status(400).json({success: false, message: "Invalid amount"});
    }

    // ✅ upsert → update if exists, create if not
    const budget = await budgetModel
      .findOneAndUpdate(
        {userId: user._id},
        {amount: parseFloat(amount), lastAlertSent: null},
        {new: true, upsert: true},
      )
      .lean();

    return res.status(200).json({success: true, data: budget});
  } catch (error) {
    return res.status(500).json({success: false, message: error.message});
  }
};

export {getCurrentBudget, updateBudget};
