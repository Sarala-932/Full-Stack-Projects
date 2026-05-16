import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
    {
        type: {
            type: String,
            enum: ["INCOME", "EXPENSE"],
            required: true,
        },
        amount: {
            type: Number,
            required: true,
            min: [0, "Amount cannot be negative"],
        },
        currency: {
            type: String,
            default: "INR",
        },
        description: {
            type: String,
            trim: true,
            maxlength: [500, "Description too long"],
        },
        date: {
            type: Date,
            required: true,
        },
        category: {
            type: String,
            required: true,
        },
        receiptUrl: {
            type: String,
        },
        isRecurring: {
            type: Boolean,
            default: false,
        },
        recurringInterval: {
            type: String,
            enum: ["DAILY", "WEEKLY", "MONTHLY", "YEARLY"],
        },
        nextRecurringDate: {
            type: Date,
        },
        lastProcessed: {
            type: Date,
        },
        status: {
            type: String,
            enum: ["PENDING", "COMPLETED", "FAILED"],
            default: "COMPLETED",
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        accountId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Account",
            required: true,
            index: true,
        },
    },
    {
        timestamps: true,
    },
);

const transactionModel = mongoose.model("Transaction", transactionSchema);
export default transactionModel;
