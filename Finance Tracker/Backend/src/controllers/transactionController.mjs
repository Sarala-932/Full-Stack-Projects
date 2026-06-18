import transactionModel from "../models/transactionModel.mjs";
import accountModel from "../models/accountModel.mjs";
import userModel from "../models/userModel.mjs";
import mongoose from "mongoose";
import aj from "../lib/arcjet.mjs";
import {GoogleGenerativeAI} from "@google/generative-ai";
import config from "../../config.mjs";

const genAi = new GoogleGenerativeAI(config.geminiApiKey);

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

        //Arcjet to add rate limiting
        const decision = await aj.protect(req, {
            userId: clerkUserId,
            requested: 1, // Specify how many tokens to consume
        });

        if (decision.isDenied()) {
            if (decision.reason.isRateLimit()) {
                const {remaining, reset} = decision.reason;
                console.error({
                    code: "RATE_LIMIT_EXCEEDED",
                    details: {
                        remaining,
                        resetInSeconds: reset,
                    },
                });

                return res.status(429).json({
                    success: false,
                    message: "Too many requests. Please try again later.",
                });
            }

            return res.status(403).json({success: false, message: "Request blocked"});
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

        await accountModel.findByIdAndUpdate(data.accountId, {balance: newBalance}, {session});

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

            if (!transaction.accountId || !mongoose.Types.ObjectId.isValid(transaction.accountId)) {
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

            if (isRecurring && !validRecurringIntervals.includes(transaction.recurringInterval)) {
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
            ...new Set(normalizedTransactions.map((transaction) => transaction.accountId.toString())),
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

        const createdTransactions = await transactionModel.insertMany(normalizedTransactions, {session});

        const accountBalanceChanges = normalizedTransactions.reduce((acc, transaction) => {
            const accountId = transaction.accountId.toString();
            const change = transaction.type === "EXPENSE" ? -transaction.amount : transaction.amount;

            acc[accountId] = (acc[accountId] || 0) + change;
            return acc;
        }, {});

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

export const scanReceipt = async (req, res) => {
    try {
        const file = req.file;
        if (!file) {
            return res.status(400).json({success: false, message: "No file provided"});
        }

        const model = genAi.getGenerativeModel({model: "gemini-2.5-flash"});

        // multer memoryStorage provides the file buffer directly
        const base64String = file.buffer.toString("base64");

        const prompt = `
            Analyze this receipt image and extract the following information in JSON format:
            - Total amount (just the number)
            - Date (in ISO format)
            - Description or items purchased (brief summary)
            - Merchant/store name
            - Suggested category (one of: housing,transportation,groceries,utilities,entertainment,food,shopping,healthcare,education,personal,travel,insurance,gifts,bills,other-expense)
            
            Only respond with valid JSON in this exact format:
            {
                "amount": number,
                "date": "ISO date string or empty string if not found",
                "description": "string",
                "merchantName": "string",
                "category": "string"
            }

            If it's not a receipt, return an empty object {}
        `;

        const result = await model.generateContent([
            {
                inlineData: {
                    data: base64String,
                    mimeType: file.mimetype,
                },
            },
            prompt,
        ]);

        const response = await result.response;
        const text = response.text();
        const cleanedText = text.replace(/```(?:json)?\n?/g, "").trim();

        try {
            const data = JSON.parse(cleanedText);

            // Check if it's an empty object (not a receipt)
            if (Object.keys(data).length === 0) {
                return res.status(400).json({success: false, message: "Invalid receipt image"});
            }

            // Fallback to current date if Gemini couldn't find a date
            const parsedDate = data.date ? new Date(data.date) : new Date();
            const validDate = isNaN(parsedDate.getTime()) ? new Date() : parsedDate;

            return res.status(200).json({
                success: true,
                data: {
                    amount: parseFloat(data.amount) || 0,
                    date: validDate,
                    description: data.description || "Expense",
                    category: data.category || "other-expense",
                    merchantName: data.merchantName || "Unknown Merchant",
                },
            });
        } catch (parseError) {
            console.error("Error parsing JSON response:", parseError);
            return res.status(500).json({success: false, message: "Invalid response format from Gemini"});
        }
    } catch (error) {
        console.error("Error scanning receipt:", error);
        
        // Extract a readable error message from Gemini API if possible
        const errorMessage = error?.message || "Failed to scan receipt";
        
        // Return 500 but include the actual reason (e.g. Rate Limit, Quota Exceeded, 503 Service Unavailable)
        return res.status(500).json({success: false, message: errorMessage});
    }
};

export const getTransaction = async (req, res) => {
    try {
        const clerkUserId = req.userId;
        if (!clerkUserId) {
            return res.status(401).json({success: false, message: "Unauthorized"});
        }

        const user = await userModel.findOne({clerkUserId}).lean();
        if (!user) {
            return res.status(404).json({success: false, message: "User not found"});
        }

        const transaction = await transactionModel.findOne({
            _id: req.params.id,
            userId: user._id,
        }).lean();

        if (!transaction) {
            return res.status(404).json({success: false, message: "Transaction not found"});
        }

        return res.status(200).json({
            success: true,
            data: transaction,
        });
    } catch (error) {
        console.error("Error fetching transaction:", error);
        return res.status(500).json({success: false, message: error.message || "Server Error"});
    }
};

export const updateTransaction = async (req, res) => {
    let session;
    try {
        const id = req.params.id;
        const data = req.body;
        const clerkUserId = req.userId;

        if (!clerkUserId) {
            return res.status(401).json({success: false, message: "Unauthorized"});
        }

        const user = await userModel.findOne({clerkUserId}).lean();
        if (!user) {
            return res.status(404).json({success: false, message: "User not found"});
        }

        // Get original transaction to calculate balance change
        const originalTransaction = await transactionModel.findOne({
            _id: id,
            userId: user._id,
        }).lean();

        if (!originalTransaction) {
            return res.status(404).json({success: false, message: "Transaction not found"});
        }

        // Calculate balance changes
        const oldBalanceChange =
            originalTransaction.type === "EXPENSE"
                ? -originalTransaction.amount
                : originalTransaction.amount;

        const newBalanceChange =
            data.type === "EXPENSE" ? -data.amount : data.amount;

        const netBalanceChange = newBalanceChange - oldBalanceChange;

        session = await mongoose.startSession();
        session.startTransaction();

        // Prepare update data
        const updateData = {...data};
        if (data.isRecurring && data.recurringInterval) {
            updateData.nextRecurringDate = calculateNextRecurringDate(data.date || originalTransaction.date, data.recurringInterval);
        } else {
            updateData.nextRecurringDate = null;
        }

        // Update transaction
        const updatedTransaction = await transactionModel.findOneAndUpdate(
            {_id: id, userId: user._id},
            {$set: updateData},
            {new: true, session}
        );

        // Update account balance
        const targetAccountId = data.accountId || originalTransaction.accountId;
        await accountModel.findByIdAndUpdate(
            targetAccountId,
            {$inc: {balance: netBalanceChange}},
            {session}
        );

        await session.commitTransaction();

        return res.status(200).json({
            success: true,
            data: updatedTransaction,
        });

    } catch (error) {
        if (session) await session.abortTransaction();
        console.error("Error updating transaction:", error);
        return res.status(500).json({success: false, message: error.message || "Server Error"});
    } finally {
        if (session) session.endSession();
    }
};
