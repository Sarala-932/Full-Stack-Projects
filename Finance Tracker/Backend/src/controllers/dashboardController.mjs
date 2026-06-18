import accountModel from "../models/accountModel.mjs";
import userModel from "../models/userModel.mjs";
import transactionModel from "../models/transactionModel.mjs";

const createAccount = async (req, res) => {
    try {
        const clerkUserId = req.userId;
        if (!clerkUserId) {
            return res.status(401).send({message: "Unauthorized"});
        }

        const user = await userModel.findOne({clerkUserId}).select("_id").lean();
        if (!user) {
            return res.status(404).send({message: "User not found"});
        }

        const data = req.body;

        if (!data.accountNumber) {
            return res.status(400).send({message: "Account number is required"});
        }
        if (!data.bankName) {
            return res.status(400).send({message: "Bank name is required"});
        }
        if (!data.name) {
            return res.status(400).send({message: "Account name is required"});
        }
        if (!data.type) {
            return res.status(400).send({message: "Account type is required"});
        }
      
        if (data.balance === undefined || data.balance === null || data.balance === "") {
            return res.status(400).send({message: "Balance amount is required"});
        }
        if (!data.currency) {
            return res.status(400).send({message: "Currency type is required"});
        }

        const existingAccountNumber = await accountModel.findOne({
            accountNumber: data.accountNumber,
        });
        if (existingAccountNumber) {
            return res.status(400).send({message: "Account number already exists"});
        }

        const existingAccount = await accountModel.findOne({
            userId: user._id,
            name: data.name,
        });

        if (existingAccount) {
            return res.status(400).send({message: "Account with this name already exists"});
        }

        const balanceFloat = parseFloat(data.balance);

        if (isNaN(balanceFloat)) {
            return res.status(400).send({message: "Invalid balance amount"});
        }

        const extstingAccountsCount = await accountModel.countDocuments({userId: user._id});
        const shouldBeDefault = extstingAccountsCount === 0 ? true : data.isDefault;

        if (shouldBeDefault) {
            await accountModel.updateMany({userId: user._id, isDefault: true}, {$set: {isDefault: false}});
        }

        const account = await accountModel.create({
            accountNumber: data.accountNumber,
            bankName: data.bankName,
            name: data.name,
            type: data.type,
            balance: balanceFloat,
            currency: data.currency || "INR",
            isDefault: shouldBeDefault,
            userId: user._id,
        });

        return res.status(201).send({message: "Account created successfully", account});
    } catch (error) {
        return res.status(500).send({message: "Internal Server Error", error: error.message});
    }
};

const getUserAccounts = async (req, res) => {
    try {
        const clerkUserId = req.userId;
        if (!clerkUserId) {
            return res.status(401).send({message: "Unauthorized"});
        }

        const user = await userModel.findOne({clerkUserId}).select("_id").lean();
        if (!user) {
            return res.status(404).send({message: "User not found"});
        }

        const accounts = await accountModel.find({userId: user._id}).sort({createdAt: -1}).lean();

        return res.status(200).send(accounts);
    } catch (error) {
        return res.status(500).send({message: "Internal Server Error", error: error.message});
    }
};

const getDashboardData = async (req, res) => {
    try {
        const clerkUserId = req.userId;
        if (!clerkUserId) {
            return res.status(401).send({message: "Unauthorized"});
        }

        const user = await userModel.findOne({clerkUserId}).select("_id").lean();
        if (!user) {
            return res.status(404).send({message: "User not found"});
        }

        const transactions = await transactionModel.find({userId: user._id}).sort({date: -1}).lean();

        return res.status(200).send(transactions);
    } catch (error) {
        return res.status(500).send({message: "Internal Server Error", error: error.message});
    }
};

export {createAccount, getUserAccounts, getDashboardData};
