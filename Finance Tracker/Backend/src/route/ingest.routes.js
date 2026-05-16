import express from "express";
import {serve} from "inngest/express";

import {inngest} from "../inngest/client.js";
import {functions} from "../inngest/functions.js";

const router = express.Router();

router.use("/", serve({client: inngest, functions}));

export default router;
