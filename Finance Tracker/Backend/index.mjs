import "dotenv/config";
import express from "express";
import mongoose from "mongoose";
import router from "./src/route.mjs";
import inngestRouter from "./src/inngestroute/ingestRoutes.mjs";
import config from "./config.mjs";
import {emailTemplate} from "./src/lib/emailTemplate.js";
import {clerkMiddleware} from "@clerk/express";

import cors from "cors";

const app = express();
app.use(express.json());
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

app.use("/api/inngest", inngestRouter);
app.use("/", router);

app.get("/api/preview-email", (req, res) => {
    const html = emailTemplate({
        userName: "John Doe",
        type: "budget-alert", // Change this to "monthly-report" to see the other template!
        data: {
            percentageUsed: 85.5,
            budgetAmount: 1000,
            totalExpenses: 855,
            accountName: "Main Bank Account",
        },
    });
    res.send(html);
});

app.listen(config.port, () => {
    console.log(`Server is running on port ${config.port}`);
});
