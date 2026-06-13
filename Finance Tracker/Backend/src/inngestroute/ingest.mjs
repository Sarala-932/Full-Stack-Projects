import express from "express";
import {serve} from "inngest/express";

import {inngest} from "../inngest/client.mjs";
import {checkBudgetAlerts} from "../inngest/functions.mjs";

const router = express.Router();

router.use("/", serve({client: inngest, functions: [checkBudgetAlerts]}));

export default router;
