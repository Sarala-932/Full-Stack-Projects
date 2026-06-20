import {getAuth} from "@clerk/express";
import userModel from "../models/userModel.mjs";

const authenticate = async (req, res, next) => {
    try {
        const {userId} = getAuth(req);

        if (!userId) {
            return res.status(401).send({message: "Unauthorized"});
        }

        const user = await userModel.findOne({ clerkUserId: userId }).select("_id").lean();
        
        if (!user) {
            return res.status(404).send({message: "User not found. Please register first."});
        }

        req.userId = userId;
        req.user = user;
        next();
    } catch (error) {
        return res.status(500).send({message: "Internal Server Error", error: error.message});
    }
};

export default authenticate;
