import express from "express";
import mongoose from "mongoose";
import router from "./src/route.mjs";
import config from "./config.mjs";
import {clerkMiddleware} from "@clerk/express";
import cookieParser from "cookie-parser";
import cors from "cors";

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(clerkMiddleware());
app.use(
    cors({
        credentials: true,
        origin: "http://localhost:5173",
    }),
);

mongoose
    .connect(config.mongoURI)
    .then(() => {
        console.log("Connected to Database...");
    })
    .catch((err) => {
        console.log("MongoDb connection error", err);
    });

app.use("/", router);

app.listen(config.port, () => {
    console.log(`Server is running on port ${config.port}`);
});
