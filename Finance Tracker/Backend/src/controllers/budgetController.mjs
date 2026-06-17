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
    const budget = await budgetModel.findOne({userId: user._id, accountId: accountObjectId}).lean();

    // get current month start and end
    const currentDate = new Date();
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const endOfMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
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
          _id: "$category",
          totalExpenses: {$sum: "$amount"},
        },
      },
    ]);

    let currentExpenses = 0;
    const categoryExpenses = {};
    
    expenses.forEach(exp => {
      const cat = exp._id || "other";
      currentExpenses += exp.totalExpenses;
      categoryExpenses[cat] = exp.totalExpenses;
    });

    return res.status(200).json({
      success: true,
      data: {
        budget: budget || null,
        currentExpenses,
        categoryExpenses,
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

    const {amount, accountId, categoryLimits} = req.body;

    if (!accountId || !mongoose.Types.ObjectId.isValid(accountId)) {
      return res.status(400).json({success: false, message: "Invalid account id"});
    }

    if (!amount || isNaN(amount)) {
      return res.status(400).json({success: false, message: "Invalid amount"});
    }

    const accountObjectId = new mongoose.Types.ObjectId(accountId);

    // ✅ upsert → update if exists, create if not
    const budget = await budgetModel
      .findOneAndUpdate(
        {userId: user._id, accountId: accountObjectId},
        {
          amount: parseFloat(amount),
          categoryLimits: categoryLimits || [],
          lastAlertSent: null
        },
        {new: true, upsert: true},
      )
      .lean();

    return res.status(200).json({success: true, data: budget});
  } catch (error) {
    return res.status(500).json({success: false, message: error.message});
  }
};

export {getCurrentBudget, updateBudget};
