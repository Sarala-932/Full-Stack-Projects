import mongoose from "mongoose";

const investmentSchema = new mongoose.Schema(
    {
        assetName: {
            type: String,
            required: true,
            trim: true,
        },
        assetType: {
            type: String,
            enum: ["STOCK", "MUTUAL_FUND", "CRYPTO", "FD", "REAL_ESTATE", "GOLD", "LIC", "OTHER"],
            required: true,
        },
        symbol: {
            type: String,
            trim: true, // Used for Yahoo Finance or mfapi to fetch live price
        },
        quantity: {
            type: Number,
            required: true,
            min: [0, "Quantity cannot be negative"],
        },
        purchasePrice: {
            type: Number,
            required: true,
            min: [0, "Purchase price cannot be negative"],
        },
        currentPrice: {
            type: Number,
            required: true,
            min: [0, "Current price cannot be negative"],
        },
        purchaseDate: {
            type: Date,
            required: true,
        },
        notes: {
            type: String,
            trim: true,
            maxlength: [500, "Notes too long"],
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

const investmentModel = mongoose.model("Investment", investmentSchema);
export default investmentModel;
