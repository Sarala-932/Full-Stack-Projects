import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        clerkUserId: {
            type: String,
            unique: true,
            required: true,
            index: true,
        },

        email: {
            type: String,
            unique: true,
            required: true,
            lowercase: true,
            trim: true,
        },
        name: {
            type: String,
            trim: true,
        },

        imageUrl: {
            type: String,
        },
        currency: {
            type: String,
            default: "INR",
        },
    },
    {
        timestamps: true,
    },
);

const userModel = mongoose.model("User", userSchema);

export default userModel;
