import "dotenv/config";
import express from "express";
import mongoose from "mongoose";
import inngestRouter from "./inngestroute/ingest.mjs";
import {emailTemplate} from "./emails/template.js";

mongoose
  .connect(process.env.MongoDB)
  .then(() => console.log("Ingest Server connected to MongoDB!"))
  .catch((err) => console.log("MongoDB error:", err));
  
const app = express();
app.use(express.json());

app.use("/api/inngest", inngestRouter);

// Preview route to see the email template in the browser!
app.get("/api/preview-email", (req, res) => {
  const html = emailTemplate({
    userName: "John Doe",
    type: "budget-alert",
    data: {
      percentageUsed: 85.5,
      budgetAmount: 1000,
      totalExpenses: 855,
      accountName: "Main Bank Account"
    }
  });
  res.send(html);
});

app.listen(5000, () => {
  console.log("Server running on http://localhost:5000");
});
