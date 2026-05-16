import accountModel from "../models/accountModel.mjs";
import userModel from "../models/userModel.mjs";
import transactionModel from "../models/transactionModel.mjs";

const updateDefaultAccount = async (req, res) => {
  try {
    const clerkUserId = req.userId;
    if (!clerkUserId) {
      return res.status(401).send({message: "Unauthorized"});
    }

    const user = await userModel.findOne({clerkUserId});
    if (!user) {
      return res.status(404).send({message: "User not found"});
    }

    // for testing
    // const user = await userModel.findById("69e511c4f568ca7dc4563289");

    // if (!user) {
    //   return res.status(404).send({message: "User not found"});
    // }

    const {accountId} = req.params;

    const accountExists = await accountModel.findOne({
      _id: accountId,
      userId: user._id,
    });

    if (!accountExists) {
      return res.status(404).json({success: false, message: "Account not found"});
    }
    // unset all existing default accounts for this user
    await accountModel.updateMany(
      {userId: user._id, isDefault: true},
      {$set: {isDefault: false}},
    );
    // set new default account
    const updatedAccount = await accountModel.findOneAndUpdate(
      {_id: accountId, userId: user._id},
      {$set: {isDefault: true}},
      {new: true},
    );

    return res.status(200).send({
      success: true,
      data: updatedAccount,
      message: "Default account updated successfully",
    });
  } catch (error) {
    return res.status(500).send({success: false, message: error.message});
  }
};

const getAccountWithTransactions = async (req, res) => {
  try {
    const clerkUserId = req.userId;
    if (!clerkUserId) {
      return res.status(401).send({message: "Unauthorized"});
    }

    const user = await userModel.findOne({clerkUserId}).select("_id").lean();
    if (!user) {
      return res.status(404).send({message: "User not found"});
    }

    const {accountId} = req.params;

    const account = await accountModel
      .findOne({
        _id: accountId,
        userId: user._id,
      })
      .lean();

    if (!account) {
      return res.status(404).json({success: false, message: "Account not found"});
    }

    const transactions = await transactionModel
      .find({
        accountId: accountId,
        userId: user._id,
      })
      .sort({date: -1})
      .lean();

    return res.status(200).send({
      ...account,
      transactions,
      transactionCount: transactions.length,
      success: true,
      message: "Account with transactions fetched successfully",
    });
  } catch (error) {
    return res.status(500).send({success: false, message: error.message});
  }
};

const bulkDeleteTransactions = async (req, res) => {
  try {
    const clerkUserId = req.userId;
    if (!clerkUserId) {
      return res.status(401).send({message: "Unauthorized"});
    }

    const user = await userModel.findOne({clerkUserId});
    if (!user) {
      return res.status(404).send({message: "User not found"});
    }

    const {transactionIds} = req.body;
    const {accountId} = req.params;

    const account = await accountModel
      .findOne({
        _id: accountId,
        userId: user._id,
      })
      .lean();

    if (!account) {
      return res.status(404).json({success: false, message: "Account not found"});
    }

    if (!transactionIds || transactionIds.length === 0) {
      return res
        .status(400)
        .send({success: false, message: "No transaction ids provided"});
    }

    // get all transactions to calculate balance changes
    const transactions = await transactionModel.find({
      _id: {$in: transactionIds},
      userId: user._id,
    });

    if (transactions.length === 0) {
      return res.status(404).json({success: false, message: "No transactions found"});
    }

    // calculate balance change per account
    const accountBalanceChanges = transactions.reduce((acc, transaction) => {
      const change =
        transaction.type === "EXPENSE" ? transaction.amount : -transaction.amount;

      acc[transaction.accountId] = (acc[transaction.accountId] || 0) + change;
      return acc;
    }, {});

    // delete all transactions
    await transactionModel.deleteMany({
      _id: {$in: transactionIds},
      userId: user._id,
    });

    // update balance for each affected account
    for (const [accountId, balanceChange] of Object.entries(accountBalanceChanges)) {
      await accountModel.findByIdAndUpdate(
        accountId,
        {$inc: {balance: balanceChange}},
        {new: true},
      );
    }

    return res
      .status(200)
      .send({success: true, message: "Transactions deleted successfully"});
  } catch (error) {
    return res.status(500).send({success: false, message: error.message});
  }
};

export {updateDefaultAccount, getAccountWithTransactions, bulkDeleteTransactions};
