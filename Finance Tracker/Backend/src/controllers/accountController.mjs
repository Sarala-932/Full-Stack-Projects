import accountModel from "../models/accountModel.mjs";
import userModel from "../models/userModel.mjs";
import transactionModel from "../models/transactionModel.mjs";

const updateDefaultAccount = async (req, res) => {
  try {
        const user = req.user;

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
        const user = req.user;

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
        const user = req.user;

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

const updateAccount = async (req, res) => {
  try {
        const user = req.user;

    const {accountId} = req.params;
    const {balance, name} = req.body;

    const account = await accountModel.findOne({
      _id: accountId,
      userId: user._id,
    });

    if (!account) {
      return res.status(404).json({success: false, message: "Account not found"});
    }

    const updateFields = {};
    if (balance !== undefined) {
      const balanceFloat = parseFloat(balance);
      if (isNaN(balanceFloat)) {
        return res.status(400).send({success: false, message: "Invalid balance amount"});
      }
      updateFields.balance = balanceFloat;
    }
    if (name) {
      updateFields.name = name;
    }

    const updatedAccount = await accountModel.findByIdAndUpdate(
      accountId,
      {$set: updateFields},
      {new: true}
    );

    return res.status(200).send({
      success: true,
      data: updatedAccount,
      message: "Account updated successfully",
    });
  } catch (error) {
    return res.status(500).send({success: false, message: error.message});
  }
};

const deleteAccount = async (req, res) => {
  try {
        const user = req.user;

    const {accountId} = req.params;

    const account = await accountModel.findOne({
      _id: accountId,
      userId: user._id,
    });

    if (!account) {
      return res.status(404).json({success: false, message: "Account not found"});
    }

    // Check 1: Cannot delete the default account
    // (This also prevents deleting the last account, as the last account is always default)
    if (account.isDefault) {
      return res.status(400).json({
        success: false,
        message: "You cannot delete the default account. Please make another account default first."
      });
    }

    // Check 2: Cannot delete if there are associated transactions
    const transactionCount = await transactionModel.countDocuments({
      accountId: accountId,
      userId: user._id,
    });

    if (transactionCount > 0) {
      return res.status(400).json({
        success: false,
        message: "You cannot delete an account that has transactions. Please delete all transactions first."
      });
    }

    // Delete the account
    await accountModel.findByIdAndDelete(accountId);

    return res.status(200).send({
      success: true,
      message: "Account deleted successfully",
    });
  } catch (error) {
    return res.status(500).send({success: false, message: error.message});
  }
};

export {updateDefaultAccount, getAccountWithTransactions, bulkDeleteTransactions, updateAccount, deleteAccount};
