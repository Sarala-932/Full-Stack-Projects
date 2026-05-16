import mongoose from "mongoose";

// Account Model
const accountSchema = new mongoose.Schema(
  {
    accountNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    bankName: {
      type: String,
      required: true,
      trim: true,
      enum: [
        "State Bank of India",
        "HDFC Bank",
        "ICICI Bank",
        "IDFC Bank",
        "Axis Bank",
        "Kotak Mahindra Bank",
        "Punjab National Bank",
        "Bank of Baroda",
        "Bank of India",
        "UCO Bank",
        "Odisha Gramya Bank",
        "Central Bank of India",
        "Canara Bank",
        "IndusInd Bank",
        "Yes Bank",
        "Other",
      ],
    },
    name: {
      type: String,
      required: false,
      trim: true,
    },
    type: {
      type: String,
      enum: ["CURRENT", "SAVINGS"],
      required: true,
    },
    balance: {
      type: Number,
      default: 0,
      min: [0, "Balance cannot be negative"],
    },
    currency: {
      type: String,
      default: "INR",
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

accountSchema.index({ userId: 1, createdAt: -1 });

const accountModel = mongoose.model("Account", accountSchema);
export default accountModel;
