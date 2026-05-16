import mongoose from "mongoose";
import {seedTransactions} from "./seedTransactions.mjs";
import config from "../../config.mjs";

mongoose.connect(config.mongoURI).then(async () => {
  console.log("Connected to DB...");
  const result = await seedTransactions();
  console.log(result);
  mongoose.disconnect();
});
