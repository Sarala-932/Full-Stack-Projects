import mongoose from "mongoose";

const budgetSchema = new mongoose.Schema(
    {
        amount: {
            type: Number,
            required: true,
            min: [0, "Amount cannot be negative"],
        },
        currency: {
            type: String,
            default: "INR",
        },
        accountId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Account",
            required: true,
        },
        categoryLimits: [
            {
                category: {
                    type: String,
                    required: true,
                },
                amount: {
                    type: Number,
                    required: true,
                    min: [0, "Amount cannot be negative"],
                },
            },
        ],

        period: {
            type: String,
            enum: ["daily", "weekly", "monthly", "yearly"],
            default: "monthly",
        },

        lastAlertSent: {
            type: Date,
        },

        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
    },
    {
        timestamps: true,
    },
);

budgetSchema.index({userId: 1, accountId: 1}, {unique: true});

const budgetModel = mongoose.model("Budget", budgetSchema);
export default budgetModel;
