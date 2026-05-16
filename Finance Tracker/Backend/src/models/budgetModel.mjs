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
    category: {
      type: String,
      enum: [
        "salary",
        "freelance",
        "investments",
        "business",
        "rental",
        "other-income",
        "housing",
        "transportation",
        "groceries",
        "utilities",
        "entertainment",
        "food",
        "shopping",
        "healthcare",
        "education",
        "personal",
        "travel",
        "insurance",
        "gifts",
        "bills",
      ],
      default: "other",
    },

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
      unique: true,
    },
  },
  {
    timestamps: true,
  },
);

const budgetModel = mongoose.model("Budget", budgetSchema);
export default budgetModel;
