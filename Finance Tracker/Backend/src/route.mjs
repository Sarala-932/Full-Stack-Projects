import express from "express";
import authenticate from "./middleware/authentication.mjs";
import registerUser from "./controllers/userController.mjs";
import {createAccount, getUserAccounts} from "./controllers/dashboardController.mjs";
import {
  getAccountWithTransactions,
  updateDefaultAccount,
  bulkDeleteTransactions,
} from "./controllers/accountController.mjs";
import {getCurrentBudget, updateBudget} from "./controllers/budgetController.mjs";

const router = express.Router();

router.get("/api", (req, res) => {
  res.send("API running successfully");
});

// create a user
router.post("/api/register", authenticate, registerUser);

// create a account
router.post("/create-account", authenticate, createAccount);

// get user accounts
router.get("/user-accounts", authenticate, getUserAccounts);

// update default account
router.patch("/account/:accountId", authenticate, updateDefaultAccount);

// get account with transactions
router.get("/account/:accountId", authenticate, getAccountWithTransactions);

// delete transactions
router.delete("/account/:accountId/bulk-delete", authenticate, bulkDeleteTransactions);

// get current budget
router.get("/:accountId/budget", authenticate, getCurrentBudget);

// update budget
router.post("/update", authenticate, updateBudget);

export default router;
